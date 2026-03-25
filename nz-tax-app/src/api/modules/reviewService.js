function money(value) {
  return Number((Number(value || 0)).toFixed(2));
}

export function buildReview(workspace, map, calc, docs = []) {
  const adjustments = workspace?.adjustments || {};
  const questionnaireAnswers = workspace?.questionnaireAnswers || {};
  const warnings = [];
  const assumptions = [];
  const evidence = [];

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

  for (const doc of docs) {
    if (doc.docType === 'donation_receipts') evidence.push({ supports: 'donation claims', document: doc.originalName || doc.filename });
    if (doc.docType === 'student_loan_statement') evidence.push({ supports: 'student loan treatment', document: doc.originalName || doc.filename });
    if (doc.docType === 'interest_dividend_slips') evidence.push({ supports: 'interest/dividend income', document: doc.originalName || doc.filename });
    if (doc.docType === 'paye_summary') evidence.push({ supports: 'PAYE income', document: doc.originalName || doc.filename });
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
    summary: {
      donationAmount: money(adjustments.donationAmount),
      pieIncome: money(adjustments.pieIncome),
      pieTaxCredits: money(adjustments.pieTaxCredits),
      studentLoanRepayments: money(adjustments.studentLoanRepayments),
    },
  };
}
