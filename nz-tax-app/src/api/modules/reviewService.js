function money(value) {
  return Number((Number(value || 0)).toFixed(2));
}

function moneyText(value) {
  return `NZ$${money(value).toFixed(2)}`;
}

function buildAdjustmentSummary(adjustments = {}) {
  return [
    {
      key: 'donationAmount',
      label: 'Donation claims entered',
      value: moneyText(adjustments.donationAmount),
      description: 'Charitable donations that may support a donation tax credit claim.',
      source: 'Taken from donation adjustments entered in this workspace.',
    },
    {
      key: 'pieIncome',
      label: 'PIE income added manually',
      value: moneyText(adjustments.pieIncome),
      description: 'Portfolio Investment Entity income added outside the normal income-entry flow.',
      source: 'Taken from manual PIE adjustments in this workspace.',
    },
    {
      key: 'pieTaxCredits',
      label: 'PIE tax credits entered',
      value: moneyText(adjustments.pieTaxCredits),
      description: 'Tax credits already attached to that PIE income.',
      source: 'Taken from manual PIE tax credit adjustments in this workspace.',
    },
    {
      key: 'studentLoanRepayments',
      label: 'Student loan repayments entered',
      value: moneyText(adjustments.studentLoanRepayments),
      description: 'Student loan deductions or repayments currently reflected in the review context.',
      source: 'Taken from student loan adjustments entered in this workspace.',
    },
  ];
}

function buildCryptoGuidance(transactions = [], docs = [], questionnaireAnswers = {}) {
  const counts = {
    buy: 0,
    sell: 0,
    swap: 0,
    staking: 0,
    airdrop: 0,
    fee: 0,
    other: 0,
  };

  for (const tx of transactions) {
    const type = tx?.type || 'other';
    counts[type] = (counts[type] || 0) + 1;
  }

  const hasCryptoCsv = docs.some(doc => doc.docType === 'crypto_csv');
  const hasAnyCryptoActivity = Object.values(counts).some(Boolean);
  const saidHasCrypto = questionnaireAnswers.has_crypto === true;
  const taxableActivities = [
    { activity: 'Selling crypto for NZD or another regular currency', taxable: counts.sell > 0 || counts.buy === 0 },
    { activity: 'Swapping one coin or token for another', taxable: counts.swap > 0 || hasAnyCryptoActivity },
    { activity: 'Receiving staking rewards or similar earn-style payouts', taxable: counts.staking > 0 || hasAnyCryptoActivity },
    { activity: 'Receiving airdrops', taxable: counts.airdrop > 0 || hasAnyCryptoActivity },
  ];

  const needed = [
    'A CSV or transaction export from each exchange or wallet you used',
    'The date of each transaction',
    'What asset was involved and how much you bought, sold, swapped, or received',
    'The NZD value at the time and any fees if your export includes them',
  ];

  if (!hasCryptoCsv) {
    needed.unshift('At least one crypto CSV/export has not been uploaded yet');
  }

  let intro = 'If you only bought crypto and still hold it, there may be nothing to return yet from those buys alone.';
  if (counts.sell || counts.swap) {
    intro = 'Your crypto activity likely includes taxable disposal events, because selling or swapping crypto usually needs to be worked through for tax.';
  } else if (counts.staking || counts.airdrop) {
    intro = 'Your crypto activity includes reward-style receipts, which are usually the first items Inland Revenue wants captured as taxable crypto income.';
  } else if (saidHasCrypto && !hasAnyCryptoActivity) {
    intro = 'You said you had crypto activity, but no transactions have been imported yet, so the draft is probably missing crypto tax information.';
  }

  return {
    intro,
    transactionCounts: counts,
    taxableActivities,
    whatToProvide: needed,
    status: {
      hasCryptoCsv,
      hasAnyCryptoActivity,
      saidHasCrypto,
    },
  };
}

export function buildReview(workspace, map, calc, docs = [], cryptoTransactions = []) {
  const adjustments = workspace?.adjustments || {};
  const questionnaireAnswers = workspace?.questionnaireAnswers || {};
  const warnings = [];
  const assumptions = [];
  const evidence = [];
  const crypto = buildCryptoGuidance(cryptoTransactions, docs, questionnaireAnswers);

  if (!map['11B'] && !map['28']) {
    warnings.push({ code: 'NO_INCOME', severity: 'high', message: 'No income has been captured yet, so the draft cannot be trusted.' });
  }

  if (questionnaireAnswers.has_student_loan === true && !docs.some(doc => doc.docType === 'student_loan_statement')) {
    warnings.push({ code: 'MISSING_STUDENT_LOAN_DOC', severity: 'medium', message: 'Student loan was indicated but no student loan statement has been uploaded yet.' });
  }

  if ((adjustments.donationAmount || 0) > 0 && !docs.some(doc => doc.docType === 'donation_receipts')) {
    warnings.push({ code: 'MISSING_DONATION_RECEIPTS', severity: 'medium', message: 'Donation claims are present without uploaded donation receipts.' });
  }

  if ((adjustments.pieIncome || 0) > 0 && !(adjustments.pieTaxCredits || 0)) {
    assumptions.push('PIE income has been entered without PIE tax credits, so the current draft assumes no PIE tax credit can be claimed.');
  }

  if (!(adjustments.studentLoanRepayments || 0) && questionnaireAnswers.has_student_loan === true) {
    assumptions.push('Student loan treatment is still provisional because no repayment/deduction amount has been entered yet.');
  }

  if ((calc?.summary?.terminalTaxToPay || 0) > 5000) {
    warnings.push({ code: 'PROVISIONAL_TAX_RISK', severity: 'medium', message: 'Estimated terminal tax is high enough that provisional tax may matter.' });
  }

  if (crypto.status.saidHasCrypto && !crypto.status.hasAnyCryptoActivity) {
    warnings.push({ code: 'CRYPTO_ACTIVITY_MISSING', severity: 'high', message: 'Crypto was indicated in the questionnaire, but no crypto transactions have been imported yet.' });
  }

  if (crypto.status.hasAnyCryptoActivity && !crypto.status.hasCryptoCsv) {
    warnings.push({ code: 'CRYPTO_EVIDENCE_MISSING', severity: 'medium', message: 'Crypto transactions exist, but no crypto CSV/export has been uploaded as supporting evidence yet.' });
  }

  for (const doc of docs) {
    if (doc.docType === 'donation_receipts') evidence.push({ supports: 'donation claims', document: doc.originalName || doc.filename });
    if (doc.docType === 'student_loan_statement') evidence.push({ supports: 'student loan treatment', document: doc.originalName || doc.filename });
    if (doc.docType === 'interest_dividend_slips') evidence.push({ supports: 'interest/dividend income', document: doc.originalName || doc.filename });
    if (doc.docType === 'paye_summary') evidence.push({ supports: 'PAYE income', document: doc.originalName || doc.filename });
    if (doc.docType === 'crypto_csv') evidence.push({ supports: 'crypto transaction history', document: doc.originalName || doc.filename });
  }

  const score = Math.max(0, 100 - warnings.length * 20 - assumptions.length * 8);

  return {
    readiness: {
      score,
      status: score >= 85 ? 'strong' : score >= 60 ? 'review_needed' : 'needs_attention',
    },
    warnings,
    assumptions,
    evidence,
    crypto,
    summary: {
      donationAmount: money(adjustments.donationAmount),
      pieIncome: money(adjustments.pieIncome),
      pieTaxCredits: money(adjustments.pieTaxCredits),
      studentLoanRepayments: money(adjustments.studentLoanRepayments),
      items: buildAdjustmentSummary(adjustments),
    },
  };
}
