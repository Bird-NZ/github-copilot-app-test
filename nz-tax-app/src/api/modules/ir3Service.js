import fs from 'fs';
import path from 'path';

const dictPath = path.resolve(process.cwd(), '../docs/IR3_FIELD_DICTIONARY_V1.json');

export function getIr3Dictionary() {
  const raw = fs.readFileSync(dictPath, 'utf8');
  return JSON.parse(raw);
}

export function getIr3Field(ref) {
  const d = getIr3Dictionary();
  return d.fields.find(f => f.ref === ref) || null;
}

export function explainIr3Values(map = {}, calc = {}) {
  const summary = calc.summary || {};
  const mappedSummary = map.summary || {};
  const payable = Number(summary.terminalTaxToPay || 0);
  const refund = Number(summary.estimatedRefund || 0);

  return {
    headline: payable > 0
      ? `Estimated terminal tax to pay: NZ$${payable.toFixed(2)}`
      : refund > 0
        ? `Estimated refund: NZ$${refund.toFixed(2)}`
        : 'Estimated tax position is close to settled.',
    bullets: [
      `Taxable income is estimated at NZ$${Number(summary.taxableIncome || 0).toFixed(2)}.`,
      `PAYE gross income contributes NZ$${Number(mappedSummary.payeGross || 0).toFixed(2)} and other income contributes NZ$${Number(mappedSummary.totalOtherIncome || 0).toFixed(2)}.`,
      `Estimated income tax before credits/deductions is NZ$${Number(summary.incomeTax || 0).toFixed(2)}.`,
      `Tax already deducted/credited is NZ$${Number(summary.taxCreditsAndDeductions || 0).toFixed(2)}.`,
      payable > 0
        ? `Based on the current draft, you may still need to pay about NZ$${payable.toFixed(2)}.`
        : refund > 0
          ? `Based on the current draft, you may be due a refund of about NZ$${refund.toFixed(2)}.`
          : 'Based on the current draft, you are close to break-even after tax already deducted.',
    ],
    fieldNotes: [
      { ref: '11B', note: 'This is the total gross PAYE income captured from salary/wage entries.' },
      { ref: '28', note: 'This groups interest, dividends, other income, and taxable crypto staking/airdrop income.' },
      { ref: '33', note: 'This is your current taxable income estimate before final IRD adjustments.' },
      { ref: '37', note: 'This is estimated using progressive NZ resident income tax bands, not a flat placeholder rate.' },
      { ref: '37A', note: 'Residual income tax is the gap between estimated tax and tax already deducted/credited.' },
      { ref: '40B', note: 'Provisional tax is only shown when the estimated terminal tax is high enough to matter.' },
    ],
  };
}
