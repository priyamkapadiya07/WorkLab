const express = require('express');
const axios = require('axios');
const Project = require('../models/Project');
const { authMiddleware } = require('./auth');

const router = express.Router();
router.use(authMiddleware);

// Fetch user's repositories from GitHub
router.get('/repositories', async (req, res) => {
  try {
    const response = await axios.get('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        Authorization: `Bearer ${req.user.githubAccessToken}`
      }
    });

    const repos = response.data;
    
    // Find which ones are already imported
    const existingProjects = await Project.find({ userId: req.user._id, 'github.repositoryId': { $exists: true } });
    const existingRepoIds = existingProjects.map(p => p.github.repositoryId);

    const formattedRepos = repos.map(repo => ({
      id: repo.id.toString(),
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      visibility: repo.visibility, // public, private
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      defaultBranch: repo.default_branch,
      updatedAt: repo.updated_at,
      isImported: existingRepoIds.includes(repo.id.toString())
    }));

    res.json(formattedRepos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Import a repository into DevVault
router.post('/import', async (req, res) => {
  try {
    const { repositoryId, name, description, url, visibility, language, stars, forks, defaultBranch } = req.body;
    
    // Check if already imported
    const existing = await Project.findOne({ userId: req.user._id, 'github.repositoryId': repositoryId });
    if (existing) {
      return res.status(400).json({ error: 'Repository already imported' });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

    const project = new Project({
      userId: req.user._id,
      name: name,
      slug: slug,
      customDescription: description || '',
      github: {
        repositoryId,
        name,
        url,
        visibility,
        language,
        stars,
        forks,
        defaultBranch,
        lastSyncedAt: new Date()
      }
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync existing project with latest GitHub stats
router.post('/sync/:projectId', async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, userId: req.user._id });
    if (!project || !project.github.repositoryId) {
      return res.status(404).json({ error: 'Project not found or not connected to GitHub' });
    }

    const response = await axios.get(`https://api.github.com/repositories/${project.github.repositoryId}`, {
      headers: {
        Authorization: `Bearer ${req.user.githubAccessToken}`
      }
    });

    const repo = response.data;
    
    // Update ONLY GitHub data
    project.github.name = repo.name;
    project.github.url = repo.html_url;
    project.github.visibility = repo.visibility;
    project.github.language = repo.language;
    project.github.stars = repo.stargazers_count;
    project.github.forks = repo.forks_count;
    project.github.defaultBranch = repo.default_branch;
    project.github.lastSyncedAt = new Date();

    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
