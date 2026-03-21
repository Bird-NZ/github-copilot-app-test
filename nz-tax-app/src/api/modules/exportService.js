export function buildCsv(map, calc) {
  const rows = [['ref','value']];
  for (const [k,v] of Object.entries({...map, ...calc})) rows.push([k, String(v)]);
  return rows.map(r => r.join(',')).join('\n');
}

export function buildPdfPlaceholder(map, calc) {
  return {
    title: 'IR3 Draft Summary (Placeholder)',
    generatedAt: new Date().toISOString(),
    sections: [
      { name: 'Mapped Fields', values: map },
      { name: 'Calculated Fields', values: calc }
    ]
  };
}
