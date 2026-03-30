import { readData, updateData } from './dataStore.js';

const ACTION_LABELS = {
  'workspace.create': 'Workspace created',
  'questionnaire.save': 'Questionnaire updated',
  'document.upload': 'Document uploaded',
  'document.donation_amount.save': 'Donation amount updated',
  'crypto.import_csv': 'Crypto CSV imported',
  'review.action_resolution.save': 'Reviewer action updated',
  'review.final_signoff.save': 'Reviewer final sign-off recorded',
  'review.final_signoff.stale': 'Reviewer final sign-off marked stale',
  'review.operator_handoff.acknowledge': 'Operator handoff acknowledged',
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

function describeEvidenceLink(meta = {}) {
  const evidenceLink = meta.evidenceLink;
  if (!evidenceLink) return 'Automatic link'
  if (evidenceLink.mode === 'none') return 'No evidence link'
  if (Array.isArray(evidenceLink)) {
    const labels = evidenceLink
      .map((item) => item?.supports || item?.section || null)
      .filter(Boolean)
    return labels.length > 0 ? `Manual links: ${labels.join(', ')}` : 'Manual evidence links saved'
  }
  if (evidenceLink.mode === 'manual') {
    return `Manual link: ${evidenceLink.supports || evidenceLink.section || 'custom evidence'}`
  }
  return 'Evidence link updated'
}

function buildDetails(action, meta = {}) {
  if (action === 'document.upload' && meta.docType) {
    const parts = [`Type: ${titleCase(meta.docType)}`]
    if (meta.docType === 'donation_receipts' && Number(meta.donationAmount || 0) > 0) {
      parts.push(`Donation total: ${Number(meta.donationAmount).toFixed(2)}`)
    }
    return parts.join(' — ')
  }

  if (action === 'document.donation_amount.save') {
    return `Document: ${meta.documentId || 'unknown'} — Donation total: ${Number(meta.donationAmount || 0).toFixed(2)}`
  }

  if (action === 'document.evidence_link.save') {
    const parts = [];
    if (meta.documentId) parts.push(`Document: ${meta.documentId}`)
    parts.push(describeEvidenceLink(meta))
    return parts.filter(Boolean).join(' — ')
  }

  if (action === 'adjustments.save') {
    const parts = [
      ['Donations', meta.donationAmount],
      ['PIE income', meta.pieIncome],
      ['PIE credits', meta.pieTaxCredits],
      ['Other tax deducted', meta.extraTaxDeducted],
      ['Student loan', meta.studentLoanRepayments],
    ]
      .filter(([, value]) => Number(value || 0) > 0)
      .map(([label, value]) => `${label}: ${Number(value).toFixed(2)}`)
    return parts.length > 0 ? parts.join(' · ') : 'Adjustment values updated'
  }

  if (action === 'review.action_resolution.save') {
    const title = meta.title || meta.actionId || 'reviewer action'
    const status = meta.status === 'resolved' ? 'Resolved' : 'Reopened'
    return meta.note ? `${status}: ${title} — ${meta.note}` : `${status}: ${title}`
  }

  if (action === 'review.final_signoff.save') {
    const signedAt = meta.signedOffAt ? ` at ${meta.signedOffAt}` : ''
    const override = meta.overrideReason ? ` — Override reason: ${meta.overrideReason}` : ''
    return `Final sign-off recorded${signedAt}${override}`
  }

  if (action === 'review.final_signoff.stale') {
    const reason = meta.staleReason ? ` — ${meta.staleReason}` : ''
    return `Final sign-off became stale${reason}`
  }

  if (action === 'review.operator_handoff.acknowledge') {
    const at = meta.acknowledgedAt ? ` at ${meta.acknowledgedAt}` : ''
    const note = meta.note ? ` — Note: ${meta.note}` : ''
    return `Operator acknowledged signed handoff${at}${note}`
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

  const overallSummary = buildSummary(allEvents);

  return {
    events: limit > 0 ? filteredEvents.slice(0, limit) : filteredEvents,
    summary: buildSummary(filteredEvents),
    overallSummary,
    availableCategories: Object.keys(overallSummary.byCategory).sort(),
    filters: {
      category,
      q: query || null,
      limit: limit > 0 ? limit : null,
    },
  };
}
