import fs from 'fs';
import path from 'path';

const dictPath = path.resolve(process.cwd(), '../../docs/IR3_FIELD_DICTIONARY_V1.json');

export function getIr3Dictionary() {
  const raw = fs.readFileSync(dictPath, 'utf8');
  return JSON.parse(raw);
}

export function getIr3Field(ref) {
  const d = getIr3Dictionary();
  return d.fields.find(f => f.ref === ref) || null;
}
