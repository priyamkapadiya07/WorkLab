const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

// 1. Redirect to GitHub OAuth
router.get('/github', (req, res) => {
  const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).send('GitHub Client ID is not configured on the server.');
  }

  const redirectUri = `${SERVER_URL}/api/auth/github/callback`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo%20user`;
  res.redirect(githubAuthUrl);
});

// 2. GitHub Callback
router.get('/github/callback', async (req, res) => {
  const { code } = req.query;
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';
  
  if (!code) {
    return res.redirect(`${CLIENT_URL}/login?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
      },
      {
        headers: {
          Accept: 'application/json'
        }
      }
    );

    const accessToken = tokenResponse.data.access_token;
    
    if (!accessToken) {
      return res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
    }

    // Get user profile from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const githubUser = userResponse.data;

    // Find or create user
    let user = await User.findOne({ githubId: githubUser.id.toString() });

    if (user) {
      user.githubAccessToken = accessToken;
      user.username = githubUser.login;
      user.displayName = githubUser.name || githubUser.login;
      user.avatarUrl = githubUser.avatar_url;
      user.profileUrl = githubUser.html_url;
      await user.save();
    } else {
      user = await User.create({
        githubId: githubUser.id.toString(),
        username: githubUser.login,
        displayName: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
        githubAccessToken: accessToken,
        profileUrl: githubUser.html_url
      });
    }

    // Create JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Redirect to dashboard
    res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (error) {
    console.error('GitHub Auth Error:', error.message);
    res.redirect(`${CLIENT_URL}/login?error=auth_failed`);
  }
});

// Middleware to protect routes
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('+githubAccessToken');
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 3. Get current user
router.get('/me', authMiddleware, (req, res) => {
  const user = req.user.toObject();
  delete user.githubAccessToken; // Don't send this to the frontend
  res.json(user);
});

// 4. Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  res.json({ success: true });
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
