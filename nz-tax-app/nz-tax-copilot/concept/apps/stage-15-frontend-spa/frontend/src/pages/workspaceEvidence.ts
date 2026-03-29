import type { DocumentEvidenceLink, EvidenceLinkOption, ReviewEvidenceItem, ReviewWarning, WorkspaceDocument, DocumentEvidenceLinksPayload } from '../api/workspaceFlows'

export function findEvidenceForDocument(docId: string, evidence: ReviewEvidenceItem[]) {
  return evidence.filter((item) => item.documentId === docId)
}

export function getEvidenceLinkOptionValue(option: EvidenceLinkOption) {
  if (!option.value) return 'auto'
  if (option.value.mode === 'none') return 'none'
  return option.key
}

export function isSameEvidenceLink(left: DocumentEvidenceLink | undefined, right: DocumentEvidenceLink | undefined) {
  if (!left || !right || left.mode !== 'manual' || right.mode !== 'manual') return false
  return left.supports === right.supports
    && left.section === right.section
    && JSON.stringify(left.ir3Refs || []) === JSON.stringify(right.ir3Refs || [])
    && (left.summaryKey || null) === (right.summaryKey || null)
}

export function getSelectedEvidenceLinkValues(document: WorkspaceDocument, options: EvidenceLinkOption[]) {
  if (document.evidenceLink?.mode === 'none') return ['none']
  const manualLinks = document.evidenceLinks || (document.evidenceLink?.mode === 'manual' ? [document.evidenceLink] : [])
  const selected = manualLinks
    .map((link) => options.find((option) => option.value?.mode === 'manual' && isSameEvidenceLink(option.value, link))?.key)
    .filter(Boolean) as string[]
  return selected.length > 0 ? selected : ['auto']
}

export function normalizeEvidenceLinkSelection(value: string | string[]) {
  const values = Array.isArray(value) ? value : [value]
  const unique = Array.from(new Set(values.filter(Boolean)))
  if (unique.includes('none')) return ['none']
  const manual = unique.filter((item) => item !== 'auto')
  return manual.length > 0 ? manual : ['auto']
}

export function describeEvidenceLinkSelection(values: string[], options: EvidenceLinkOption[]) {
  if (values.includes('none')) return 'Do not link this document'
  const manual = values.filter((value) => value !== 'auto')
  if (manual.length === 0) return 'Use automatic link'
  return manual
    .map((value) => options.find((option) => option.key === value)?.label || value)
    .join(', ')
}

export function resolveEvidenceLinkPayload(values: string[], options: EvidenceLinkOption[]): DocumentEvidenceLinksPayload {
  if (values.includes('none')) return { mode: 'none' }
  const manualLinks = values
    .filter((value) => value !== 'auto')
    .map((value) => options.find((item) => item.key === value)?.value)
    .filter((value): value is Exclude<NonNullable<DocumentEvidenceLink>, { mode: 'none' }> => Boolean(value && value.mode === 'manual'))
  return manualLinks.length > 0 ? manualLinks : null
}

export function getWarningEvidenceLabel(warning: ReviewWarning, item: ReviewEvidenceItem) {
  if (item.supports && item.supports !== warning.message) return item.supports
  return item.document
}

export function getIr3FieldEvidenceLabel(item: ReviewEvidenceItem) {
  return item.supports || item.document
}
