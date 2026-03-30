import fs from 'fs';
import path from 'path';

const dictPath = path.resolve(process.cwd(), '../docs/IR3_FIELD_DICTIONARY_V1.json');

function money(value) {
  return `NZ$${Number(value || 0).toFixed(2)}`;
}

function buildSummaryCards(map = {}, calc = {}) {
  const summary = calc.summary || {};
  const payable = Number(summary.terminalTaxToPay || 0);
  const refund = Number(summary.estimatedRefund || 0);

  return [
    {
      key: 'incomeCollected',
      label: 'Income we have picked up so far',
      value: money(summary.grossIncome),
      ir3Ref: '11B, 28, 36B',
      description: 'Your draft adds together salary or wages, other taxable income, and PIE income.',
      source: 'Built from PAYE entries, non-PAYE income entries, taxable crypto reward income, and any PIE adjustment.',
    },
    {
      key: 'taxableIncome',
      label: 'Income currently being taxed in this draft',
      value: money(summary.taxableIncome),
      ir3Ref: '33',
      description: 'This is the amount the draft is currently treating as taxable before Inland Revenue makes any final adjustments.',
      source: 'Calculated from the income totals already loaded into this workspace.',
    },
    {
      key: 'taxBeforeCredits',
      label: 'Estimated tax before credits',
      value: money(summary.incomeTax),
      ir3Ref: '37',
      description: 'This applies the current NZ resident tax bands to the draft taxable income.',
      source: 'Calculated by the app from the taxable income estimate.',
    },
    {
      key: 'taxAlreadyCovered',
      label: 'Tax already covered for you',
      value: money(summary.taxCreditsAndDeductions),
      ir3Ref: '11E, 36A',
      description: 'This includes PAYE already withheld, PIE tax credits, other tax already deducted, and any donation tax credit currently entered.',
      source: 'Taken from PAYE withheld figures, manual tax-already-deducted adjustments, PIE tax credit adjustments, and donation claims entered in the workspace.',
    },
    {
      key: payable > 0 ? 'amountToPay' : refund > 0 ? 'refund' : 'settled',
      label: payable > 0 ? 'Estimated extra tax to pay' : refund > 0 ? 'Estimated refund' : 'Estimated final position',
      value: payable > 0 ? money(payable) : refund > 0 ? money(refund) : 'Close to settled',
      ir3Ref: '37A / 37B',
      description: payable > 0
        ? 'This is the gap between estimated tax and the credits or tax already counted.'
        : refund > 0
          ? 'This means the draft thinks you may have already paid more tax than needed.'
          : 'The draft thinks your tax already paid is close to the final amount needed.',
      source: 'Calculated by comparing estimated tax with tax already deducted or credited.',
    },
  ];
}

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
  const provisionalTaxStatus = summary.provisionalTaxStatus || {};

  return {
    headline: payable > 0
      ? `Estimated extra tax to pay: ${money(payable)}`
      : refund > 0
        ? `Estimated refund: ${money(refund)}`
        : 'Estimated tax position is close to settled.',
    bullets: [
      `Income currently being taxed in this draft is ${money(summary.taxableIncome)}.`,
      `So far, the draft includes ${money(mappedSummary.payeGross)} from salary or wages, ${money(mappedSummary.totalOtherIncome)} from other taxable income sources, and ${money(mappedSummary.pieIncome)} of PIE income.`,
      `Estimated tax before credits is ${money(summary.incomeTax)}.`,
      `Tax already covered through PAYE, ${money(mappedSummary.pieTaxCredits)} of PIE credits, ${money(mappedSummary.extraTaxDeducted)} of other tax already deducted, and donation claims is ${money(summary.taxCreditsAndDeductions)}.`,
      payable > 0
        ? `Based on the current draft, you may still need to pay about ${money(payable)}.`
        : refund > 0
          ? `Based on the current draft, you may be due a refund of about ${money(refund)}.`
          : 'Based on the current draft, you are close to break-even after tax already deducted.',
      provisionalTaxStatus.relevant
        ? `Because the modeled residual income tax is above ${money(provisionalTaxStatus.threshold)}, the app flags provisional tax as relevant and uses the standard option as a simple estimate basis: ${money(provisionalTaxStatus.modeledResidualIncomeTax)} plus 5% = ${money(provisionalTaxStatus.estimatedStandardOptionTax)}.`
        : `The modeled residual income tax is not above ${money(provisionalTaxStatus.threshold || 5000)}, so this draft does not currently surface a provisional tax estimate.`,
    ],
    summaryCards: buildSummaryCards(map, calc),
    fieldNotes: [
      { ref: '11B', label: 'Salary or wages before tax', note: 'This is the total gross PAYE income captured from salary and wage entries.', source: 'Comes from PAYE income records entered in the workspace.' },
      { ref: '28', label: 'Other taxable income', note: 'This groups interest, dividends, other income, and taxable crypto staking or airdrop income.', source: 'Comes from non-PAYE income entries and taxable crypto income picked up by the app.' },
      { ref: '33', label: 'Income currently being taxed', note: 'This is your current taxable income estimate before final Inland Revenue adjustments.', source: 'Calculated from the income totals currently loaded into the draft.' },
      { ref: '37', label: 'Estimated tax before credits', note: 'This is estimated using progressive NZ resident income tax bands.', source: 'Calculated by the app from the taxable income estimate.' },
      { ref: '37A', label: 'Tax gap after credits', note: 'This is the gap between estimated tax and tax already deducted or credited, which is also the modeled residual income tax in this simplified draft.', source: 'Calculated by comparing estimated tax with PAYE and other current credits.' },
      { ref: '40B', label: 'Possible provisional tax', note: 'This is only shown when modeled residual income tax is above NZ$5,000. The draft then uses the standard option as a simple estimate basis by adding 5%.', source: 'Derived from the modeled residual income tax using the current simplified provisional-tax rule.' },
    ],
  };
}
