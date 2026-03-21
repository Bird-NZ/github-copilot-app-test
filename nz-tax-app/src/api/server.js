import express from 'express';
import { getSession, signin, signout, signup } from './modules/authStore.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'MISSING_FIELDS' });
    const user = await signup(String(email).toLowerCase().trim(), String(password));
    return res.status(201).json({ user });
  } catch (err) {
    if (err.message === 'EMAIL_EXISTS') return res.status(409).json({ error: 'EMAIL_EXISTS' });
    return res.status(500).json({ error: 'SIGNUP_FAILED' });
  }
});

app.post('/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'MISSING_FIELDS' });
    const result = await signin(String(email).toLowerCase().trim(), String(password));
    return res.json(result);
  } catch (err) {
    if (err.message === 'INVALID_CREDENTIALS') return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
    return res.status(500).json({ error: 'SIGNIN_FAILED' });
  }
});

app.post('/auth/signout', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(400).json({ error: 'MISSING_TOKEN' });
  signout(token);
  return res.json({ ok: true });
});

app.get('/auth/session', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(400).json({ error: 'MISSING_TOKEN' });
  const session = getSession(token);
  if (!session) return res.status(401).json({ error: 'INVALID_SESSION' });
  return res.json({ session });
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`nz-tax-app api listening on :${port}`);
});
