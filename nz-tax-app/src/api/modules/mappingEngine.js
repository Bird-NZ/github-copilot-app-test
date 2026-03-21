export function mapToIr3({ income, cryptoTx }) {
  const payeGross = (income?.paye || []).reduce((a, r) => a + Number(r.gross || 0), 0);
  const payeWithheld = (income?.paye || []).reduce((a, r) => a + Number(r.payeWithheld || 0), 0);
  const otherIncome = (income?.other || []).reduce((a, r) => a + Number(r.amount || 0), 0)
    + (cryptoTx || []).filter(t => t.type === 'staking' || t.type === 'airdrop').reduce((a, r) => a + (Number(r.amount || 0) * Number(r.priceNzd || 0)), 0);

  return {
    '11A': payeWithheld,
    '11B': payeGross,
    '11E': payeWithheld,
    '28': otherIncome
  };
}
