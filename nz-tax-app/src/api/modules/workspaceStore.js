import { v4 as uuid } from 'uuid';

const workspaces = new Map();

export function createWorkspace({ userId = 'demo-user', taxYearStart, taxYearEnd }) {
  const id = uuid();
  const now = new Date().toISOString();
  const item = {
    id,
    userId,
    taxYearStart,
    taxYearEnd,
    status: 'in_progress',
    questionnaireAnswers: {},
    createdAt: now,
    updatedAt: now,
  };
  workspaces.set(id, item);
  return item;
}

export function listWorkspaces(userId = 'demo-user') {
  return Array.from(workspaces.values()).filter(w => w.userId === userId);
}

export function getWorkspace(id, userId = 'demo-user') {
  const w = workspaces.get(id);
  if (!w || w.userId !== userId) return null;
  return w;
}

export function updateWorkspace(id, userId = 'demo-user', patch = {}) {
  const current = getWorkspace(id, userId);
  if (!current) return null;
  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  workspaces.set(id, next);
  return next;
}

export function setWorkspaceQuestionnaireAnswers(id, userId = 'demo-user', answers = {}) {
  return updateWorkspace(id, userId, { questionnaireAnswers: answers });
}
