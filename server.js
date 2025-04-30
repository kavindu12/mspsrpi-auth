import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/github-auth', async (req, res) => {
  const { code } = req.body;

  try {
    // Step 1: Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.status(400).json({ error: 'Failed to retrieve access token' });
    }

    // Step 2: Use access token to get user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    });

    // Respond with user info (frontend expects { user: { login: ... } })
    res.json({ user: userResponse.data });

  } catch (error) {
    res.status(500).json({ error: 'GitHub OAuth flow failed', details: error.message });
  }
});
