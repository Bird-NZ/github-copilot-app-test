function sum(rows = [], field) {
  return rows.reduce((acc, row) => acc + Number(row?.[field] || 0), 0);
}

export function mapToIr3({ income, cryptoTx }) {
  const payeGross = sum(income?.paye || [], 'gross');
  const payeWithheld = sum(income?.paye || [], 'payeWithheld');
  const interestIncome = sum(income?.interest || [], 'amount');
  const dividendIncome = sum(income?.dividends || [], 'amount');
  const otherIncome = sum(income?.other || [], 'amount');
  const cryptoIncome = (cryptoTx || [])
    .filter(t => t.type === 'staking' || t.type === 'airdrop')
    .reduce((a, r) => a + (Number(r.amount || 0) * Number(r.priceNzd || 0)), 0);

  const totalOtherIncome = Number((interestIncome + dividendIncome + otherIncome + cryptoIncome).toFixed(2));

  return {
    '11A': Number(payeWithheld.toFixed(2)),
    '11B': Number(payeGross.toFixed(2)),
    '11E': Number(payeWithheld.toFixed(2)),
    '28': totalOtherIncome,
    summary: {
      payeGross: Number(payeGross.toFixed(2)),
      payeWithheld: Number(payeWithheld.toFixed(2)),
      interestIncome: Number(interestIncome.toFixed(2)),
      dividendIncome: Number(dividendIncome.toFixed(2)),
      otherIncome: Number(otherIncome.toFixed(2)),
      cryptoIncome: Number(cryptoIncome.toFixed(2)),
      totalOtherIncome,
    },
  };
}
