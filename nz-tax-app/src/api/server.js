import express from 'express';
import multer from 'multer';
import { getSession, signin, signout, signup } from './modules/authStore.js';
import { createWorkspace, getWorkspace, listWorkspaces, setWorkspaceQuestionnaireAnswers, updateWorkspace } from './modules/workspaceStore.js';
import { completionStatus, getQuestionSet, visibleQuestions } from './modules/questionnaireEngine.js';
import { addDocument, checklist, documents } from './modules/documentStore.js';
import { addIncome, listIncome } from './modules/incomeStore.js';
import { importTransactions, listTransactions, parseCsv } from './modules/cryptoStore.js';
import { explainIr3Values, getIr3Dictionary, getIr3Field } from './modules/ir3Service.js';
import { mapToIr3 } from './modules/mappingEngine.js';
import { calculateDraft } from './modules/calcEngine.js';
import { buildCsv, buildPdfDocument } from './modules/exportService.js';
import { listEvents, logEvent } from './modules/auditStore.js';
import { buildReview } from './modules/reviewService.js';

const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json());
const upload = multer({ dest: 'uploads/' });

const AUTH_MODE = process.env.AUTH_MODE || process.env.VITE_AUTH_MODE || 'local';
const NO_AUTH_MODE = AUTH_MODE === 'none';
const DEMO_SESSION = {
  userId: process.env.DEMO_USER_ID || 'demo-user',
  email: process.env.DEMO_USER_EMAIL || 'demo@nztax.local',
  createdAt: new Date().toISOString(),
};

app.get('/health', (_req, res) => res.json({ ok: true, authMode: AUTH_MODE }));
app.get('/health/live', (_req, res) => res.json({ ok: true, authMode: AUTH_MODE }));
app.get('/health/ready', (_req, res) => res.json({ ok: true, authMode: AUTH_MODE }));
app.get('/config', (_req, res) => res.json({ authMode: AUTH_MODE, noAuthMode: NO_AUTH_MODE }));

if (!NO_AUTH_MODE) {
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
} else {
  app.get('/auth/session', (_req, res) => {
    return res.json({ session: DEMO_SESSION, authMode: AUTH_MODE });
  });
}

function requireSession(req, res, next) {
  if (NO_AUTH_MODE) {
    req.session = DEMO_SESSION;
    return next();
  }

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
  logEvent(workspace.id, { action: 'workspace.create', actor: req.session.userId });
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

app.get('/workspaces/:id/questionnaire', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  const answers = workspace.questionnaireAnswers || {};
  const visible = visibleQuestions(answers);
  const status = completionStatus(answers);
  return res.json({ answers, visible, status });
});

app.put('/workspaces/:id/questionnaire', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  const answers = req.body?.answers || {};
  const updated = setWorkspaceQuestionnaireAnswers(workspace.id, req.session.userId, answers);
  const visible = visibleQuestions(updated.questionnaireAnswers || {});
  const status = completionStatus(updated.questionnaireAnswers || {});
  logEvent(workspace.id, { action: 'questionnaire.save', actor: req.session.userId, meta: { answeredVisible: status.answeredVisible, totalVisible: status.totalVisible } });
  return res.json({ answers: updated.questionnaireAnswers, visible, status });
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
  logEvent(workspace.id, { action: 'document.upload', actor: req.session.userId, meta: { docType: doc.docType } });
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

app.post('/workspaces/:id/income/:type', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  try {
    const item = addIncome(workspace.id, req.params.type, req.body || {});
    updateWorkspace(workspace.id, req.session.userId, {});
    logEvent(workspace.id, { action: `income.add.${req.params.type}`, actor: req.session.userId });
    return res.status(201).json({ item });
  } catch (err) {
    if (err.message === 'INVALID_TYPE') return res.status(400).json({ error: 'INVALID_TYPE' });
    return res.status(500).json({ error: 'INCOME_CREATE_FAILED' });
  }
});

app.get('/workspaces/:id/income', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  return res.json({ income: listIncome(workspace.id) });
});

app.get('/workspaces/:id/income/:type', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  try {
    return res.json({ items: listIncome(workspace.id, req.params.type) });
  } catch (err) {
    if (err.message === 'INVALID_TYPE') return res.status(400).json({ error: 'INVALID_TYPE' });
    return res.status(500).json({ error: 'INCOME_LIST_FAILED' });
  }
});

app.post('/workspaces/:id/crypto/import-csv', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  const csv = req.body?.csv;
  if (!csv || typeof csv !== 'string') return res.status(400).json({ error: 'CSV_REQUIRED' });
  const rows = parseCsv(csv);
  const result = importTransactions(workspace.id, rows);
  updateWorkspace(workspace.id, req.session.userId, {});
  logEvent(workspace.id, { action: 'crypto.import_csv', actor: req.session.userId, meta: { imported: result.imported } });
  return res.status(201).json({ ...result });
});

app.get('/workspaces/:id/crypto/transactions', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  return res.json({ items: listTransactions(workspace.id) });
});

app.get('/ir3/fields', requireSession, (_req, res) => {
  return res.json(getIr3Dictionary());
});

app.get('/ir3/fields/:ref', requireSession, (req, res) => {
  const f = getIr3Field(req.params.ref);
  if (!f) return res.status(404).json({ error: 'NOT_FOUND' });
  return res.json({ field: f });
});

app.get('/workspaces/:id/ir3/map', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  const income = listIncome(workspace.id);
  const cryptoTx = listTransactions(workspace.id);
  const map = mapToIr3({ income, cryptoTx, adjustments: workspace.adjustments || {} });
  return res.json({ map });
});

app.get('/workspaces/:id/ir3/calc', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  const income = listIncome(workspace.id);
  const cryptoTx = listTransactions(workspace.id);
  const map = mapToIr3({ income, cryptoTx, adjustments: workspace.adjustments || {} });
  const calc = calculateDraft(map);
  const explanation = explainIr3Values(map, calc);
  return res.json({ map, calc, explanation });
});

app.get('/workspaces/:id/export/draft', requireSession, async (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  const income = listIncome(workspace.id);
  const cryptoTx = listTransactions(workspace.id);
  const map = mapToIr3({ income, cryptoTx, adjustments: workspace.adjustments || {} });
  const calc = calculateDraft(map);
  const explanation = explainIr3Values(map, calc);
  const review = buildReview(workspace, map, calc, documents(workspace.id));
  const csv = buildCsv(map, calc, explanation);
  const pdf = await buildPdfDocument(map, calc, explanation);
  const json = {
    workspace: {
      id: workspace.id,
      taxYearStart: workspace.taxYearStart,
      taxYearEnd: workspace.taxYearEnd,
      status: workspace.status,
      updatedAt: workspace.updatedAt,
    },
    generatedAt: new Date().toISOString(),
    map,
    calc,
    explanation,
    review,
  };
  return res.json({ csv, pdf, json, explanation, review });
});

app.get('/workspaces/:id/review', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  const income = listIncome(workspace.id);
  const cryptoTx = listTransactions(workspace.id);
  const map = mapToIr3({ income, cryptoTx, adjustments: workspace.adjustments || {} });
  const calc = calculateDraft(map);
  const review = buildReview(workspace, map, calc, documents(workspace.id));
  return res.json({ review });
});

app.get('/workspaces/:id/audit', requireSession, (req, res) => {
  const workspace = getWorkspace(req.params.id, req.session.userId);
  if (!workspace) return res.status(404).json({ error: 'WORKSPACE_NOT_FOUND' });
  return res.json({ events: listEvents(workspace.id) });
});

const port = process.env.PORT || 8787;
app.listen(port, () => {
  console.log(`nz-tax-app api listening on :${port} (authMode=${AUTH_MODE})`);
});
