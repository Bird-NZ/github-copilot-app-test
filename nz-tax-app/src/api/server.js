import express from 'express';
import multer from 'multer';
import { getSession, signin, signout, signup } from './modules/authStore.js';
import { createWorkspace, getWorkspace, listWorkspaces } from './modules/workspaceStore.js';
import { completionStatus, getQuestionSet, visibleQuestions } from './modules/questionnaireEngine.js';
import { addDocument, checklist, documents } from './modules/documentStore.js';

const app = express();
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

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



function requireSession(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'MISSING_TOKEN' });
  const session = getSession(token);
  if (!session) return res.status(401).json({ error: 'INVALID_SESSION' });
  req.session = session;
  next();
}

app.post('/workspaces', requireSession, (req, res) => {
  const { taxYearStart, taxYearEnd } = req.body || {};
  if (!taxYearStart || !taxYearEnd) return res.status(400).json({ error: 'MISSING_FIELDS' });
  const workspace = createWorkspace({ userId: req.session.userId, taxYearStart, taxYearEnd });
  res.status(201).json({ workspace });
});

app.get('/workspaces', requireSession, (req, res) => {
  const items = listWorkspaces(req.session.userId);
  res.json({ items });
});

app.get('/workspaces/:id', requireSession, (req, res) => {
  const item = getWorkspace(req.params.id, req.session.userId);
  if (!item) return res.status(404).json({ error: 'NOT_FOUND' });
  res.json({ workspace: item });
});



app.get('/questionnaire/schema', requireSession, (_req, res) => {
  res.json({ questions: getQuestionSet() });
});

app.post('/questionnaire/evaluate', requireSession, (req, res) => {
  const answers = req.body?.answers || {};
  const visible = visibleQuestions(answers);
  const status = completionStatus(answers);
  res.json({ visible, status });
});



app.post('/workspaces/:id/documents', requireSession, upload.single('file'), (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  if (!req.file) return res.status(400).json({ error: 'FILE_REQUIRED' });
  const doc = addDocument({
    workspaceId: workspace.id,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    docType: req.body?.docType || 'other'
  });
  return res.status(201).json({ document: doc });
});

app.get('/workspaces/:id/documents', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  return res.json({ items: documents(workspace.id) });
});

app.get('/workspaces/:id/checklist', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  return res.json({ checklist: checklist(workspace.id) });
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`nz-tax-app api listening on :${port}`);
});
