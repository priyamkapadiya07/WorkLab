const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  // GitHub Data
  github: {
    repositoryId: {
      type: String,
      sparse: true,
      index: true
    },
    name: String,
    url: String,
    visibility: String, // public, private
    language: String,
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    defaultBranch: String,
    lastSyncedAt: Date
  },
  // DevVault Data
  name: {
    type: String,
    required: true,
    index: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  customDescription: String,
  liveUrl: String,
  deploymentProvider: String, // Vercel, Netlify, Render, etc.
  deploymentStatus: {
    type: String,
    enum: ['Live', 'Unavailable', 'Checking', 'Unknown', 'Not deployed'],
    default: 'Unknown'
  },
  lastDeploymentCheck: Date,
  type: {
    type: String,
    enum: ['Website', 'Web App', 'Game', 'College Project', 'Client Project', 'Personal Project', 'Experiment', 'Other'],
    default: 'Personal Project',
    index: true
  },
  status: {
    type: String,
    enum: ['Planning', 'In Development', 'Completed', 'Maintenance', 'Archived'],
    default: 'Completed',
    index: true
  },
  technologies: [{
    type: String,
    index: true
  }],
  tags: [{
    type: String,
    index: true
  }],
  thumbnail: String,
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: Number,
    default: 0
  },
  notes: String,
  startDate: Date,
  completionDate: Date
}, {
  timestamps: true,
});

module.exports = mongoose.model('Project', projectSchema);
