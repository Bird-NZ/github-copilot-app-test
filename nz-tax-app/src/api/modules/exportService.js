import PDFDocument from 'pdfkit';

function money(value) {
  return `NZ$${Number(value || 0).toFixed(2)}`;
}

function buildTraceabilitySummary(review = null) {
  const traceability = review?.traceability;
  const items = traceability?.items || [];

  return {
    keyFieldCount: traceability?.keyFieldCount || items.length,
    evidencedFieldCount: traceability?.evidencedFieldCount || items.filter((item) => item?.evidenceCount > 0).length,
    explainedFieldCount: traceability?.explainedFieldCount || items.filter((item) => item?.source || item?.note).length,
    items: items.map((item) => ({
      ref: item.ref,
      label: item.label,
      traceStatus: item.traceStatus,
      evidenceCount: item.evidenceCount,
      source: item.source,
    })),
  };
}

function buildFilingReadinessSummary(review = null) {
  const readiness = review?.submissionReadiness;
  const blockers = readiness?.blockers || [];
  const assumptions = review?.assumptions || [];
  const nextActions = readiness?.nextActions || [];

  return {
    status: readiness?.status || 'action_needed',
    headline: readiness?.status === 'ready_to_review'
      ? 'Ready for final human review before submission.'
      : `${blockers.length} filing blocker${blockers.length === 1 ? '' : 's'} still need attention before submission handoff.`,
    blockerCount: blockers.length,
    blockers: blockers.map((blocker) => ({
      code: blocker.code,
      severity: blocker.severity,
      label: blocker.label,
      message: blocker.message,
    })),
    assumptions,
    nextActions,
    reviewerNotes: [
      readiness?.questionnaire
        ? `Questionnaire completeness: ${readiness.questionnaire.answeredVisible}/${readiness.questionnaire.totalVisible} visible answers captured.`
        : null,
      readiness?.documents
        ? `Supporting documents received: ${readiness.documents.receivedCount}/${readiness.documents.applicableCount} applicable items.`
        : null,
    ].filter(Boolean),
  };
}

export function buildCsv(map, calc, explanation = null, review = null, docChecklist = []) {
  const rows = [['section', 'ref', 'value']];
  const filingSummary = buildFilingReadinessSummary(review);
  const traceSummary = buildTraceabilitySummary(review);

  for (const [k, v] of Object.entries(map)) {
    if (k === 'summary') continue;
    rows.push(['mapped', k, String(v)]);
  }

  for (const [k, v] of Object.entries(calc)) {
    if (k === 'summary') continue;
    rows.push(['calculated', k, String(v)]);
  }

  if (calc.summary) {
    for (const [k, v] of Object.entries(calc.summary)) {
      if (k === 'taxBandBreakdown') continue;
      rows.push(['summary', k, String(v)]);
    }
  }

  if (explanation?.bullets) {
    explanation.bullets.forEach((text, index) => {
      rows.push(['explanation', `bullet_${index + 1}`, text]);
    });
  }

  rows.push(['filing_readiness', 'headline', filingSummary.headline]);
  filingSummary.reviewerNotes.forEach((note, index) => {
    rows.push(['filing_readiness_note', `note_${index + 1}`, note]);
  });

  (review?.warnings || []).forEach((warning, index) => {
    rows.push(['review_warning', `warning_${index + 1}`, `${warning.code}: ${warning.message}`]);
  });

  (review?.assumptions || []).forEach((assumption, index) => {
    rows.push(['review_assumption', `assumption_${index + 1}`, assumption]);
  });

  (review?.submissionReadiness?.blockers || []).forEach((blocker, index) => {
    rows.push(['submission_blocker', `blocker_${index + 1}`, `${blocker.code}: ${blocker.message}`]);
  });

  filingSummary.nextActions.forEach((action, index) => {
    rows.push(['filing_next_action', `action_${index + 1}`, action]);
  });

  rows.push(['traceability', 'coverage', `${traceSummary.evidencedFieldCount}/${traceSummary.keyFieldCount}`]);
  traceSummary.items.forEach((item, index) => {
    rows.push(['traceability_field', `field_${index + 1}`, `${item.ref}: ${item.label} [${item.traceStatus}] evidence=${item.evidenceCount}`]);
  });

  (docChecklist || []).forEach((item) => {
    rows.push(['checklist', item.docType, `${item.label || item.docType}:${item.status}:${item.count}`]);
  });

  return rows.map((r) => r.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
}

function buildPdfBuffer(map, calc, explanation = null, review = null, docChecklist = []) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text('NZ Tax Copilot — IR3 Draft Summary');
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#666').text(`Generated: ${new Date().toISOString()}`);
    doc.fillColor('#000');
    doc.moveDown();

    const summary = calc.summary || {};
    const filingSummary = buildFilingReadinessSummary(review);
    const traceSummary = buildTraceabilitySummary(review);
    doc.fontSize(14).text('Tax position');
    doc.fontSize(11);
    doc.text(`Taxable income: ${money(summary.taxableIncome)}`);
    doc.text(`Estimated income tax: ${money(summary.incomeTax)}`);
    doc.text(`Tax deducted/credited: ${money(summary.taxCreditsAndDeductions)}`);
    doc.text(`Residual income tax: ${money(summary.residualIncomeTax)}`);
    doc.text(`Estimated refund: ${money(summary.estimatedRefund)}`);
    doc.text(`Terminal tax to pay: ${money(summary.terminalTaxToPay)}`);
    doc.text(`Provisional tax estimate: ${money(summary.provisionalTax)}`);
    if (summary.provisionalTaxStatus) {
      doc.text(`Provisional tax threshold: ${money(summary.provisionalTaxStatus.threshold)}`);
      doc.text(`Standard option uplift basis: ${(Number(summary.provisionalTaxStatus.standardOptionUpliftRate || 0) * 100).toFixed(0)}%`);
      doc.text(`Provisional tax relevant: ${summary.provisionalTaxStatus.relevant ? 'Yes' : 'No'}`);
    }

    doc.moveDown();
    doc.fontSize(14).text('Filing readiness summary');
    doc.fontSize(11).text(filingSummary.headline);
    filingSummary.reviewerNotes.forEach((note) => doc.text(`• ${note}`));
    filingSummary.nextActions.forEach((action) => doc.text(`Next action: ${action}`));

    doc.moveDown();
    doc.fontSize(14).text('Reviewer traceability');
    doc.fontSize(11).text(`Key IR3 fields with attached evidence: ${traceSummary.evidencedFieldCount}/${traceSummary.keyFieldCount}`);
    traceSummary.items.forEach((item) => doc.text(`• ${item.ref} ${item.label}: ${item.traceStatus} (${item.evidenceCount} evidence item${item.evidenceCount === 1 ? '' : 's'})`));

    if (explanation?.headline) {
      doc.moveDown();
      doc.fontSize(14).text('Plain-English summary');
      doc.fontSize(11).text(explanation.headline);
      (explanation.bullets || []).forEach((bullet) => doc.text(`• ${bullet}`));

      if (explanation.summaryCards?.length) {
        doc.moveDown(0.5);
        explanation.summaryCards.forEach((card) => {
          doc.font('Helvetica-Bold').text(`${card.label}: ${card.value}`);
          doc.font('Helvetica').text(`${card.description}`);
          doc.fillColor('#666').text(`Where this came from: ${card.source}${card.ir3Ref ? ` (${card.ir3Ref})` : ''}`);
          doc.fillColor('#000');
          doc.moveDown(0.35);
        });
      }
    }

    if (review?.warnings?.length || review?.assumptions?.length || review?.submissionReadiness?.blockers?.length) {
      doc.moveDown();
      doc.fontSize(14).text('Review warnings and assumptions');
      doc.fontSize(11);
      (review.warnings || []).forEach((warning) => doc.text(`Warning (${warning.severity}): ${warning.message}`));
      (review.assumptions || []).forEach((assumption) => doc.text(`Assumption: ${assumption}`));
      (review.submissionReadiness?.blockers || []).forEach((blocker) => doc.text(`Submission blocker (${blocker.severity}): ${blocker.label} — ${blocker.message}`));
    }

    if (docChecklist?.length) {
      doc.moveDown();
      doc.fontSize(14).text('Supporting document checklist');
      doc.fontSize(11);
      docChecklist.forEach((item) => doc.text(`${item.label || item.docType}: ${item.status} (${item.count})${item.reason ? ` — ${item.reason}` : ''}`));
    }

    if (map.summary) {
      doc.moveDown();
      doc.fontSize(14).text('Income sources captured');
      doc.fontSize(11);
      doc.text(`PAYE gross: ${money(map.summary.payeGross)}`);
      doc.text(`Interest: ${money(map.summary.interestIncome)}`);
      doc.text(`Dividends: ${money(map.summary.dividendIncome)}`);
      doc.text(`Other income: ${money(map.summary.otherIncome)}`);
      doc.text(`Crypto income: ${money(map.summary.cryptoIncome)}`);
    }

    doc.moveDown();
    doc.fontSize(14).text('IR3 field values');
    doc.fontSize(10);
    Object.entries({ ...map, ...calc })
      .filter(([key]) => key !== 'summary')
      .forEach(([key, value]) => doc.text(`${key}: ${value}`));

    doc.end();
  });
}

export async function buildPdfDocument(map, calc, explanation = null, review = null, docChecklist = []) {
  const buffer = await buildPdfBuffer(map, calc, explanation, review, docChecklist);
  return {
    title: 'IR3 Draft Summary',
    generatedAt: new Date().toISOString(),
    mimeType: 'application/pdf',
    filename: `ir3-draft-${new Date().toISOString().slice(0, 10)}.pdf`,
    bytesBase64: buffer.toString('base64'),
    sections: [
      { name: 'Filing Readiness Summary', values: buildFilingReadinessSummary(review) },
      { name: 'Reviewer Traceability', values: buildTraceabilitySummary(review) },
      { name: 'Mapped Fields', values: map },
      { name: 'Calculated Fields', values: calc },
      { name: 'Plain-English Summary', values: explanation || {} },
      { name: 'Review Readiness', values: review || {} },
      { name: 'Supporting Document Checklist', values: { items: docChecklist || [] } },
    ],
  };
}

export function buildPdfPlaceholder(map, calc, explanation = null, review = null, docChecklist = []) {
  return {
    title: 'IR3 Draft Summary',
    generatedAt: new Date().toISOString(),
    sections: [
      { name: 'Filing Readiness Summary', values: buildFilingReadinessSummary(review) },
      { name: 'Reviewer Traceability', values: buildTraceabilitySummary(review) },
      { name: 'Mapped Fields', values: map },
      { name: 'Calculated Fields', values: calc },
      { name: 'Plain-English Summary', values: explanation || {} },
      { name: 'Review Readiness', values: review || {} },
      { name: 'Supporting Document Checklist', values: { items: docChecklist || [] } },
    ],
  };
}
