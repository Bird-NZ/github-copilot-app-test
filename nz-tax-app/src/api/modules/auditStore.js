import { readData, updateData } from './dataStore.js';

function bucket(workspaceId) {
  return readData().auditByWorkspace[workspaceId] || [];
}

export function logEvent(workspaceId, event) {
  const row = { at: new Date().toISOString(), ...event };
  updateData(state => {
    const next = state.auditByWorkspace[workspaceId] || [];
    next.push(row);
    state.auditByWorkspace[workspaceId] = next;
    return state;
  });
  return row;
}

export function listEvents(workspaceId) {
  return bucket(workspaceId);
}
