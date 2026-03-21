import { v4 as uuid } from 'uuid';

const incomesByWorkspace = new Map();

function getBucket(workspaceId) {
  if (!incomesByWorkspace.has(workspaceId)) {
    incomesByWorkspace.set(workspaceId, {
      paye: [],
      interest: [],
      dividends: [],
      other: []
    });
  }
  return incomesByWorkspace.get(workspaceId);
}

export function addIncome(workspaceId, type, payload) {
  const bucket = getBucket(workspaceId);
  if (!bucket[type]) throw new Error('INVALID_TYPE');
  const row = { id: uuid(), ...payload, createdAt: new Date().toISOString() };
  bucket[type].push(row);
  return row;
}

export function listIncome(workspaceId, type = null) {
  const bucket = getBucket(workspaceId);
  if (!type) return bucket;
  if (!bucket[type]) throw new Error('INVALID_TYPE');
  return bucket[type];
}
