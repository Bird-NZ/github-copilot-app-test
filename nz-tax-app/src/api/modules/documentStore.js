import { v4 as uuid } from 'uuid';
import { readData, updateData } from './dataStore.js';

const REQUIRED_DOC_TYPES = [
  'paye_summary',
  'interest_dividend_slips',
  'student_loan_statement',
  'crypto_csv',
  'donation_receipts'
];

function listFor(workspaceId) {
  return readData().documentsByWorkspace[workspaceId] || [];
}

function normalizeStoredEvidenceLinks(document = {}) {
  if (Array.isArray(document.evidenceLinks)) {
    return document.evidenceLinks;
  }

  if (document.evidenceLink) {
    return [document.evidenceLink];
  }

  return [];
}

function withNormalizedEvidenceLinks(document) {
  const evidenceLinks = normalizeStoredEvidenceLinks(document);
  return {
    ...document,
    evidenceLinks,
    evidenceLink: evidenceLinks.length === 1 ? evidenceLinks[0] : null,
  };
}

function normalizeDonationAmount(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) && amount > 0 ? Number(amount.toFixed(2)) : 0;
}

export function addDocument({ workspaceId, filename, originalName, mimeType, size, docType, donationAmount }) {
  const item = {
    id: uuid(),
    workspaceId,
    filename,
    originalName,
    mimeType,
    size,
    docType: docType || 'other',
    status: 'received',
    uploadedAt: new Date().toISOString(),
    donationAmount: docType === 'donation_receipts' ? normalizeDonationAmount(donationAmount) : 0,
    evidenceLinks: [],
    evidenceLink: null,
  };

  updateData(state => {
    const next = state.documentsByWorkspace[workspaceId] || [];
    next.push(item);
    state.documentsByWorkspace[workspaceId] = next;
    return state;
  });

  return item;
}

export function updateDocumentDonationAmount(workspaceId, documentId, donationAmount) {
  let updated = null;

  updateData(state => {
    const docs = state.documentsByWorkspace[workspaceId] || [];
    const index = docs.findIndex(doc => doc.id === documentId);
    if (index === -1) return state;

    docs[index] = withNormalizedEvidenceLinks({
      ...docs[index],
      donationAmount: docs[index].docType === 'donation_receipts' ? normalizeDonationAmount(donationAmount) : 0,
    });
    updated = docs[index];
    state.documentsByWorkspace[workspaceId] = docs;
    return state;
  });

  return updated;
}

export function updateDocumentEvidenceLink(workspaceId, documentId, evidenceLink) {
  let updated = null;
  const normalizedLinks = Array.isArray(evidenceLink)
    ? evidenceLink.filter(Boolean)
    : evidenceLink
      ? [evidenceLink]
      : [];

  updateData(state => {
    const docs = state.documentsByWorkspace[workspaceId] || [];
    const index = docs.findIndex(doc => doc.id === documentId);
    if (index === -1) return state;

    docs[index] = withNormalizedEvidenceLinks({
      ...docs[index],
      evidenceLinks: normalizedLinks,
      evidenceLink: normalizedLinks.length === 1 ? normalizedLinks[0] : null,
    });
    updated = docs[index];
    state.documentsByWorkspace[workspaceId] = docs;
    return state;
  });

  return updated;
}

export function documents(workspaceId) {
  return listFor(workspaceId).map(withNormalizedEvidenceLinks);
}

export function checklist(workspaceId) {
  const docs = listFor(workspaceId);
  return REQUIRED_DOC_TYPES.map(type => {
    const matches = docs.filter(d => d.docType === type);
    const status = matches.length === 0 ? 'missing' : 'received';
    return { docType: type, status, count: matches.length };
  });
}
