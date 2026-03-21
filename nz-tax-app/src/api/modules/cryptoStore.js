import { v4 as uuid } from 'uuid';

const txByWorkspace = new Map();
const ALLOWED = new Set(['buy','sell','swap','staking','airdrop','fee']);

function bucket(workspaceId){
  if(!txByWorkspace.has(workspaceId)) txByWorkspace.set(workspaceId, []);
  return txByWorkspace.get(workspaceId);
}

function normalizeType(v=''){
  const t=String(v).toLowerCase().trim();
  if (ALLOWED.has(t)) return t;
  if (t.includes('stake')) return 'staking';
  if (t.includes('airdrop')) return 'airdrop';
  if (t.includes('swap')) return 'swap';
  if (t.includes('buy')) return 'buy';
  if (t.includes('sell')) return 'sell';
  if (t.includes('fee')) return 'fee';
  return 'other';
}

export function parseCsv(text=''){
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h=>h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const cols = line.split(',');
    const row = Object.fromEntries(headers.map((h,i)=>[h,(cols[i]||'').trim()]));
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

export function importTransactions(workspaceId, rows){
  const b = bucket(workspaceId);
  b.push(...rows);
  return { imported: rows.length, total: b.length };
}

export function listTransactions(workspaceId){
  return bucket(workspaceId);
}
