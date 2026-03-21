const eventsByWorkspace = new Map();

function bucket(workspaceId) {
  if (!eventsByWorkspace.has(workspaceId)) eventsByWorkspace.set(workspaceId, []);
  return eventsByWorkspace.get(workspaceId);
}

export function logEvent(workspaceId, event) {
  const row = { at: new Date().toISOString(), ...event };
  bucket(workspaceId).push(row);
  return row;
}

export function listEvents(workspaceId) {
  return bucket(workspaceId);
}
