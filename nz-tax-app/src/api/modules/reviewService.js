function money(value) {
  return Number((Number(value || 0)).toFixed(2));
}

function moneyText(value) {
  return `NZ$${money(value).toFixed(2)}`;
}

const DOC_EVIDENCE_MAP = {
  donation_receipts: {
    supports: 'Donation claims',
    section: 'Adjustments and deductions',
    ir3Refs: ['41'],
    summaryKey: 'donationAmount',
  },
  student_loan_statement: {
    supports: 'Student loan treatment',
    section: 'Adjustments and deductions',
    ir3Refs: ['M', 'student_loan'],
    summaryKey: 'studentLoanRepayments',
  },
  interest_dividend_slips: {
    supports: 'Interest and dividend income',
    section: 'Income',
    ir3Refs: ['14', '14R', '18'],
    summaryKey: null,
  },
  paye_summary: {
    supports: 'PAYE income',
    section: 'Income',
    ir3Refs: ['11B', '11C'],
    summaryKey: null,
  },
  crypto_csv: {
    supports: 'Crypto transaction history',
    section: 'Crypto',
    ir3Refs: ['crypto'],
    summaryKey: null,
  },
};

export const REVIEW_EVIDENCE_OPTIONS = [
  { key: 'auto', label: 'Use automatic link', value: null },
  { key: 'none', label: 'Do not link this document', value: { mode: 'none' } },
  {
    key: 'paye_income',
    label: 'PAYE income',
    value: {
      mode: 'manual',
      supports: 'PAYE income',
      section: 'Income',
      ir3Refs: ['11A', '11B', '11C'],
      summaryKey: null,
    },
  },
  {
    key: 'interest_dividend_income',
    label: 'Interest and dividend income',
    value: {
      mode: 'manual',
      supports: 'Interest and dividend income',
      section: 'Income',
      ir3Refs: ['14', '14R', '18'],
      summaryKey: null,
    },
  },
  {
    key: 'donation_claims',
    label: 'Donation claims',
    value: {
      mode: 'manual',
      supports: 'Donation claims',
      section: 'Adjustments and deductions',
      ir3Refs: ['41'],
      summaryKey: 'donationAmount',
    },
  },
  {
    key: 'student_loan_treatment',
    label: 'Student loan treatment',
    value: {
      mode: 'manual',
      supports: 'Student loan treatment',
      section: 'Adjustments and deductions',
      ir3Refs: ['M', 'student_loan'],
      summaryKey: 'studentLoanRepayments',
    },
  },
  {
    key: 'crypto_transaction_history',
    label: 'Crypto transaction history',
    value: {
      mode: 'manual',
      supports: 'Crypto transaction history',
      section: 'Crypto',
      ir3Refs: ['crypto'],
      summaryKey: null,
    },
  },
];

function normalizeEvidenceLink(link) {
  if (!link || typeof link !== 'object') return null;
  if (link.mode === 'none') return { mode: 'none' };
  if (link.mode !== 'manual') return null;

  return {
    mode: 'manual',
    supports: String(link.supports || '').trim(),
    section: String(link.section || '').trim(),
    ir3Refs: Array.isArray(link.ir3Refs) ? link.ir3Refs.map((ref) => String(ref)) : [],
    summaryKey: link.summaryKey ? String(link.summaryKey) : null,
  };
}

function normalizeEvidenceLinks(links) {
  if (Array.isArray(links)) {
    return links
      .map(normalizeEvidenceLink)
      .filter(Boolean);
  }

  const single = normalizeEvidenceLink(links);
  return single ? [single] : [];
}

function getDocumentEvidenceLinks(doc = {}) {
  const manualLinks = normalizeEvidenceLinks(doc.evidenceLinks);
  if (manualLinks.length > 0) return manualLinks;
  return normalizeEvidenceLinks(doc.evidenceLink);
}

function buildEvidence(docs = []) {
  return docs
    .flatMap((doc) => {
      const manualLinks = getDocumentEvidenceLinks(doc);
      if (manualLinks.some((link) => link.mode === 'none')) return [];

      const configs = manualLinks.length > 0 ? manualLinks : [DOC_EVIDENCE_MAP[doc.docType]].filter(Boolean);

      return configs
        .filter((config) => config?.supports && config?.section)
        .map((config) => ({
          documentId: doc.id,
          document: doc.originalName || doc.filename,
          documentType: doc.docType,
          supports: config.supports,
          section: config.section,
          ir3Refs: config.ir3Refs || [],
          summaryKey: config.summaryKey ?? null,
          uploadedAt: doc.uploadedAt,
          status: doc.status,
          linkMode: manualLinks.length > 0 ? 'manual' : 'auto',
        }));
    })
    .filter(Boolean);
}

function normalizeWarningEvidenceOverride(override) {
  if (!override || typeof override !== 'object') return null;
  if (override.mode === 'none') return { mode: 'none', documentIds: [] };
  if (override.mode !== 'manual') return null;
  const documentIds = Array.isArray(override.documentIds)
    ? Array.from(new Set(override.documentIds.map((id) => String(id)).filter(Boolean)))
    : [];
  return { mode: 'manual', documentIds };
}

function buildManualWarningEvidenceItem(doc, warningCode, existingEvidence = []) {
  const matchingEvidence = existingEvidence.filter((item) => item.documentId === doc.id);
  if (matchingEvidence.length > 0) {
    return matchingEvidence.map((item) => ({ ...item, linkMode: 'manual' }));
  }

  return [{
    documentId: doc.id,
    document: doc.originalName || doc.filename,
    documentType: doc.docType,
    supports: `Manual evidence for ${warningCode}`,
    section: 'Review warning',
    ir3Refs: [],
    summaryKey: null,
    uploadedAt: doc.uploadedAt,
    status: doc.status,
    linkMode: 'manual',
  }];
}

function pickEvidenceForWarning(code, evidence = [], docs = [], override = null) {
  const normalizedOverride = normalizeWarningEvidenceOverride(override);
  if (normalizedOverride?.mode === 'none') {
    return [];
  }

  if (normalizedOverride?.mode === 'manual') {
    return normalizedOverride.documentIds.flatMap((documentId) => {
      const doc = docs.find((item) => item.id === documentId);
      if (!doc) return [];
      return buildManualWarningEvidenceItem(doc, code, evidence);
    });
  }

  const filters = {
    MISSING_STUDENT_LOAN_DOC: (item) => item.supports === 'Student loan treatment' || item.documentType === 'student_loan_statement',
    MISSING_DONATION_RECEIPTS: (item) => item.supports === 'Donation claims' || item.documentType === 'donation_receipts',
    CRYPTO_ACTIVITY_MISSING: (item) => item.supports === 'Crypto transaction history' || item.documentType === 'crypto_csv',
    CRYPTO_EVIDENCE_MISSING: (item) => item.supports === 'Crypto transaction history' || item.documentType === 'crypto_csv',
    NO_INCOME: (item) => item.section === 'Income' || item.documentType === 'paye_summary' || item.documentType === 'interest_dividend_slips',
  };

  const filter = filters[code];
  if (filter) {
    return evidence.filter(filter);
  }

  if (code === 'PROVISIONAL_TAX_RISK') {
    return docs
      .filter((doc) => doc.docType === 'paye_summary' || doc.docType === 'interest_dividend_slips' || doc.docType === 'other')
      .map((doc) => ({
        documentId: doc.id,
        document: doc.originalName || doc.filename,
        documentType: doc.docType,
        supports: 'Income records relevant to the tax calculation',
        section: 'Income',
        ir3Refs: [],
        summaryKey: null,
        uploadedAt: doc.uploadedAt,
        status: doc.status,
        linkMode: 'auto',
      }));
  }

  return [];
}

function buildAdjustmentSummary(adjustments = {}, mappedSummary = {}) {
  return [
    {
      key: 'donationAmount',
      label: 'Donation claims total',
      value: moneyText(mappedSummary.donationAmount),
      description: 'Charitable donations that may support a donation tax credit claim.',
      source: `Built from donation receipt totals (${moneyText(mappedSummary.donationReceiptAmount)}) plus manual donation adjustments (${moneyText(mappedSummary.donationAdjustmentAmount)}).`,
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
  const warningEvidenceOverrides = workspace?.warningEvidenceOverrides || {};
  const warnings = [];
  const assumptions = [];
  const evidence = buildEvidence(docs);
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

  const warningsWithEvidence = warnings.map((warning) => ({
    ...warning,
    evidence: pickEvidenceForWarning(warning.code, evidence, docs, warningEvidenceOverrides[warning.code]),
    evidenceOverride: normalizeWarningEvidenceOverride(warningEvidenceOverrides[warning.code]),
  }));

  const score = Math.max(0, 100 - warningsWithEvidence.length * 20 - assumptions.length * 8);

  return {
    readiness: {
      score,
      status: score >= 85 ? 'strong' : score >= 60 ? 'review_needed' : 'needs_attention',
    },
    warnings: warningsWithEvidence,
    assumptions,
    evidence,
    crypto,
    summary: {
      donationAmount: money(map?.summary?.donationAmount || 0),
      pieIncome: money(adjustments.pieIncome),
      pieTaxCredits: money(adjustments.pieTaxCredits),
      studentLoanRepayments: money(adjustments.studentLoanRepayments),
      items: buildAdjustmentSummary(adjustments, map?.summary || {}),
    },
  };
}
