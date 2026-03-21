const QUESTION_SET = [
  { id: 'has_student_loan', type: 'boolean', label: 'Do you have a student loan?' },
  { id: 'student_loan_statement_uploaded', type: 'boolean', label: 'Have you uploaded latest IRD student loan statement?', visibleIf: { has_student_loan: true } },
  { id: 'has_crypto', type: 'boolean', label: 'Did you have cryptocurrency transactions this year?' },
  { id: 'crypto_csv_uploaded', type: 'boolean', label: 'Have you uploaded your exchange/wallet CSV?', visibleIf: { has_crypto: true } },
  { id: 'has_rental_property', type: 'boolean', label: 'Did you receive rental income?' },
  { id: 'rental_questionnaire_complete', type: 'boolean', label: 'Rental questionnaire complete?', visibleIf: { has_rental_property: true } }
];

export function getQuestionSet() {
  return QUESTION_SET;
}

export function visibleQuestions(answers = {}) {
  return QUESTION_SET.filter(q => {
    if (!q.visibleIf) return true;
    return Object.entries(q.visibleIf).every(([k, v]) => answers[k] === v);
  });
}

export function completionStatus(answers = {}) {
  const visible = visibleQuestions(answers);
  const answeredCount = visible.filter(q => answers[q.id] !== undefined && answers[q.id] !== null).length;
  return {
    totalVisible: visible.length,
    answeredVisible: answeredCount,
    complete: visible.length > 0 && answeredCount === visible.length
  };
}
