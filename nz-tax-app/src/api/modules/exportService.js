import PDFDocument from 'pdfkit';

function money(value) {
  return `NZ$${Number(value || 0).toFixed(2)}`;
}

export function buildCsv(map, calc, explanation = null) {
  const rows = [['section','ref','value']];

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

  return rows.map(r => r.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
}

function buildPdfBuffer(map, calc, explanation = null) {
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
    doc.fontSize(14).text('Tax position');
    doc.fontSize(11);
    doc.text(`Taxable income: ${money(summary.taxableIncome)}`);
    doc.text(`Estimated income tax: ${money(summary.incomeTax)}`);
    doc.text(`Tax deducted/credited: ${money(summary.taxCreditsAndDeductions)}`);
    doc.text(`Residual income tax: ${money(summary.residualIncomeTax)}`);
    doc.text(`Estimated refund: ${money(summary.estimatedRefund)}`);
    doc.text(`Terminal tax to pay: ${money(summary.terminalTaxToPay)}`);
    doc.text(`Provisional tax estimate: ${money(summary.provisionalTax)}`);

    if (explanation?.headline) {
      doc.moveDown();
      doc.fontSize(14).text('Plain-English summary');
      doc.fontSize(11).text(explanation.headline);
      (explanation.bullets || []).forEach((bullet) => doc.text(`• ${bullet}`));
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

export async function buildPdfDocument(map, calc, explanation = null) {
  const buffer = await buildPdfBuffer(map, calc, explanation);
  return {
    title: 'IR3 Draft Summary',
    generatedAt: new Date().toISOString(),
    mimeType: 'application/pdf',
    filename: `ir3-draft-${new Date().toISOString().slice(0,10)}.pdf`,
    bytesBase64: buffer.toString('base64'),
    sections: [
      { name: 'Mapped Fields', values: map },
      { name: 'Calculated Fields', values: calc },
      { name: 'Plain-English Summary', values: explanation || {} },
    ]
  };
}

export function buildPdfPlaceholder(map, calc, explanation = null) {
  return {
    title: 'IR3 Draft Summary',
    generatedAt: new Date().toISOString(),
    sections: [
      { name: 'Mapped Fields', values: map },
      { name: 'Calculated Fields', values: calc },
      { name: 'Plain-English Summary', values: explanation || {} },
    ]
  };
}
