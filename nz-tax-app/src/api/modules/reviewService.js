import { completionStatus } from './questionnaireEngine.js';
import { explainIr3Values } from './ir3Service.js';

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

const FIELD_FOLLOW_UP_MAP = {
  '11B': {
    fieldFamily: 'PAYE income',
    requestArea: 'Documents tab · PAYE summary',
    requestText: 'Request the employer PAYE summary or Inland Revenue earnings record that supports PAYE gross income and PAYE withheld.',
    suggestedDocTypes: ['paye_summary'],
  },
  '11C': {
    fieldFamily: 'PAYE tax withheld',
    requestArea: 'Documents tab · PAYE summary',
    requestText: 'Request the employer PAYE summary or Inland Revenue earnings record that supports PAYE gross income and PAYE withheld.',
    suggestedDocTypes: ['paye_summary'],
  },
  '14': {
    fieldFamily: 'Interest income',
    requestArea: 'Documents tab · Interest/dividend slips',
    requestText: 'Request the annual bank or investment statement covering interest income and any resident withholding tax.',
    suggestedDocTypes: ['interest_dividend_slips'],
  },
  '14R': {
    fieldFamily: 'Resident withholding tax on interest/dividends',
    requestArea: 'Documents tab · Interest/dividend slips',
    requestText: 'Request the annual bank or investment statement showing resident withholding tax deducted from interest or dividends.',
    suggestedDocTypes: ['interest_dividend_slips'],
  },
  '18': {
    fieldFamily: 'Dividend income',
    requestArea: 'Documents tab · Interest/dividend slips',
    requestText: 'Request the annual dividend/investment statements that support dividend income and attached credits.',
    suggestedDocTypes: ['interest_dividend_slips'],
  },
  '37': {
    fieldFamily: 'PIE tax credits / other tax already deducted',
    requestArea: 'Adjustments and deductions · PIE/other tax deducted',
    requestText: 'Request the annual PIE tax certificate or other withholding/tax-deducted statement that supports the credits entered for this field.',
    suggestedDocTypes: ['interest_dividend_slips', 'other'],
  },
  '41': {
    fieldFamily: 'Donation claims',
    requestArea: 'Documents tab · Donation receipts',
    requestText: 'Request the donation receipts that support the claimable donation amount entered in the draft.',
    suggestedDocTypes: ['donation_receipts'],
  },
};

const APPLICABLE_DOCUMENT_RULES = [
  {
    docType: 'paye_summary',
    label: 'PAYE summary',
    applies: ({ map }) => money(map?.summary?.payeGross || 0) > 0,
    reason: 'PAYE income has been entered and should be backed by an employer summary or year-end earnings record.',
  },
  {
    docType: 'interest_dividend_slips',
    label: 'Interest/dividend slips',
    applies: ({ map }) => money(map?.summary?.interestIncome || 0) > 0 || money(map?.summary?.dividendIncome || 0) > 0,
    reason: 'Interest or dividend income has been entered and should be backed by annual bank or investment statements.',
  },
  {
    docType: 'student_loan_statement',
    label: 'Student loan statement',
    applies: ({ questionnaireAnswers, adjustments }) => questionnaireAnswers.has_student_loan === true || money(adjustments?.studentLoanRepayments || 0) > 0,
    reason: 'Student loan treatment is in scope for this return.',
  },
  {
    docType: 'donation_receipts',
    label: 'Donation receipts',
    applies: ({ questionnaireAnswers, map }) => questionnaireAnswers.has_donations === true || money(map?.summary?.donationAmount || 0) > 0,
    reason: 'Donation claims are in scope or have been entered in the draft.',
  },
  {
    docType: 'crypto_csv',
    label: 'Crypto CSV/export',
    applies: ({ questionnaireAnswers, crypto }) => questionnaireAnswers.has_crypto === true || crypto?.status?.saidHasCrypto === true || crypto?.status?.hasAnyCryptoActivity === true,
    reason: 'Crypto activity was indicated or imported and should be backed by exchange or wallet exports.',
  },
];

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
    PIE_CREDITS_WITHOUT_INCOME: (item) => item.supports === 'PIE income added manually' || item.supports === 'PIE tax credits entered',
    PIE_CREDITS_HIGH_FOR_INCOME: (item) => item.supports === 'PIE income added manually' || item.supports === 'PIE tax credits entered',
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
      key: 'extraTaxDeducted',
      label: 'Other tax already deducted',
      value: moneyText(adjustments.extraTaxDeducted),
      description: 'Extra tax already withheld outside PAYE or PIE credits.',
      source: 'Taken from manual tax-already-deducted adjustments in this workspace.',
    },
    {
      key: 'studentLoanRepayments',
      label: 'Student loan repayments entered',
      value: moneyText(adjustments.studentLoanRepayments),
      description: 'Student loan deductions or repayments currently reflected in the review context.',
      source: 'Entered manually in the student loan repayments field for this workspace.',
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

export function buildApplicableDocumentChecklist({ questionnaireAnswers = {}, adjustments = {}, map = {}, docs = [], crypto = {} }) {
  return APPLICABLE_DOCUMENT_RULES
    .map((rule) => {
      const applicable = rule.applies({ questionnaireAnswers, adjustments, map, crypto });
      const count = docs.filter((doc) => doc.docType === rule.docType).length;
      return {
        docType: rule.docType,
        label: rule.label,
        reason: rule.reason,
        applicable,
        status: applicable ? (count > 0 ? 'received' : 'missing') : 'not_applicable',
        count,
        required: applicable,
        received: count > 0,
      };
    })
    .filter((item) => item.applicable);
}

function buildFinalReviewChecklist({ questionnaire, applicableDocuments = [], warnings = [], assumptions = [], calc = {} }) {
  const provisionalTaxStatus = calc?.summary?.provisionalTaxStatus || {};
  const terminalTaxToPay = money(calc?.summary?.terminalTaxToPay || 0);
  const residualIncomeTax = money(calc?.summary?.residualIncomeTax || 0);
  const highSeverityWarnings = warnings.filter((warning) => warning.severity === 'high').length;

  return [
    {
      key: 'questionnaire',
      label: 'Questionnaire complete',
      status: questionnaire.complete ? 'done' : 'action_needed',
      detail: questionnaire.complete
        ? 'All visible filing-scope questions are answered.'
        : `Still missing ${questionnaire.totalVisible - questionnaire.answeredVisible} visible questionnaire answer(s).`,
    },
    {
      key: 'supporting_documents',
      label: 'Applicable supporting documents collected',
      status: applicableDocuments.every((item) => item.received) ? 'done' : 'action_needed',
      detail: `${applicableDocuments.filter((item) => item.received).length}/${applicableDocuments.length} applicable document type(s) received.`,
    },
    {
      key: 'warnings_assumptions',
      label: 'Warnings and assumptions reviewed',
      status: highSeverityWarnings === 0 && assumptions.length === 0 ? 'done' : 'review',
      detail: `${highSeverityWarnings} high-severity warning(s), ${warnings.length} total warning(s), ${assumptions.length} assumption(s).`,
    },
    {
      key: 'tax_position',
      label: 'Residual/provisional tax position noted',
      status: provisionalTaxStatus.relevant ? 'review' : 'done',
      detail: provisionalTaxStatus.relevant
        ? `Residual income tax is ${moneyText(residualIncomeTax)} and provisional tax is likely relevant under the current estimate.`
        : `Residual income tax is ${moneyText(residualIncomeTax)} and provisional tax is not currently flagged as relevant.`,
    },
    {
      key: 'submission_handoff',
      label: 'Ready for human handoff',
      status: questionnaire.complete && applicableDocuments.every((item) => item.received) && highSeverityWarnings === 0 ? 'done' : 'action_needed',
      detail: terminalTaxToPay > 0
        ? `Current draft indicates terminal tax to pay of ${moneyText(terminalTaxToPay)} before human sign-off.`
        : 'Current draft does not show terminal tax still to pay before human sign-off.',
    },
  ];
}

function buildFieldTraceability(map = {}, calc = {}, evidence = []) {
  const explanation = explainIr3Values(map, calc);
  const fieldNotes = explanation?.fieldNotes || [];

  const items = fieldNotes.map((field) => {
    const fieldEvidence = evidence.filter((item) => (item.ir3Refs || []).includes(field.ref));
    const traceStatus = fieldEvidence.length > 0 && field.source
      ? 'evidenced'
      : field.source || field.note
        ? 'explained'
        : 'unexplained';

    return {
      ref: field.ref,
      label: field.label || field.ref,
      value: map[field.ref] ?? calc[field.ref] ?? null,
      note: field.note || '',
      source: field.source || '',
      evidenceCount: fieldEvidence.length,
      traceStatus,
      evidence: fieldEvidence,
    };
  });

  const gaps = items
    .filter((item) => item.evidenceCount === 0)
    .map((item) => {
      const followUp = FIELD_FOLLOW_UP_MAP[item.ref] || {
        fieldFamily: item.label,
        requestArea: 'Relevant source document or field family',
        requestText: `Request the supporting document or clearer source detail that substantiates IR3 ${item.ref} ${item.label}.`,
        suggestedDocTypes: [],
      };

      return {
        ref: item.ref,
        label: item.label,
        reason: item.traceStatus === 'explained'
          ? 'Explained in the draft, but no supporting evidence is attached to this key field yet.'
          : 'This key field still needs clearer explanation/source detail and supporting evidence before reviewer handoff.',
        severity: item.traceStatus === 'explained' ? 'medium' : 'high',
        fieldFamily: followUp.fieldFamily,
        requestArea: followUp.requestArea,
        requestText: followUp.requestText,
        suggestedDocTypes: followUp.suggestedDocTypes,
      };
    });

  const followUpPack = {
    headline: gaps.length === 0
      ? 'No traceability follow-up is currently required for the key reviewer handoff fields.'
      : `${gaps.length} key field${gaps.length === 1 ? '' : 's'} still need reviewer follow-up before handoff is fully evidenced.`,
    items: gaps.map((gap, index) => ({
      id: `trace_follow_up_${index + 1}`,
      ref: gap.ref,
      label: gap.label,
      severity: gap.severity,
      fieldFamily: gap.fieldFamily,
      requestArea: gap.requestArea,
      requestText: gap.requestText,
      reason: gap.reason,
      suggestedDocTypes: gap.suggestedDocTypes,
    })),
  };

  return {
    keyFieldCount: items.length,
    evidencedFieldCount: items.filter((item) => item.evidenceCount > 0).length,
    explainedFieldCount: items.filter((item) => item.source || item.note).length,
    items,
    gaps,
    followUpPack,
  };
}

function buildReviewerActionQueue({ submissionReadiness = null, traceability = null, warnings = [], assumptions = [], resolutions = {} }) {
  const items = [];

  const handoffBlockers = [];

  (submissionReadiness?.blockers || []).forEach((blocker, index) => {
    items.push({
      id: `blocker_${blocker.code || index + 1}`,
      sourceType: 'submission_blocker',
      sourceKey: blocker.code || `blocker_${index + 1}`,
      severity: blocker.severity === 'high' ? 'high' : 'medium',
      priority: blocker.severity === 'high' ? 100 : 80,
      title: blocker.label || 'Submission blocker',
      detail: blocker.message || '',
      requestText: blocker.message || '',
      requestArea: blocker.targetTab === 'documents'
        ? 'Documents tab'
        : blocker.targetTab === 'ir3_summary'
          ? 'IR3 Summary'
          : 'Questionnaire',
      targetTab: blocker.targetTab || 'questionnaire',
      actionLabel: blocker.actionLabel || 'Open area',
      category: 'filing_readiness',
    });
    handoffBlockers.push(blocker.label || blocker.message || 'Outstanding filing blocker');
  });

  const traceItems = traceability?.followUpPack?.items?.length ? traceability.followUpPack.items : (traceability?.gaps || []);
  traceItems.forEach((gap, index) => {
    items.push({
      id: gap.id || `trace_gap_${gap.ref || index + 1}`,
      sourceType: 'traceability_gap',
      sourceKey: gap.ref || `trace_gap_${index + 1}`,
      severity: gap.severity === 'high' ? 'high' : 'medium',
      priority: gap.severity === 'high' ? 90 : 70,
      title: `Evidence gap · IR3 ${gap.ref} ${gap.label}`,
      detail: gap.reason || '',
      requestText: gap.requestText || gap.reason || '',
      requestArea: gap.requestArea || 'IR3 Summary',
      targetTab: 'ir3_summary',
      actionLabel: 'Open IR3 summary',
      category: 'traceability',
      supportState: 'missing_support',
      actionType: 'collect_document',
    });
    handoffBlockers.push(`Traceability gap · IR3 ${gap.ref} ${gap.label}`);
  });

  warnings.forEach((warning, index) => {
    items.push({
      id: `warning_${warning.code || index + 1}`,
      sourceType: 'review_warning',
      sourceKey: warning.code || `warning_${index + 1}`,
      severity: warning.severity === 'high' ? 'high' : 'medium',
      priority: warning.severity === 'high' ? 85 : 60,
      title: `Review warning · ${String(warning.code || 'warning').replaceAll('_', ' ')}`,
      detail: warning.message || '',
      requestText: warning.message || '',
      requestArea: 'IR3 Summary · Review confidence',
      targetTab: 'ir3_summary',
      actionLabel: 'Open IR3 summary',
      category: 'review_warning',
    });
  });

  assumptions.forEach((assumption, index) => {
    items.push({
      id: `assumption_${index + 1}`,
      sourceType: 'assumption',
      sourceKey: `assumption_${index + 1}`,
      severity: 'medium',
      priority: 40,
      title: `Replace assumption ${index + 1}`,
      detail: assumption,
      requestText: 'Replace this assumption with a confirmed figure or supporting document where possible.',
      requestArea: 'IR3 Summary · Review confidence',
      targetTab: 'ir3_summary',
      actionLabel: 'Open IR3 summary',
      category: 'assumption',
    });
  });

  const deduped = Array.from(new Map(items.map((item) => [`${item.sourceType}:${item.sourceKey}`, item])).values())
    .sort((a, b) => b.priority - a.priority || a.title.localeCompare(b.title));
  const categoryOrder = ['filing_readiness', 'traceability', 'review_warning', 'assumption'];
  const categories = categoryOrder
    .map((category) => {
      const categoryItems = deduped.filter((item) => item.category === category);
      return {
        category,
        label: category === 'filing_readiness'
          ? 'Filing readiness'
          : category === 'traceability'
            ? 'Traceability gaps'
            : category === 'review_warning'
              ? 'Review warnings'
              : 'Assumptions',
        count: categoryItems.length,
        highPriorityCount: categoryItems.filter((item) => item.severity === 'high').length,
      };
    })
    .filter((item) => item.count > 0);

  const withResolution = deduped.map((item) => ({
    ...item,
    resolutionStatus: resolutions[item.id]?.status === 'resolved' ? 'resolved' : 'open',
    resolvedAt: resolutions[item.id]?.resolvedAt || null,
    resolutionNote: resolutions[item.id]?.note || '',
  }));
  const openItems = withResolution.filter((item) => item.resolutionStatus !== 'resolved');
  const resolvedItems = withResolution
    .filter((item) => item.resolutionStatus === 'resolved')
    .sort((a, b) => String(b.resolvedAt || '').localeCompare(String(a.resolvedAt || '')) || b.priority - a.priority);
  const shortlist = openItems.slice(0, 3);
  const recentlyResolved = resolvedItems.slice(0, 3);
  const totalTrackedCount = withResolution.length;
  const resolvedCount = resolvedItems.length;
  const openHighPriorityCount = openItems.filter((item) => item.severity === 'high').length;
  const unresolvedHandoffBlockers = openItems.filter((item) => item.category === 'filing_readiness' || item.category === 'traceability');
  const handoffStatus = openItems.length === 0
    ? 'ready_for_handoff'
    : unresolvedHandoffBlockers.length > 0
      ? 'blocked'
      : 'review_in_progress';
  const closureSummary = totalTrackedCount === 0
    ? 'No reviewer action items are currently tracked. The draft is ready for final human review and handoff.'
    : handoffStatus === 'ready_for_handoff'
      ? `All ${resolvedCount} tracked reviewer action${resolvedCount === 1 ? '' : 's'} are resolved. The draft now reads as handoff-ready pending final human review.`
      : handoffStatus === 'blocked'
        ? `${resolvedCount} of ${totalTrackedCount} reviewer action${totalTrackedCount === 1 ? '' : 's'} are resolved. Final handoff is still blocked by ${unresolvedHandoffBlockers.length} core item${unresolvedHandoffBlockers.length === 1 ? '' : 's'}: ${unresolvedHandoffBlockers.slice(0, 3).map((item) => item.title).join(' · ')}${unresolvedHandoffBlockers.length > 3 ? '…' : ''}`
        : `${resolvedCount} of ${totalTrackedCount} reviewer action${totalTrackedCount === 1 ? '' : 's'} are resolved. Remaining work is now mostly review polish rather than handoff-blocking gaps.`;

  const remainingIssues = openItems.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.title,
    severity: item.severity,
    requestArea: item.requestArea,
    requestText: item.requestText,
    category: item.category,
  }));

  const handoffChecklist = [
    {
      key: 'filing_blockers',
      label: 'Filing blockers cleared',
      status: openItems.some((item) => item.category === 'filing_readiness') ? 'action_needed' : 'done',
      detail: openItems.some((item) => item.category === 'filing_readiness')
        ? `${openItems.filter((item) => item.category === 'filing_readiness').length} filing-readiness blocker(s) still open.`
        : 'No filing-readiness blockers remain in the reviewer queue.',
    },
    {
      key: 'traceability_gaps',
      label: 'Traceability gaps resolved',
      status: openItems.some((item) => item.category === 'traceability') ? 'action_needed' : 'done',
      detail: openItems.some((item) => item.category === 'traceability')
        ? `${openItems.filter((item) => item.category === 'traceability').length} traceability gap(s) still need evidence or explanation.`
        : 'No open traceability gaps remain in the queue.',
    },
    {
      key: 'high_risk_warnings',
      label: 'High-risk warnings reviewed',
      status: openItems.some((item) => item.category === 'review_warning' && item.severity === 'high') ? 'review' : 'done',
      detail: openItems.some((item) => item.category === 'review_warning' && item.severity === 'high')
        ? `${openItems.filter((item) => item.category === 'review_warning' && item.severity === 'high').length} high-severity review warning(s) remain open.`
        : 'No high-severity review warnings remain open.',
    },
    {
      key: 'reviewer_queue',
      label: 'Reviewer queue worked down',
      status: openItems.length === 0 ? 'done' : 'review',
      detail: openItems.length === 0
        ? `All ${resolvedCount} tracked reviewer action${resolvedCount === 1 ? '' : 's'} are resolved.`
        : `${openItems.length} reviewer action${openItems.length === 1 ? '' : 's'} still open (${resolvedCount} resolved).`,
    },
  ];
  const handoffPackStatus = handoffChecklist.every((item) => item.status === 'done') ? 'ready' : 'action_needed';

  return {
    handoffStatus,
    headline: handoffStatus === 'ready_for_handoff'
      ? 'Reviewer closure is complete. The draft now looks ready to hand off.'
      : handoffStatus === 'blocked'
        ? `${openItems.length} reviewer action${openItems.length === 1 ? '' : 's'} remain open and final handoff is still blocked.`
        : `${openItems.length} reviewer action${openItems.length === 1 ? '' : 's'} remain open, but the draft is now in final review/polish rather than blocked handoff recovery.`,
    closureSummary,
    totalTrackedCount,
    totalCount: openItems.length,
    resolvedCount,
    highPriorityCount: openHighPriorityCount,
    handoffBlockers: unresolvedHandoffBlockers.map((item) => item.title),
    remainingIssuesPack: {
      headline: remainingIssues.length === 0
        ? 'No remaining reviewer issues are currently open.'
        : `${remainingIssues.length} remaining issue${remainingIssues.length === 1 ? '' : 's'} to carry into handoff.`,
      items: remainingIssues,
    },
    handoffPack: {
      status: handoffPackStatus,
      summary: handoffPackStatus === 'ready'
        ? 'Handoff pack checks are complete. The draft is ready for final human reviewer sign-off and operator handoff.'
        : 'Handoff pack still has open checks. Use the checklist below to close remaining handoff friction before sign-off.',
      nextStep: handoffPackStatus === 'ready'
        ? 'Run final human review and hand this draft to the filing operator with the export pack.'
        : handoffStatus === 'blocked'
          ? 'Resolve filing-readiness and traceability blockers first, then re-check handoff readiness.'
          : 'Finish remaining review warnings/assumptions, then re-check handoff readiness.',
      checklist: handoffChecklist,
    },
    categories: categoryOrder
      .map((category) => {
        const categoryItems = openItems.filter((item) => item.category === category);
        return {
          category,
          label: category === 'filing_readiness'
            ? 'Filing readiness'
            : category === 'traceability'
              ? 'Traceability gaps'
              : category === 'review_warning'
                ? 'Review warnings'
                : 'Assumptions',
          count: categoryItems.length,
          highPriorityCount: categoryItems.filter((item) => item.severity === 'high').length,
        };
      })
      .filter((item) => item.count > 0),
    shortlistHeadline: shortlist.length > 0
      ? handoffStatus === 'blocked'
        ? `Start with the handoff blockers: ${shortlist.map((item) => item.title).join(' · ')}`
        : `Finish the last review pass with ${shortlist.map((item) => item.title).join(' · ')}`
      : 'No shortlist actions are currently needed.',
    recentlyResolvedHeadline: recentlyResolved.length > 0
      ? `Recently resolved (${recentlyResolved.length})`
      : 'No recently resolved actions yet.',
    shortlist,
    items: openItems,
    resolvedItems,
    recentlyResolved,
  };
}

function buildSubmissionReadiness({ questionnaireAnswers = {}, adjustments = {}, map = {}, docs = [], warnings = [], assumptions = [], crypto = {}, calc = {} }) {
  const questionnaire = completionStatus(questionnaireAnswers);
  const missingItems = [];

  if (!questionnaire.complete) {
    missingItems.push({
      code: 'QUESTIONNAIRE_INCOMPLETE',
      severity: 'high',
      label: 'Complete the questionnaire',
      message: `Answer the remaining visible questionnaire prompts (${questionnaire.answeredVisible}/${questionnaire.totalVisible} answered).`,
      targetTab: 'questionnaire',
      actionLabel: 'Open questionnaire',
    });
  }

  const applicableDocuments = buildApplicableDocumentChecklist({
    questionnaireAnswers,
    adjustments,
    map,
    docs,
    crypto,
  });

  for (const item of applicableDocuments.filter((item) => !item.received)) {
    missingItems.push({
      code: `DOC_${item.docType.toUpperCase()}_MISSING`,
      severity: 'medium',
      label: `Upload ${item.label}`,
      message: item.reason,
      targetTab: 'documents',
      actionLabel: 'Open documents',
    });
  }

  warnings
    .filter((warning) => warning.severity === 'high')
    .forEach((warning) => {
      missingItems.push({
        code: `WARNING_${warning.code}`,
        severity: 'high',
        label: 'Resolve high-severity review warning',
        message: warning.message,
        targetTab: 'ir3_summary',
        actionLabel: 'Open IR3 summary',
      });
    });

  const nextActions = [];
  if (!questionnaire.complete) nextActions.push('Finish the remaining visible questionnaire questions.');
  applicableDocuments
    .filter((item) => !item.received)
    .forEach((item) => nextActions.push(`Upload ${item.label.toLowerCase()} to support the draft figures.`));
  if (warnings.some((warning) => warning.severity === 'high')) {
    nextActions.push('Clear the high-severity review warnings before treating the draft as filing-ready.');
  }
  if (assumptions.length > 0) {
    nextActions.push('Review the current assumptions and replace them with real figures or documents where possible.');
  }

  return {
    status: missingItems.length === 0 ? 'ready_to_review' : 'action_needed',
    blockerCount: missingItems.length,
    questionnaire,
    documents: {
      applicableCount: applicableDocuments.length,
      receivedCount: applicableDocuments.filter((item) => item.received).length,
      items: applicableDocuments,
    },
    blockers: missingItems,
    nextActions: Array.from(new Set(nextActions)),
    finalReviewChecklist: buildFinalReviewChecklist({
      questionnaire,
      applicableDocuments,
      warnings,
      assumptions,
      calc,
    }),
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

  if ((questionnaireAnswers.has_student_loan === true || money(adjustments.studentLoanRepayments) > 0) && !docs.some(doc => doc.docType === 'student_loan_statement')) {
    warnings.push({ code: 'MISSING_STUDENT_LOAN_DOC', severity: 'medium', message: 'Student loan treatment is in scope but no student loan statement has been uploaded yet.' });
  }

  if ((questionnaireAnswers.has_donations === true || money(map?.summary?.donationAmount || 0) > 0) && !docs.some(doc => doc.docType === 'donation_receipts')) {
    warnings.push({ code: 'MISSING_DONATION_RECEIPTS', severity: 'medium', message: 'Donation claims are in scope without uploaded donation receipts.' });
  }

  if ((adjustments.pieIncome || 0) > 0 && !(adjustments.pieTaxCredits || 0)) {
    assumptions.push('PIE income has been entered without PIE tax credits, so the current draft assumes no PIE tax credit can be claimed.');
  }

  if ((adjustments.pieTaxCredits || 0) > 0 && !(adjustments.pieIncome || 0)) {
    warnings.push({ code: 'PIE_CREDITS_WITHOUT_INCOME', severity: 'medium', message: 'PIE tax credits were entered without any PIE income, so the draft may be overstating tax already covered.' });
  }

  if ((adjustments.pieIncome || 0) > 0 && (adjustments.pieTaxCredits || 0) > money(adjustments.pieIncome) * 0.28) {
    warnings.push({ code: 'PIE_CREDITS_HIGH_FOR_INCOME', severity: 'medium', message: 'PIE tax credits look high relative to the PIE income entered, so check the annual PIE tax certificate amounts.' });
  }

  if (!(adjustments.studentLoanRepayments || 0) && questionnaireAnswers.has_student_loan === true) {
    assumptions.push('Student loan treatment is still provisional because no repayment/deduction amount has been entered yet.');
  }

  const provisionalTaxStatus = calc?.summary?.provisionalTaxStatus || {};
  if (provisionalTaxStatus.relevant) {
    warnings.push({
      code: 'PROVISIONAL_TAX_RISK',
      severity: 'medium',
      message: `Modeled residual income tax is above NZ$${money(provisionalTaxStatus.threshold).toFixed(2)}, so provisional tax is likely relevant. This draft uses the standard option as a simple estimate basis: current modeled residual income tax plus 5%.`,
    });
  }

  if (crypto.status.saidHasCrypto && !crypto.status.hasAnyCryptoActivity) {
    warnings.push({ code: 'CRYPTO_ACTIVITY_MISSING', severity: 'high', message: 'Crypto was indicated in the questionnaire, but no crypto transactions have been imported yet.' });
  }

  if ((questionnaireAnswers.has_crypto === true || crypto.status.hasAnyCryptoActivity) && !crypto.status.hasCryptoCsv) {
    warnings.push({ code: 'CRYPTO_EVIDENCE_MISSING', severity: 'medium', message: 'Crypto activity is in scope, but no crypto CSV/export has been uploaded as supporting evidence yet.' });
  }

  const warningsWithEvidence = warnings.map((warning) => ({
    ...warning,
    evidence: pickEvidenceForWarning(warning.code, evidence, docs, warningEvidenceOverrides[warning.code]),
    evidenceOverride: normalizeWarningEvidenceOverride(warningEvidenceOverrides[warning.code]),
  }));

  const score = Math.max(0, 100 - warningsWithEvidence.length * 20 - assumptions.length * 8);
  const traceability = buildFieldTraceability(map, calc, evidence);

  const submissionReadiness = buildSubmissionReadiness({
    questionnaireAnswers,
    adjustments,
    map,
    docs,
    warnings: warningsWithEvidence,
    assumptions,
    crypto,
    calc,
  });
  const reviewerActionQueue = buildReviewerActionQueue({
    submissionReadiness,
    traceability,
    warnings: warningsWithEvidence,
    assumptions,
    resolutions: workspace?.reviewerActionResolutions || {},
  });

  return {
    readiness: {
      score,
      status: score >= 85 ? 'strong' : score >= 60 ? 'review_needed' : 'needs_attention',
    },
    submissionReadiness,
    warnings: warningsWithEvidence,
    assumptions,
    evidence,
    traceability,
    reviewerActionQueue,
    crypto,
    summary: {
      donationAmount: money(map?.summary?.donationAmount || 0),
      pieIncome: money(adjustments.pieIncome),
      pieTaxCredits: money(adjustments.pieTaxCredits),
      extraTaxDeducted: money(adjustments.extraTaxDeducted),
      studentLoanRepayments: money(adjustments.studentLoanRepayments),
      provisionalTaxStatus: {
        threshold: money(provisionalTaxStatus.threshold || 5000),
        standardOptionUpliftRate: Number(provisionalTaxStatus.standardOptionUpliftRate || 0.05),
        relevant: provisionalTaxStatus.relevant === true,
        modeledResidualIncomeTax: money(provisionalTaxStatus.modeledResidualIncomeTax || calc?.summary?.terminalTaxToPay || 0),
        estimatedStandardOptionTax: money(provisionalTaxStatus.estimatedStandardOptionTax || calc?.summary?.provisionalTax || 0),
        estimateBasis: provisionalTaxStatus.estimateBasis || 'standard_option_current_modeled_rit_plus_5_percent',
      },
      studentLoanStatus: {
        hasStudentLoan: questionnaireAnswers.has_student_loan === true,
        hasStatement: docs.some((doc) => doc.docType === 'student_loan_statement'),
        repaymentsEntered: money(adjustments.studentLoanRepayments),
        status: questionnaireAnswers.has_student_loan !== true
          ? 'not_applicable'
          : docs.some((doc) => doc.docType === 'student_loan_statement') && money(adjustments.studentLoanRepayments) > 0
            ? 'ready'
            : docs.some((doc) => doc.docType === 'student_loan_statement') || money(adjustments.studentLoanRepayments) > 0
              ? 'partial'
              : 'needs_attention',
      },
      items: buildAdjustmentSummary(adjustments, map?.summary || {}),
    },
  };
}
