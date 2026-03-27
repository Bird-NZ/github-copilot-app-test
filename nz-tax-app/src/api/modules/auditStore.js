import { readData, updateData } from './dataStore.js';

const ACTION_LABELS = {
  'workspace.create': 'Workspace created',
  'questionnaire.save': 'Questionnaire updated',
  'document.upload': 'Document uploaded',
  'crypto.import_csv': 'Crypto CSV imported',
};

const INCOME_TYPE_LABELS = {
  paye: 'PAYE',
  interest: 'Interest',
  dividends: 'Dividend',
  other: 'Other income',
};

function bucket(workspaceId) {
  return readData().auditByWorkspace[workspaceId] || [];
}

function titleCase(value) {
  return String(value || '')
    .split(/[_\-.\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildLabel(action) {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  if (action?.startsWith('income.add.')) {
    const incomeType = action.split('.').pop();
    return `${INCOME_TYPE_LABELS[incomeType] || titleCase(incomeType)} added`;
  }
  return titleCase(action);
}

function buildDetails(action, meta = {}) {
  if (action === 'document.upload' && meta.docType) {
    return `Type: ${titleCase(meta.docType)}`;
  }

  if (action === 'questionnaire.save') {
    const answered = Number(meta.answeredVisible || 0);
    const total = Number(meta.totalVisible || 0);
    if (total > 0) return `${answered}/${total} visible questions answered`;
  }

  if (action === 'crypto.import_csv') {
    const imported = Number(meta.imported || 0);
    return `${imported} transaction${imported === 1 ? '' : 's'} imported`;
  }

  return null;
}

function deriveCategory(action) {
  return String(action || 'other').split('.')[0] || 'other';
}

function enrichEvent(event, index) {
  const action = event.action || 'unknown';
  const meta = event.meta && typeof event.meta === 'object' ? event.meta : {};
  return {
    ...event,
    id: event.id || `${event.at || 'unknown'}:${action}:${index}`,
    action,
    category: deriveCategory(action),
    label: buildLabel(action),
    details: buildDetails(action, meta),
    meta,
  };
}

function matchesQuery(event, query) {
  if (!query) return true;
  const haystack = [
    event.label,
    event.details,
    event.action,
    event.category,
    event.actor,
    JSON.stringify(event.meta || {}),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function buildSummary(events) {
  const byCategory = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {});

  return {
    totalEvents: events.length,
    latestEventAt: events[0]?.at || null,
    byCategory,
  };
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

export function listEvents(workspaceId, options = {}) {
  const category = options.category ? String(options.category).toLowerCase() : null;
  const query = options.q ? String(options.q).trim() : '';
  const limit = Number(options.limit || 0);

  const allEvents = bucket(workspaceId)
    .map((event, index) => enrichEvent(event, index))
    .sort((left, right) => String(right.at || '').localeCompare(String(left.at || '')));

  const filteredEvents = allEvents.filter(event => {
    if (category && event.category !== category) return false;
    return matchesQuery(event, query);
  });

  return {
    events: limit > 0 ? filteredEvents.slice(0, limit) : filteredEvents,
    summary: buildSummary(filteredEvents),
    availableCategories: Object.keys(buildSummary(allEvents).byCategory).sort(),
    filters: {
      category,
      q: query || null,
      limit: limit > 0 ? limit : null,
    },
  };
}
