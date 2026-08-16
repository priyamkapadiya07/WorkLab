const express = require('express');
const axios = require('axios');
const Project = require('../models/Project');
const { authMiddleware } = require('./auth');

const router = express.Router();

router.use(authMiddleware);

// Get all projects for the user
router.get('/', async (req, res) => {
  try {
    const query = { userId: req.user._id };
    
    // Add filters if present in query params
    if (req.query.deploymentStatus) query.deploymentStatus = req.query.deploymentStatus;
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;
    
    const projects = await Project.find(query).sort({ updatedAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new project manually
router.post('/', async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      userId: req.user._id
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    // Only allow updating DevVault data, not GitHub data directly through this endpoint
    const updates = { ...req.body };
    delete updates.github; // Prevent overwriting github data
    
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check deployment status
router.post('/:id/check-deployment', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    if (!project.liveUrl) {
      project.deploymentStatus = 'Not deployed';
      await project.save();
      return res.json({ status: project.deploymentStatus });
    }

    try {
      // Use a timeout to prevent hanging
      const response = await axios.get(project.liveUrl, { timeout: 5000 });
      if (response.status >= 200 && response.status < 400) {
        project.deploymentStatus = 'Live';
      } else {
        project.deploymentStatus = 'Unavailable';
      }
    } catch (err) {
      project.deploymentStatus = 'Unavailable';
    }

    project.lastDeploymentCheck = new Date();
    await project.save();
    
    res.json({ status: project.deploymentStatus, lastChecked: project.lastDeploymentCheck });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync health for all deployed projects
router.post('/health-sync', async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id, liveUrl: { $exists: true, $ne: '' } });
    
    await Promise.all(projects.map(async (project) => {
      try {
        const response = await axios.get(project.liveUrl, { timeout: 5000 });
        if (response.status >= 200 && response.status < 400) {
          project.deploymentStatus = 'Live';
        } else {
          project.deploymentStatus = 'Unavailable';
        }
      } catch (err) {
        project.deploymentStatus = 'Unavailable';
      }
      project.lastDeploymentCheck = new Date();
      await project.save();
    }));

    const allProjects = await Project.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(allProjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
