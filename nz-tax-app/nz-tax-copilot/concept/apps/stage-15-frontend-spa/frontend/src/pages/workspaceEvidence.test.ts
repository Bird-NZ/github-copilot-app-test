import { describe, expect, it } from 'vitest'
import type {
  EvidenceLinkOption,
  ManualDocumentEvidenceLink,
  ReviewEvidenceItem,
  ReviewWarning,
  WorkspaceDocument,
} from '../api/workspaceFlows'
import {
  describeEvidenceLinkSelection,
  findEvidenceForDocument,
  getIr3FieldEvidenceLabel,
  getSelectedEvidenceLinkValues,
  getWarningEvidenceLabel,
  normalizeEvidenceLinkSelection,
  resolveEvidenceLinkPayload,
} from './workspaceEvidence'

const options: EvidenceLinkOption[] = [
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
]

const payeManualLink = options[2].value as ManualDocumentEvidenceLink
const donationManualLink = options[3].value as ManualDocumentEvidenceLink

describe('workspace evidence helpers', () => {
  it('defaults document evidence selection to automatic when no manual override exists', () => {
    const document = {
      id: 'doc-1',
      workspaceId: 'ws-1',
      filename: 'paye.pdf',
      originalName: 'PAYE.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      docType: 'paye_summary',
      status: 'uploaded',
      uploadedAt: '2026-03-29T00:00:00.000Z',
      evidenceLink: null,
      evidenceLinks: [],
    } satisfies WorkspaceDocument

    expect(getSelectedEvidenceLinkValues(document, options)).toEqual(['auto'])
  })

  it('returns all matching manual evidence links for multi-area document overrides', () => {
    const document = {
      id: 'doc-2',
      workspaceId: 'ws-1',
      filename: 'bundle.pdf',
      originalName: 'bundle.pdf',
      mimeType: 'application/pdf',
      size: 2048,
      docType: 'other',
      status: 'uploaded',
      uploadedAt: '2026-03-29T00:00:00.000Z',
      evidenceLink: null,
      evidenceLinks: [payeManualLink, donationManualLink],
    } satisfies WorkspaceDocument

    expect(getSelectedEvidenceLinkValues(document, options)).toEqual(['paye_income', 'donation_claims'])
  })

  it('normalizes evidence selection so none wins and auto is dropped when manual links are picked', () => {
    expect(normalizeEvidenceLinkSelection(['auto', 'paye_income', 'donation_claims'])).toEqual(['paye_income', 'donation_claims'])
    expect(normalizeEvidenceLinkSelection(['auto', 'none', 'paye_income'])).toEqual(['none'])
  })

  it('builds patch payloads for none, manual multi-select, and automatic reset', () => {
    expect(resolveEvidenceLinkPayload(['none'], options)).toEqual({ mode: 'none' })
    expect(resolveEvidenceLinkPayload(['paye_income', 'donation_claims'], options)).toEqual([
      payeManualLink,
      donationManualLink,
    ])
    expect(resolveEvidenceLinkPayload(['auto'], options)).toBeNull()
  })

  it('describes evidence selection labels for the multi-select control', () => {
    expect(describeEvidenceLinkSelection(['auto'], options)).toBe('Use automatic link')
    expect(describeEvidenceLinkSelection(['none'], options)).toBe('Do not link this document')
    expect(describeEvidenceLinkSelection(['paye_income', 'donation_claims'], options)).toBe('PAYE income, Donation claims')
  })

  it('finds evidence items for a document and keeps user-facing evidence labels stable', () => {
    const evidence: ReviewEvidenceItem[] = [
      {
        documentId: 'doc-2',
        document: 'bundle.pdf',
        documentType: 'other',
        supports: 'PAYE income',
        section: 'Income',
        ir3Refs: ['11A'],
        summaryKey: null,
        uploadedAt: '2026-03-29T00:00:00.000Z',
        status: 'uploaded',
        linkMode: 'manual',
      },
      {
        documentId: 'doc-3',
        document: 'donations.pdf',
        documentType: 'donation_receipts',
        supports: 'Donation claims',
        section: 'Adjustments and deductions',
        ir3Refs: ['41'],
        summaryKey: 'donationAmount',
        uploadedAt: '2026-03-29T00:00:00.000Z',
        status: 'uploaded',
        linkMode: 'auto',
      },
    ]
    const warning: ReviewWarning = {
      code: 'MISSING_DONATION_RECEIPTS',
      severity: 'medium',
      message: 'Donation claims are present without uploaded donation receipts.',
      evidence,
    }

    expect(findEvidenceForDocument('doc-2', evidence)).toEqual([evidence[0]])
    expect(getWarningEvidenceLabel(warning, evidence[0])).toBe('PAYE income')
    expect(getIr3FieldEvidenceLabel(evidence[1])).toBe('Donation claims')
  })
})
