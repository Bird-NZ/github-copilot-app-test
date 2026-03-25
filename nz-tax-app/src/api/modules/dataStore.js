import fs from 'fs';
import path from 'path';

const dataDir = process.env.DATA_DIR || path.resolve(process.cwd(), 'data');
const dataFile = process.env.DATA_FILE || path.join(dataDir, 'app-data.json');

const defaultState = {
  users: [],
  sessions: [],
  workspaces: [],
  incomeByWorkspace: {},
  cryptoByWorkspace: {},
  auditByWorkspace: {},
  documentsByWorkspace: {}
};

function ensureDataFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(defaultState, null, 2));
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeState(raw = {}) {
  return {
    users: Array.isArray(raw.users) ? raw.users : [],
    sessions: Array.isArray(raw.sessions) ? raw.sessions : [],
    workspaces: Array.isArray(raw.workspaces) ? raw.workspaces : [],
    incomeByWorkspace: raw.incomeByWorkspace && typeof raw.incomeByWorkspace === 'object' ? raw.incomeByWorkspace : {},
    cryptoByWorkspace: raw.cryptoByWorkspace && typeof raw.cryptoByWorkspace === 'object' ? raw.cryptoByWorkspace : {},
    auditByWorkspace: raw.auditByWorkspace && typeof raw.auditByWorkspace === 'object' ? raw.auditByWorkspace : {},
    documentsByWorkspace: raw.documentsByWorkspace && typeof raw.documentsByWorkspace === 'object' ? raw.documentsByWorkspace : {}
  };
}

function readState() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return normalizeState(JSON.parse(raw));
  } catch {
    fs.writeFileSync(dataFile, JSON.stringify(defaultState, null, 2));
    return clone(defaultState);
  }
}

function writeState(next) {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(normalizeState(next), null, 2));
}

export function getDataMeta() {
  ensureDataFile();
  return { dataDir, dataFile };
}

export function readData() {
  return readState();
}

export function updateData(mutator) {
  const current = readState();
  const draft = clone(current);
  const result = mutator(draft) || draft;
  writeState(result);
  return result;
}
