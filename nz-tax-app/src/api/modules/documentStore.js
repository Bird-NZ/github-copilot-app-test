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

export function addDocument({ workspaceId, filename, originalName, mimeType, size, docType }) {
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

export function updateDocumentEvidenceLink(workspaceId, documentId, evidenceLink) {
  let updated = null;

  updateData(state => {
    const docs = state.documentsByWorkspace[workspaceId] || [];
    const index = docs.findIndex(doc => doc.id === documentId);
    if (index === -1) return state;

    docs[index] = {
      ...docs[index],
      evidenceLink,
    };
    updated = docs[index];
    state.documentsByWorkspace[workspaceId] = docs;
    return state;
  });

  return updated;
}

export function documents(workspaceId) {
  return listFor(workspaceId);
}

export function checklist(workspaceId) {
  const docs = listFor(workspaceId);
  return REQUIRED_DOC_TYPES.map(type => {
    const matches = docs.filter(d => d.docType === type);
    const status = matches.length === 0 ? 'missing' : 'received';
    return { docType: type, status, count: matches.length };
  });
}
