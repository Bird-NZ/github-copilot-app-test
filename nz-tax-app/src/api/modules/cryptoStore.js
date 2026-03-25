import { v4 as uuid } from 'uuid';
import { readData, updateData } from './dataStore.js';

const ALLOWED = new Set(['buy','sell','swap','staking','airdrop','fee']);

function bucket(workspaceId) {
  return readData().cryptoByWorkspace[workspaceId] || [];
}

function normalizeType(v='') {
  const t = String(v).toLowerCase().trim();
  if (ALLOWED.has(t)) return t;
  if (t.includes('stake')) return 'staking';
  if (t.includes('airdrop')) return 'airdrop';
  if (t.includes('swap')) return 'swap';
  if (t.includes('buy')) return 'buy';
  if (t.includes('sell')) return 'sell';
  if (t.includes('fee')) return 'fee';
  return 'other';
}

export function parseCsv(text='') {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    const row = Object.fromEntries(headers.map((h, i) => [h, (cols[i] || '').trim()]));
    const type = normalizeType(row.type || row.transaction_type || row.action);
    return {
      id: uuid(),
      occurredAt: row.date || row.timestamp || null,
      asset: row.asset || row.coin || row.currency || null,
      type,
      amount: Number(row.amount || row.quantity || 0),
      priceNzd: Number(row.price_nzd || row.nzd_price || 0),
      feeNzd: Number(row.fee_nzd || 0),
      source: row.source || row.exchange || 'csv'
    };
  });
}

export function importTransactions(workspaceId, rows) {
  let total = 0;
  updateData(state => {
    const next = state.cryptoByWorkspace[workspaceId] || [];
    next.push(...rows);
    state.cryptoByWorkspace[workspaceId] = next;
    total = next.length;
    return state;
  });
  return { imported: rows.length, total };
}

export function listTransactions(workspaceId) {
  return bucket(workspaceId);
}
