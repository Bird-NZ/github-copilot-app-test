export function calculateDraft(ir3Map) {
  const taxableIncome = Number(ir3Map['11B'] || 0) + Number(ir3Map['28'] || 0);
  const taxOnTaxable = taxableIncome * 0.33; // placeholder band model for skeleton
  const residual = taxOnTaxable - Number(ir3Map['11E'] || 0);
  const provisional = Math.max(0, residual * 1.05);

  return {
    '33': Number(taxableIncome.toFixed(2)),
    '37': Number(taxOnTaxable.toFixed(2)),
    '37A': Number(residual.toFixed(2)),
    '37B': Number(residual.toFixed(2)),
    '40B': Number(provisional.toFixed(2))
  };
}
