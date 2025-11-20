import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import { OAuth2Client } from 'google-auth-library';

const app = express();
const PORT = process.env.PORT || 4000;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'skillup-auth-backend' });
});

// POST /google-login { credential: <id_token> }
app.post('/google-login', async (req, res) => {
  try {
    const idToken = req.body?.credential || req.body?.id_token || req.body?.token;
    if (!idToken) return res.status(400).json({ error: 'Missing Google ID token (credential)' });
    if (!client) return res.status(500).json({ error: 'Server missing GOOGLE_CLIENT_ID env' });

    const ticket = await client.verifyIdToken({ idToken, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload) return res.status(401).json({ error: 'Invalid Google token' });

    const user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub,
      email_verified: payload.email_verified,
      iss: payload.iss,
      aud: payload.aud,
    };
    return res.json({ ok: true, provider: 'google', user });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(401).json({ error: 'Failed to verify Google token', details: String(err) });
  }
});

// POST /facebook-login { access_token }
app.post('/facebook-login', async (req, res) => {
  try {
    const accessToken = req.body?.access_token;
    if (!accessToken) return res.status(400).json({ error: 'Missing Facebook access_token' });

    // Fetch basic profile fields
    const fields = 'id,name,email,picture.width(256).height(256)';
    const url = `https://graph.facebook.com/me?fields=${encodeURIComponent(fields)}&access_token=${encodeURIComponent(accessToken)}`;
    const fbRes = await fetch(url);
    const data = await fbRes.json();
    if (!fbRes.ok) {
      return res.status(401).json({ error: 'Failed to verify Facebook token', details: data });
    }

    const user = {
      id: data.id,
      name: data.name,
      email: data.email || null,
      picture: data?.picture?.data?.url || null,
    };
    return res.json({ ok: true, provider: 'facebook', user });
  } catch (err) {
    console.error('Facebook login error:', err);
    return res.status(401).json({ error: 'Failed to verify Facebook token', details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Auth backend listening on http://localhost:${PORT}`);
});
