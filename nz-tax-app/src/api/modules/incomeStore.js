import { v4 as uuid } from 'uuid';
import { readData, updateData } from './dataStore.js';

const EMPTY_BUCKET = () => ({
  paye: [],
  interest: [],
  dividends: [],
  other: []
});

function getBucket(workspaceId) {
  const state = readData();
  return state.incomeByWorkspace[workspaceId] || EMPTY_BUCKET();
}

export function addIncome(workspaceId, type, payload) {
  const bucket = getBucket(workspaceId);
  if (!bucket[type]) throw new Error('INVALID_TYPE');

  const row = { id: uuid(), ...payload, createdAt: new Date().toISOString() };

  updateData(state => {
    const next = state.incomeByWorkspace[workspaceId] || EMPTY_BUCKET();
    if (!next[type]) throw new Error('INVALID_TYPE');
    next[type].push(row);
    state.incomeByWorkspace[workspaceId] = next;
    return state;
  });

  return row;
}

export function listIncome(workspaceId, type = null) {
  const bucket = getBucket(workspaceId);
  if (!type) return bucket;
  if (!bucket[type]) throw new Error('INVALID_TYPE');
  return bucket[type];
}
