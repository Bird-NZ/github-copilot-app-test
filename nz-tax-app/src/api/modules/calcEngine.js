function roundCurrency(value) {
  return Number((Number(value || 0)).toFixed(2));
}

function calcNzIncomeTax(taxableIncome) {
  const bands = [
    { upTo: 15600, rate: 0.105 },
    { upTo: 53500, rate: 0.175 },
    { upTo: 78100, rate: 0.30 },
    { upTo: 180000, rate: 0.33 },
    { upTo: Infinity, rate: 0.39 },
  ];

  let remaining = Number(taxableIncome || 0);
  let previousCap = 0;
  let total = 0;
  const breakdown = [];

  for (const band of bands) {
    if (remaining <= 0) break;
    const bandWidth = band.upTo === Infinity ? remaining : Math.max(0, band.upTo - previousCap);
    const taxedAmount = Math.min(remaining, bandWidth);
    const tax = taxedAmount * band.rate;
    total += tax;
    breakdown.push({ from: previousCap, to: band.upTo === Infinity ? null : band.upTo, rate: band.rate, income: roundCurrency(taxedAmount), tax: roundCurrency(tax) });
    remaining -= taxedAmount;
    previousCap = band.upTo;
  }

  return { total: roundCurrency(total), breakdown };
}

export function calculateDraft(ir3Map) {
  const grossIncome = roundCurrency(Number(ir3Map['11B'] || 0) + Number(ir3Map['28'] || 0) + Number(ir3Map['36B'] || 0));
  const donationAmount = roundCurrency(Number(ir3Map?.summary?.donationAmount || 0));
  const donationClaim = roundCurrency(donationAmount * 0.3333);
  const taxableIncome = roundCurrency(Math.max(0, grossIncome));
  const taxCreditsAndDeductions = roundCurrency(Number(ir3Map['11E'] || 0) + Number(ir3Map['36A'] || 0) + donationClaim);
  const incomeTax = calcNzIncomeTax(taxableIncome);
  const residual = roundCurrency(incomeTax.total - taxCreditsAndDeductions);
  const terminalTaxToPay = Math.max(0, residual);
  const estimatedRefund = Math.max(0, -residual);
  const provisional = terminalTaxToPay > 5000 ? roundCurrency(terminalTaxToPay * 1.05) : 0;

  return {
    '33': taxableIncome,
    '37': incomeTax.total,
    '37A': roundCurrency(residual),
    '37B': roundCurrency(terminalTaxToPay || estimatedRefund),
    '40B': roundCurrency(provisional),
    summary: {
      taxableIncome,
      grossIncome,
      donationClaim,
      incomeTax: incomeTax.total,
      taxCreditsAndDeductions,
      residualIncomeTax: residual,
      terminalTaxToPay: roundCurrency(terminalTaxToPay),
      estimatedRefund: roundCurrency(estimatedRefund),
      provisionalTax: roundCurrency(provisional),
      taxBandBreakdown: incomeTax.breakdown,
    },
  };
}
