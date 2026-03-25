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
    uploadedAt: new Date().toISOString()
  };

  updateData(state => {
    const next = state.documentsByWorkspace[workspaceId] || [];
    next.push(item);
    state.documentsByWorkspace[workspaceId] = next;
    return state;
  });

  return item;
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
