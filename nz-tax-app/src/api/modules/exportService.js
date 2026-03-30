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
    gaps: (traceability?.gaps || []).map((gap) => ({
      ref: gap.ref,
      label: gap.label,
      severity: gap.severity,
      reason: gap.reason,
      fieldFamily: gap.fieldFamily,
      requestArea: gap.requestArea,
      requestText: gap.requestText,
      suggestedDocTypes: gap.suggestedDocTypes || [],
    })),
    followUpPack: {
      headline: traceability?.followUpPack?.headline || '',
      items: (traceability?.followUpPack?.items || []).map((item) => ({
        id: item.id,
        ref: item.ref,
        label: item.label,
        severity: item.severity,
        fieldFamily: item.fieldFamily,
        requestArea: item.requestArea,
        requestText: item.requestText,
        reason: item.reason,
        suggestedDocTypes: item.suggestedDocTypes || [],
      })),
    },
  };
}


function buildReviewerActionQueueSummary(review = null) {
  const queue = review?.reviewerActionQueue;
  const items = queue?.items || [];

  return {
    handoffStatus: queue?.handoffStatus || (items.length === 0 ? 'ready_for_handoff' : 'blocked'),
    headline: queue?.headline || (items.length === 0
      ? 'Reviewer closure is complete. The draft now looks ready to hand off.'
      : `${items.length} reviewer action${items.length === 1 ? '' : 's'} remain open and final handoff is still blocked.`),
    closureSummary: queue?.closureSummary || '',
    totalTrackedCount: queue?.totalTrackedCount || ((queue?.resolvedItems || []).length + items.length),
    totalCount: queue?.totalCount || items.length,
    highPriorityCount: queue?.highPriorityCount || items.filter((item) => item?.severity === 'high').length,
    resolvedCount: queue?.resolvedCount || (queue?.resolvedItems || []).length,
    categories: (queue?.categories || []).map((item) => ({
      category: item.category,
      label: item.label,
      count: item.count,
      highPriorityCount: item.highPriorityCount,
    })),
    handoffBlockers: queue?.handoffBlockers || [],
    remainingIssuesPack: {
      headline: queue?.remainingIssuesPack?.headline || '',
      items: (queue?.remainingIssuesPack?.items || []).map((item) => ({
        id: item.id,
        title: item.title,
        severity: item.severity,
        requestArea: item.requestArea,
        requestText: item.requestText,
        category: item.category,
      })),
    },
    handoffPack: {
      status: queue?.handoffPack?.status || (items.length === 0 ? 'ready' : 'action_needed'),
      summary: queue?.handoffPack?.summary || (items.length === 0
        ? 'Handoff pack checks are complete. The draft is ready for final human reviewer sign-off and operator handoff.'
        : 'Handoff pack still has open checks. Resolve remaining reviewer actions before operator handoff.'),
      nextStep: queue?.handoffPack?.nextStep || (items.length === 0
        ? 'Run final human review and hand this draft to the filing operator with the export pack.'
        : 'Resolve open reviewer actions, then re-check handoff readiness.'),
      checklist: (queue?.handoffPack?.checklist || []).map((item) => ({
        key: item.key,
        label: item.label,
        status: item.status,
        detail: item.detail,
      })),
    },
    finalSignoff: {
      status: queue?.finalSignoff?.status || 'pending',
      signedOffAt: queue?.finalSignoff?.signedOffAt || null,
      signedOffBy: queue?.finalSignoff?.signedOffBy || null,
      overrideReason: queue?.finalSignoff?.overrideReason || '',
      requiresOverride: queue?.finalSignoff?.requiresOverride === true,
      signedOffAgainstStatus: queue?.finalSignoff?.signedOffAgainstStatus || null,
      isStale: queue?.finalSignoff?.isStale === true,
      staleReason: queue?.finalSignoff?.staleReason || '',
      recoveryStep: queue?.finalSignoff?.recoveryStep || '',
      summary: queue?.finalSignoff?.summary || 'Final reviewer sign-off is pending.',
    },
    shortlistHeadline: queue?.shortlistHeadline || null,
    recentlyResolvedHeadline: queue?.recentlyResolvedHeadline || null,
    shortlist: (queue?.shortlist || []).map((item) => ({
      id: item.id,
      severity: item.severity,
      title: item.title,
      requestText: item.requestText,
      requestArea: item.requestArea,
      supportState: item.supportState,
      actionType: item.actionType,
      resolutionStatus: item.resolutionStatus,
      resolvedAt: item.resolvedAt || null,
      resolutionNote: item.resolutionNote || '',
    })),
    items: items.map((item) => ({
      id: item.id,
      sourceType: item.sourceType,
      sourceKey: item.sourceKey,
      severity: item.severity,
      title: item.title,
      detail: item.detail,
      requestText: item.requestText,
      requestArea: item.requestArea,
      targetTab: item.targetTab,
      actionLabel: item.actionLabel,
      category: item.category,
      supportState: item.supportState,
      actionType: item.actionType,
      resolutionStatus: item.resolutionStatus,
      resolvedAt: item.resolvedAt || null,
    })),
    resolvedItems: (queue?.resolvedItems || []).map((item) => ({
      id: item.id,
      sourceType: item.sourceType,
      sourceKey: item.sourceKey,
      severity: item.severity,
      title: item.title,
      detail: item.detail,
      requestText: item.requestText,
      requestArea: item.requestArea,
      targetTab: item.targetTab,
      actionLabel: item.actionLabel,
      category: item.category,
      supportState: item.supportState,
      actionType: item.actionType,
      resolutionStatus: item.resolutionStatus,
      resolvedAt: item.resolvedAt || null,
      resolutionNote: item.resolutionNote || '',
    })),
    recentlyResolved: (queue?.recentlyResolved || queue?.resolvedItems || []).map((item) => ({
      id: item.id,
      sourceType: item.sourceType,
      sourceKey: item.sourceKey,
      severity: item.severity,
      title: item.title,
      detail: item.detail,
      requestText: item.requestText,
      requestArea: item.requestArea,
      targetTab: item.targetTab,
      actionLabel: item.actionLabel,
      category: item.category,
      supportState: item.supportState,
      actionType: item.actionType,
      resolutionStatus: item.resolutionStatus,
      resolvedAt: item.resolvedAt || null,
      resolutionNote: item.resolutionNote || '',
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
  const actionQueue = buildReviewerActionQueueSummary(review);

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

  rows.push(['reviewer_action_queue', 'headline', actionQueue.headline]);
  rows.push(['reviewer_action_queue', 'handoff_status', String(actionQueue.handoffStatus || '')]);
  rows.push(['reviewer_action_queue', 'closure_summary', String(actionQueue.closureSummary || '')]);
  rows.push(['reviewer_action_queue', 'high_priority_count', String(actionQueue.highPriorityCount)]);
  rows.push(['reviewer_action_queue', 'resolved_count', String(actionQueue.resolvedCount || 0)]);
  rows.push(['reviewer_handoff_pack', 'status', String(actionQueue.handoffPack?.status || '')]);
  rows.push(['reviewer_handoff_pack', 'summary', String(actionQueue.handoffPack?.summary || '')]);
  rows.push(['reviewer_handoff_pack', 'next_step', String(actionQueue.handoffPack?.nextStep || '')]);
  (actionQueue.handoffPack?.checklist || []).forEach((item, index) => {
    rows.push(['reviewer_handoff_pack_check', `item_${index + 1}`, `${item.label}:${item.status}:${item.detail}`]);
  });
  rows.push(['reviewer_final_signoff', 'status', String(actionQueue.finalSignoff?.status || 'pending')]);
  rows.push(['reviewer_final_signoff', 'summary', String(actionQueue.finalSignoff?.summary || '')]);
  rows.push(['reviewer_final_signoff', 'signed_off_at', String(actionQueue.finalSignoff?.signedOffAt || '')]);
  rows.push(['reviewer_final_signoff', 'signed_off_by', String(actionQueue.finalSignoff?.signedOffBy || '')]);
  rows.push(['reviewer_final_signoff', 'override_reason', String(actionQueue.finalSignoff?.overrideReason || '')]);
  rows.push(['reviewer_final_signoff', 'signed_off_against_handoff_pack_status', String(actionQueue.finalSignoff?.signedOffAgainstStatus || '')]);
  rows.push(['reviewer_final_signoff', 'is_stale', String(actionQueue.finalSignoff?.isStale === true)]);
  rows.push(['reviewer_final_signoff', 'stale_reason', String(actionQueue.finalSignoff?.staleReason || '')]);
  rows.push(['reviewer_final_signoff', 'recovery_step', String(actionQueue.finalSignoff?.recoveryStep || '')]);
  if (actionQueue.remainingIssuesPack?.headline) {
    rows.push(['reviewer_remaining_issues', 'headline', actionQueue.remainingIssuesPack.headline]);
  }
  (actionQueue.remainingIssuesPack?.items || []).forEach((item, index) => {
    rows.push(['reviewer_remaining_issue', `item_${index + 1}`, `${item.severity}: ${item.title} -- ${item.requestArea} -- ${item.requestText}`]);
  });
  if (actionQueue.shortlistHeadline) {
    rows.push(['reviewer_action_shortlist', 'headline', actionQueue.shortlistHeadline]);
  }
  (actionQueue.categories || []).forEach((item, index) => {
    rows.push(['reviewer_action_queue_category', `category_${index + 1}`, `${item.label}:${item.count}:${item.highPriorityCount}`]);
  });
  (actionQueue.shortlist || []).forEach((item, index) => {
    rows.push(['reviewer_action_shortlist', `item_${index + 1}`, `${item.severity}: ${item.title} -- ${item.supportState || 'review_required'} -- ${item.actionType || 'review_tax_position'} -- ${item.requestArea} -- ${item.requestText}`]);
  });
  actionQueue.items.forEach((item, index) => {
    rows.push(['reviewer_action', `item_${index + 1}`, `${item.severity}: ${item.title} -- ${item.supportState || 'review_required'} -- ${item.actionType || 'review_tax_position'} -- ${item.requestArea} -- ${item.requestText}`]);
  });
  (actionQueue.resolvedItems || []).forEach((item, index) => {
    rows.push(['reviewer_action_resolved', `item_${index + 1}`, `${item.severity}: ${item.title} -- resolved -- ${item.requestArea} -- ${item.requestText}`]);
  });

  rows.push(['traceability', 'coverage', `${traceSummary.evidencedFieldCount}/${traceSummary.keyFieldCount}`]);
  traceSummary.items.forEach((item, index) => {
    rows.push(['traceability_field', `field_${index + 1}`, `${item.ref}: ${item.label} [${item.traceStatus}] evidence=${item.evidenceCount}`]);
  });
  traceSummary.gaps.forEach((gap, index) => {
    rows.push(['traceability_gap', `gap_${index + 1}`, `${gap.ref}: ${gap.label} [${gap.severity}] ${gap.reason}`]);
  });
  if (traceSummary.followUpPack?.headline) {
    rows.push(['traceability_follow_up', 'headline', traceSummary.followUpPack.headline]);
  }
  (traceSummary.followUpPack?.items || []).forEach((item, index) => {
    rows.push(['traceability_follow_up', `item_${index + 1}`, `${item.ref}: ${item.label} [${item.severity}] ${item.requestArea} — ${item.requestText}`]);
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
    const actionQueue = buildReviewerActionQueueSummary(review);
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
    doc.fontSize(14).text('Reviewer action queue');
    doc.fontSize(11).text(actionQueue.headline);
    if (actionQueue.closureSummary) doc.text(actionQueue.closureSummary);
    doc.text(`Handoff status: ${String(actionQueue.handoffStatus || 'blocked').replaceAll('_', ' ')}`);
    doc.text(`High-priority reviewer actions: ${actionQueue.highPriorityCount}/${actionQueue.totalCount}`);
    doc.text(`Resolved reviewer actions: ${actionQueue.resolvedCount || 0}`);
    (actionQueue.categories || []).forEach((item) => doc.text(`• ${item.label}: ${item.count} queued (${item.highPriorityCount} high priority)`));
    if (actionQueue.remainingIssuesPack?.headline) {
      doc.text(`Remaining issues: ${actionQueue.remainingIssuesPack.headline}`);
    }
    (actionQueue.remainingIssuesPack?.items || []).forEach((item) => doc.text(`• REMAINING · ${item.severity.toUpperCase()} · ${item.title}: ${item.requestArea} -- ${item.requestText}`));
    if (actionQueue.shortlistHeadline) {
      doc.text(`Shortlist: ${actionQueue.shortlistHeadline}`);
    }
    (actionQueue.shortlist || []).forEach((item) => doc.text(`• SHORTLIST · ${item.severity.toUpperCase()} · ${item.title}: ${item.supportState || 'review_required'} / ${item.actionType || 'review_tax_position'} · ${item.requestArea} -- ${item.requestText}`));
    actionQueue.items.slice(0, 8).forEach((item) => doc.text(`• ${item.severity.toUpperCase()} · ${item.title}: ${item.supportState || 'review_required'} / ${item.actionType || 'review_tax_position'} · ${item.requestArea} -- ${item.requestText}`));
    (actionQueue.resolvedItems || []).slice(0, 5).forEach((item) => doc.text(`• RESOLVED · ${item.severity.toUpperCase()} · ${item.title}: ${item.requestArea} -- ${item.requestText}${item.resolutionNote ? ` -- note: ${item.resolutionNote}` : ''}`));
    if (actionQueue.handoffPack?.summary) {
      doc.text(`Handoff pack: ${actionQueue.handoffPack.summary}`);
      doc.text(`Next operator step: ${actionQueue.handoffPack.nextStep || ''}`);
      (actionQueue.handoffPack.checklist || []).forEach((item) => doc.text(`• HANDOFF CHECK · ${String(item.status || '').toUpperCase()} · ${item.label}: ${item.detail}`));
    }
    if (actionQueue.finalSignoff?.summary) {
      doc.text(`Final sign-off: ${actionQueue.finalSignoff.summary}`);
      if (actionQueue.finalSignoff.signedOffAt || actionQueue.finalSignoff.signedOffBy) {
        doc.text(`Sign-off recorded at ${actionQueue.finalSignoff.signedOffAt || 'n/a'} by ${actionQueue.finalSignoff.signedOffBy || 'unknown reviewer'}`);
      }
      if (actionQueue.finalSignoff.overrideReason) {
        doc.text(`Override reason: ${actionQueue.finalSignoff.overrideReason}`);
      }
    }

    doc.moveDown();
    doc.fontSize(14).text('Reviewer traceability');
    doc.fontSize(11).text(`Key IR3 fields with attached evidence: ${traceSummary.evidencedFieldCount}/${traceSummary.keyFieldCount}`);
    traceSummary.items.forEach((item) => doc.text(`• ${item.ref} ${item.label}: ${item.traceStatus} (${item.evidenceCount} evidence item${item.evidenceCount === 1 ? '' : 's'})`));
    if (traceSummary.followUpPack?.headline) {
      doc.moveDown(0.5);
      doc.text(traceSummary.followUpPack.headline);
    }
    if (traceSummary.followUpPack?.items?.length) {
      doc.moveDown(0.35);
      doc.text('Reviewer follow-up pack:');
      traceSummary.followUpPack.items.forEach((item) => doc.text(`- ${item.ref} ${item.label}: ${item.requestArea} — ${item.requestText}`));
    } else if (traceSummary.gaps.length) {
      doc.moveDown(0.5);
      doc.text('Reviewer follow-up for traceability gaps:');
      traceSummary.gaps.forEach((gap) => doc.text(`- ${gap.ref} ${gap.label}: ${gap.reason}`));
    }

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
      { name: 'Reviewer Action Queue', values: buildReviewerActionQueueSummary(review) },
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
      { name: 'Reviewer Action Queue', values: buildReviewerActionQueueSummary(review) },
      { name: 'Reviewer Traceability', values: buildTraceabilitySummary(review) },
      { name: 'Mapped Fields', values: map },
      { name: 'Calculated Fields', values: calc },
      { name: 'Plain-English Summary', values: explanation || {} },
      { name: 'Review Readiness', values: review || {} },
      { name: 'Supporting Document Checklist', values: { items: docChecklist || [] } },
    ],
  };
}

