import { v4 as uuid } from 'uuid';

const workspaces = new Map();

export function createWorkspace({ userId = 'demo-user', taxYearStart, taxYearEnd }) {
  const id = uuid();
  const item = {
    id,
    userId,
    taxYearStart,
    taxYearEnd,
    status: 'in_progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
