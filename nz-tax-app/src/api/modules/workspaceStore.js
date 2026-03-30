import { v4 as uuid } from 'uuid';
import { readData, updateData } from './dataStore.js';

export function createWorkspace({ userId = 'demo-user', taxYearStart, taxYearEnd }) {
  const id = uuid();
  const now = new Date().toISOString();
  const item = {
    id,
    userId,
    taxYearStart,
    taxYearEnd,
    status: 'in_progress',
    questionnaireAnswers: {},
    adjustments: {
      donationAmount: 0,
      pieIncome: 0,
      pieTaxCredits: 0,
      extraTaxDeducted: 0,
      studentLoanRepayments: 0,
    },
    warningEvidenceOverrides: {},
    reviewerActionResolutions: {},
    reviewerFinalSignoff: null,
    reviewerOperatorHandoff: null,
    createdAt: now,
    updatedAt: now,
  };

  updateData(state => {
    state.workspaces.push(item);
    return state;
  });

  return item;
}

export function listWorkspaces(userId = 'demo-user') {
  return readData().workspaces.filter(w => w.userId === userId);
}

export function getWorkspace(id, userId = 'demo-user') {
  const w = readData().workspaces.find(item => item.id === id);
  if (!w || w.userId !== userId) return null;
  return w;
}

export function updateWorkspace(id, userId = 'demo-user', patch = {}) {
  let updated = null;

  updateData(state => {
    state.workspaces = state.workspaces.map(current => {
      if (current.id !== id || current.userId !== userId) return current;
      updated = {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      return updated;
    });
    return state;
  });

  return updated;
}

export function setWorkspaceQuestionnaireAnswers(id, userId = 'demo-user', answers = {}) {
  return updateWorkspace(id, userId, { questionnaireAnswers: answers });
}
