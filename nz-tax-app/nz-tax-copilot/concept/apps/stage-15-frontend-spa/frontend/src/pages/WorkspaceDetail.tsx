import { useEffect, useMemo, useState } from 'react'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DownloadIcon from '@mui/icons-material/Download'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  LinearProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom'
import { workspaceApi } from '../api/workspaces'
import { workspaceFlowsApi, type QuestionnaireAnswers, type IncomeBucket, type WorkspaceAdjustments, type ReviewPayload, type AuditResult, type ReviewEvidenceItem, type WorkspaceDocument, type EvidenceLinkOption, type DocumentEvidenceLink, type DocumentEvidenceLinksPayload } from '../api/workspaceFlows'
import { useAuth } from '../auth/useAuth'

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function percent(done: number, total: number) {
  if (!total) return 0
  return Math.round((done / total) * 100)
}

function titleCase(value?: string | null) {
  if (!value) return 'Unknown'
  return value
    .split(/[_\-.\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatFieldValue(value: unknown) {
  if (typeof value === 'number') return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return String(value)
}

function findEvidenceForDocument(docId: string, evidence: ReviewEvidenceItem[]) {
  return evidence.filter((item) => item.documentId === docId)
}

function getEvidenceLinkOptionValue(option: EvidenceLinkOption) {
  if (!option.value) return 'auto'
  if (option.value.mode === 'none') return 'none'
  return option.key
}

function isSameEvidenceLink(left: DocumentEvidenceLink | undefined, right: DocumentEvidenceLink | undefined) {
  if (!left || !right || left.mode !== 'manual' || right.mode !== 'manual') return false
  return left.supports === right.supports
    && left.section === right.section
    && JSON.stringify(left.ir3Refs || []) === JSON.stringify(right.ir3Refs || [])
    && (left.summaryKey || null) === (right.summaryKey || null)
}

function getSelectedEvidenceLinkValues(document: WorkspaceDocument, options: EvidenceLinkOption[]) {
  if (document.evidenceLink?.mode === 'none') return ['none']
  const manualLinks = document.evidenceLinks || (document.evidenceLink?.mode === 'manual' ? [document.evidenceLink] : [])
  const selected = manualLinks
    .map((link) => options.find((option) => option.value?.mode === 'manual' && isSameEvidenceLink(option.value, link))?.key)
    .filter(Boolean) as string[]
  return selected.length > 0 ? selected : ['auto']
}

function normalizeEvidenceLinkSelection(value: string | string[]) {
  const values = Array.isArray(value) ? value : [value]
  const unique = Array.from(new Set(values.filter(Boolean)))
  if (unique.includes('none')) return ['none']
  const manual = unique.filter((item) => item !== 'auto')
  return manual.length > 0 ? manual : ['auto']
}

function describeEvidenceLinkSelection(values: string[], options: EvidenceLinkOption[]) {
  if (values.includes('none')) return 'Do not link this document'
  const manual = values.filter((value) => value !== 'auto')
  if (manual.length === 0) return 'Use automatic link'
  return manual
    .map((value) => options.find((option) => option.key === value)?.label || value)
    .join(', ')
}

function resolveEvidenceLinkPayload(values: string[], options: EvidenceLinkOption[]): DocumentEvidenceLinksPayload {
  if (values.includes('none')) return { mode: 'none' }
  const manualLinks = values
    .filter((value) => value !== 'auto')
    .map((value) => options.find((item) => item.key === value)?.value)
    .filter((value): value is Exclude<NonNullable<DocumentEvidenceLink>, { mode: 'none' }> => Boolean(value && value.mode === 'manual'))
  return manualLinks.length > 0 ? manualLinks : null
}

export default function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const queryClient = useQueryClient()
  const { isAuthenticated, isLoading } = useAuth()
  const [tab, setTab] = useState(0)
  const [incomeType, setIncomeType] = useState<'paye' | 'interest' | 'dividends' | 'other'>('paye')
  const [gross, setGross] = useState('')
  const [payeWithheld, setPayeWithheld] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeSourceName, setIncomeSourceName] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [csvText, setCsvText] = useState('date,asset,type,amount,price_nzd,fee_nzd,exchange\n2025-06-01,BTC,buy,0.01,100000,15,Binance')
  const [docType, setDocType] = useState('paye_summary')
  const [docFile, setDocFile] = useState<File | null>(null)
  const [donationAmount, setDonationAmount] = useState('0')
  const [pieIncome, setPieIncome] = useState('0')
  const [pieTaxCredits, setPieTaxCredits] = useState('0')
  const [studentLoanRepayments, setStudentLoanRepayments] = useState('0')
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)
  const [auditCategory, setAuditCategory] = useState<string>('all')
  const [auditSearch, setAuditSearch] = useState('')

  const workspaceQuery = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceApi.get(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  const questionnaireQuery = useQuery({
    queryKey: ['workspace-questionnaire', workspaceId],
    queryFn: () => workspaceFlowsApi.getQuestionnaire(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  const incomeQuery = useQuery({
    queryKey: ['workspace-income', workspaceId],
    queryFn: () => workspaceFlowsApi.listIncome(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  const cryptoQuery = useQuery({
    queryKey: ['workspace-crypto', workspaceId],
    queryFn: () => workspaceFlowsApi.listCryptoTransactions(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  const docsQuery = useQuery({
    queryKey: ['workspace-docs', workspaceId],
    queryFn: () => workspaceFlowsApi.listDocuments(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  const checklistQuery = useQuery({
    queryKey: ['workspace-checklist', workspaceId],
    queryFn: () => workspaceFlowsApi.getChecklist(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  const auditQuery = useQuery({
    queryKey: ['workspace-audit', workspaceId, auditCategory, auditSearch],
    queryFn: () => workspaceFlowsApi.getAudit(workspaceId || '', {
      category: auditCategory === 'all' ? null : auditCategory,
      q: auditSearch.trim() || null,
    }),
    enabled: Boolean(workspaceId),
  })

  const calcQuery = useQuery({
    queryKey: ['workspace-calc', workspaceId],
    queryFn: () => workspaceFlowsApi.getIr3Calc(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  const exportQuery = useQuery({
    queryKey: ['workspace-export', workspaceId],
    queryFn: () => workspaceFlowsApi.getDraftExport(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  const adjustmentsQuery = useQuery({
    queryKey: ['workspace-adjustments', workspaceId],
    queryFn: () => workspaceFlowsApi.getAdjustments(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  const reviewQuery = useQuery({
    queryKey: ['workspace-review', workspaceId],
    queryFn: () => workspaceFlowsApi.getReview(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  const saveQuestionnaireMutation = useMutation({
    mutationFn: (answers: QuestionnaireAnswers) => workspaceFlowsApi.saveQuestionnaire(workspaceId || '', answers),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspace-questionnaire', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace'] })
    },
  })

  const addIncomeMutation = useMutation({
    mutationFn: (payload: { type: 'paye' | 'interest' | 'dividends' | 'other'; body: Record<string, unknown> }) =>
      workspaceFlowsApi.addIncome(workspaceId || '', payload.type, payload.body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspace-income', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-calc', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-export', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-review', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      await queryClient.invalidateQueries({ queryKey: ['workspace'] })
      setGross('')
      setPayeWithheld('')
      setIncomeAmount('')
      setIncomeSourceName('')
    },
  })

  const importCryptoMutation = useMutation({
    mutationFn: (csv: string) => workspaceFlowsApi.importCryptoCsv(workspaceId || '', csv),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspace-crypto', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-calc', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-export', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-review', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      await queryClient.invalidateQueries({ queryKey: ['workspace'] })
    },
  })

  const saveAdjustmentsMutation = useMutation({
    mutationFn: (adjustments: WorkspaceAdjustments) => workspaceFlowsApi.saveAdjustments(workspaceId || '', adjustments),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspace-adjustments', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-calc', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-export', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-review', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      await queryClient.invalidateQueries({ queryKey: ['workspace'] })
    },
  })

  const uploadDocumentMutation = useMutation({
    mutationFn: (payload: { file: File; docType: string }) => workspaceFlowsApi.uploadDocument(workspaceId || '', payload.file, payload.docType),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspace-docs', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-checklist', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-export', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-review', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      await queryClient.invalidateQueries({ queryKey: ['workspace'] })
      setDocFile(null)
    },
  })

  const updateDocumentEvidenceLinkMutation = useMutation({
    mutationFn: (payload: { documentId: string; evidenceLinks: DocumentEvidenceLinksPayload }) =>
      workspaceFlowsApi.updateDocumentEvidenceLink(workspaceId || '', payload.documentId, payload.evidenceLinks),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspace-docs', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-export', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-review', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      await queryClient.invalidateQueries({ queryKey: ['workspace'] })
    },
  })

  const answers = questionnaireQuery.data?.answers || {}
  const visibleQuestions = questionnaireQuery.data?.visible || []
  const status = questionnaireQuery.data?.status
  const incomeBuckets: IncomeBucket | undefined = incomeQuery.data
  const payeRows = incomeBuckets?.paye || []
  const interestRows = incomeBuckets?.interest || []
  const dividendRows = incomeBuckets?.dividends || []
  const otherIncomeRows = incomeBuckets?.other || []
  const cryptoRows = cryptoQuery.data || []
  const docsResult = docsQuery.data || { items: [], evidenceLinkOptions: [] }
  const docs: WorkspaceDocument[] = docsResult.items || []
  const evidenceLinkOptions: EvidenceLinkOption[] = docsResult.evidenceLinkOptions || []
  const checklist = checklistQuery.data || []
  const audit: AuditResult = auditQuery.data || {
    events: [],
    summary: { totalEvents: 0, latestEventAt: null, byCategory: {} },
    overallSummary: { totalEvents: 0, latestEventAt: null, byCategory: {} },
    availableCategories: [],
    filters: { category: null, q: null, limit: null },
  }

  const summaryItems = useMemo(() => {
    const mapped = calcQuery.data?.map || {}
    const calc = calcQuery.data?.calc || {}
    return [...Object.entries(mapped), ...Object.entries(calc)].filter(([key]) => key !== 'summary')
  }, [calcQuery.data])

  const explanation = exportQuery.data?.explanation || calcQuery.data?.explanation
  const fieldNotesByRef = useMemo(() => {
    const notes = explanation?.fieldNotes || []
    return Object.fromEntries(notes.map((note: { ref: string; label?: string; note?: string; source?: string }) => [note.ref, note]))
  }, [explanation])
  const review: ReviewPayload | undefined = reviewQuery.data || exportQuery.data?.review
  const reviewWarnings = review?.warnings || []
  const reviewEvidence = review?.evidence || []
  const highSeverityWarningCount = reviewWarnings.filter((warning) => warning.severity === 'high').length

  const adjustments = adjustmentsQuery.data || {
    donationAmount: 0,
    pieIncome: 0,
    pieTaxCredits: 0,
    studentLoanRepayments: 0,
  }

  useEffect(() => {
    setDonationAmount(String(adjustments.donationAmount ?? 0))
    setPieIncome(String(adjustments.pieIncome ?? 0))
    setPieTaxCredits(String(adjustments.pieTaxCredits ?? 0))
    setStudentLoanRepayments(String(adjustments.studentLoanRepayments ?? 0))
  }, [adjustments.donationAmount, adjustments.pieIncome, adjustments.pieTaxCredits, adjustments.studentLoanRepayments])

  const downloadTextFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const downloadPdfFile = () => {
    const pdf = exportQuery.data?.pdf
    if (!pdf?.bytesBase64) return
    const binary = atob(pdf.bytesBase64)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const blob = new Blob([bytes], { type: pdf.mimeType || 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = pdf.filename || 'ir3-draft.pdf'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const downloadJsonFile = () => {
    if (!exportQuery.data?.json) return
    downloadTextFile(
      `ir3-draft-${workspaceId || 'workspace'}.json`,
      `${JSON.stringify(exportQuery.data.json, null, 2)}\n`,
      'application/json;charset=utf-8',
    )
  }

  const copyCsvToClipboard = async () => {
    const csv = exportQuery.data?.csv
    if (!csv) return
    try {
      await navigator.clipboard.writeText(csv)
      setCopyFeedback('CSV copied to clipboard.')
    } catch {
      setCopyFeedback('Clipboard copy failed on this browser.')
    }
  }

  const handleSaveAdjustments = () => {
    saveAdjustmentsMutation.mutate({
      donationAmount: Number(donationAmount || 0),
      pieIncome: Number(pieIncome || 0),
      pieTaxCredits: Number(pieTaxCredits || 0),
      studentLoanRepayments: Number(studentLoanRepayments || 0),
    })
  }

  const dashboard = useMemo(() => {
    const questionnaireDone = status?.answeredVisible || 0
    const questionnaireTotal = status?.totalVisible || 0
    const incomeCount = payeRows.length + interestRows.length + dividendRows.length + otherIncomeRows.length
    const incomeDone = incomeCount > 0 ? 1 : 0
    const cryptoDone = cryptoRows.length > 0 ? 1 : 0
    const calcDone = summaryItems.length > 0 ? 1 : 0
    const sections = [
      { label: 'Questionnaire', done: questionnaireDone, total: questionnaireTotal || 1, detail: questionnaireTotal ? `${questionnaireDone}/${questionnaireTotal} answered` : 'No visible questions yet' },
      { label: 'Income', done: incomeDone, total: 1, detail: incomeCount > 0 ? `${incomeCount} income entries added` : 'No income entries yet' },
      { label: 'Crypto', done: cryptoDone, total: 1, detail: cryptoRows.length > 0 ? `${cryptoRows.length} transactions imported` : 'No crypto data yet' },
      { label: 'IR3 Summary', done: calcDone, total: 1, detail: summaryItems.length > 0 ? `${summaryItems.length} values generated` : 'No calculation output yet' },
    ]
    const doneUnits = sections.reduce((sum, section) => sum + Math.min(section.done, section.total), 0)
    const totalUnits = sections.reduce((sum, section) => sum + section.total, 0)
    return {
      sections,
      overallPercent: percent(doneUnits, totalUnits),
    }
  }, [status, payeRows.length, interestRows.length, dividendRows.length, otherIncomeRows.length, cryptoRows.length, summaryItems.length])

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3} sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Tax workspace
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Work through your return in plain English: answer a few questions, add income, upload supporting documents, and review the IR3 draft before filing.
            </Typography>
          </Box>
          <Button component={RouterLink} to="/workspaces" variant="outlined">
            Back to workspaces
          </Button>
        </Stack>

        {workspaceQuery.data ? (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">Tax workspace {workspaceQuery.data.id.slice(0, 8)}</Typography>
                  <Chip
                    label={workspaceQuery.data.status || 'unknown'}
                    color={workspaceQuery.data.status === 'in_progress' ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Tax year covered: {workspaceQuery.data.taxYearStart} to {workspaceQuery.data.taxYearEnd}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use this space to collect the figures and documents that belong to this one NZ tax year only.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Updated: {formatDate(workspaceQuery.data.updatedAt)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Progress dashboard</Typography>
              <Typography variant="body2" color="text.secondary">
                This is a simple checklist of what most people need for a first draft. You do not need every section if it does not apply to you.
              </Typography>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Overall progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboard.overallPercent}%
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={dashboard.overallPercent} sx={{ height: 10, borderRadius: 5 }} />
              </Box>
              <Stack spacing={1.5}>
                {dashboard.sections.map((section) => (
                  <Card key={section.label} variant="outlined">
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Box>
                          <Typography variant="subtitle1">{section.label}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {section.detail}
                          </Typography>
                        </Box>
                        <Chip label={`${percent(section.done, section.total)}%`} color={section.done >= section.total ? 'success' : 'default'} />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {reviewWarnings.length > 0 ? (
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Review warnings</Typography>
                <Alert
                  severity={highSeverityWarningCount > 0 ? 'error' : 'warning'}
                  action={
                    <Button color="inherit" size="small" onClick={() => setTab(5)}>
                      Open IR3 summary
                    </Button>
                  }
                >
                  {highSeverityWarningCount > 0
                    ? `${highSeverityWarningCount} high-severity warning${highSeverityWarningCount === 1 ? '' : 's'} need attention before filing.`
                    : `${reviewWarnings.length} review warning${reviewWarnings.length === 1 ? '' : 's'} detected.`}
                </Alert>
                <Stack spacing={1}>
                  {reviewWarnings.slice(0, 3).map((warning, index) => (
                    <Alert key={`${warning.code}-${index}`} severity={warning.severity === 'high' ? 'error' : 'warning'}>
                      {warning.message}
                    </Alert>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent>
            <Tabs value={tab} onChange={(_e, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
              <Tab label="Questionnaire" />
              <Tab label="Income" />
              <Tab label="Crypto" />
              <Tab label="Documents" />
              <Tab label="Audit" />
              <Tab label="IR3 Summary" />
            </Tabs>

            <Divider sx={{ my: 2 }} />

            {tab === 0 ? (
              <Stack spacing={2}>
                <Typography variant="h6">Questionnaire</Typography>
                <Alert severity="info">
                  Answer these quick yes/no questions so the app only shows the parts of the return that matter to you. If you are unsure, answer with your best current understanding and come back later.
                </Alert>
                {status ? (
                  <Alert severity={status.complete ? 'success' : saveQuestionnaireMutation.isPending ? 'warning' : 'info'}>
                    {status.answeredVisible} of {status.totalVisible} visible questions answered
                    {saveQuestionnaireMutation.isPending ? ' · Saving…' : lastSavedAt ? ` · Saved at ${lastSavedAt}` : ''}
                  </Alert>
                ) : null}
                {visibleQuestions.map((question) => (
                  <TextField
                    key={question.id}
                    select
                    label={question.label}
                    helperText="This answer controls which tax sections appear next."
                    value={answers[question.id] === undefined ? '' : String(answers[question.id])}
                    onChange={(event) => {
                      const value = event.target.value
                      const nextAnswers = {
                        ...answers,
                        [question.id]: value === 'true',
                      }
                      saveQuestionnaireMutation.mutate(nextAnswers, { onSuccess: () => setLastSavedAt(new Date().toLocaleTimeString()) })
                    }}
                    fullWidth
                  >
                    <MenuItem value="">Choose…</MenuItem>
                    <MenuItem value="true">Yes</MenuItem>
                    <MenuItem value="false">No</MenuItem>
                  </TextField>
                ))}
              </Stack>
            ) : null}

            {tab === 1 ? (
              <Stack spacing={2}>
                <Typography variant="h6">Income</Typography>
                <Alert severity="info">
                  Add income one source at a time. Use the gross amount before deductions unless the label says tax withheld. You can usually find these figures on payslips, bank interest summaries, dividend statements, or year-end tax certificates.
                </Alert>
                <TextField select label="Income type" value={incomeType} onChange={(event) => setIncomeType(event.target.value as 'paye' | 'interest' | 'dividends' | 'other')} helperText="Pick the kind of income you are adding so the app asks for the right figures." fullWidth>
                  <MenuItem value="paye">PAYE</MenuItem>
                  <MenuItem value="interest">Interest</MenuItem>
                  <MenuItem value="dividends">Dividends</MenuItem>
                  <MenuItem value="other">Other income</MenuItem>
                </TextField>
                {incomeType === 'paye' ? (
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField label="Gross income (NZD)" type="number" value={gross} onChange={(event) => setGross(event.target.value)} helperText="Enter total pay before tax and deductions. This is often called gross earnings on your payslip or earnings summary." fullWidth />
                    <TextField label="PAYE withheld (NZD)" type="number" value={payeWithheld} onChange={(event) => setPayeWithheld(event.target.value)} helperText="Enter the tax already taken out by your employer. Look for PAYE tax deducted or tax withheld." fullWidth />
                  </Stack>
                ) : (
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField label="Amount (NZD)" type="number" value={incomeAmount} onChange={(event) => setIncomeAmount(event.target.value)} helperText="Enter the amount shown on the statement or summary for this income source." fullWidth />
                    <TextField label="Source" value={incomeSourceName} onChange={(event) => setIncomeSourceName(event.target.value)} helperText="Example: ANZ savings account, Sharesies dividend, side-job invoice, or rental top-up." fullWidth />
                  </Stack>
                )}
                <Button
                  variant="contained"
                  disabled={incomeType === 'paye' ? (!gross || !payeWithheld || addIncomeMutation.isPending) : (!incomeAmount || addIncomeMutation.isPending)}
                  onClick={() => addIncomeMutation.mutate({
                    type: incomeType,
                    body: incomeType === 'paye'
                      ? { gross: Number(gross), payeWithheld: Number(payeWithheld) }
                      : { amount: Number(incomeAmount), sourceName: incomeSourceName },
                  })}
                >
                  {addIncomeMutation.isPending ? 'Saving…' : `Add ${incomeType} income`}
                </Button>
                {payeRows.length + interestRows.length + dividendRows.length + otherIncomeRows.length > 0 ? (
                  <Stack spacing={1}>
                    {payeRows.map((row) => (
                      <Card key={row.id} variant="outlined"><CardContent><Typography variant="body1">PAYE · Gross: ${row.gross}</Typography><Typography variant="body2" color="text.secondary">PAYE withheld: ${row.payeWithheld}</Typography></CardContent></Card>
                    ))}
                    {interestRows.map((row) => (
                      <Card key={row.id} variant="outlined"><CardContent><Typography variant="body1">Interest · ${row.amount}</Typography><Typography variant="body2" color="text.secondary">Source: {row.sourceName || '—'}</Typography></CardContent></Card>
                    ))}
                    {dividendRows.map((row) => (
                      <Card key={row.id} variant="outlined"><CardContent><Typography variant="body1">Dividends · ${row.amount}</Typography><Typography variant="body2" color="text.secondary">Source: {row.sourceName || '—'}</Typography></CardContent></Card>
                    ))}
                    {otherIncomeRows.map((row) => (
                      <Card key={row.id} variant="outlined"><CardContent><Typography variant="body1">Other income · ${row.amount}</Typography><Typography variant="body2" color="text.secondary">Source: {row.sourceName || '—'}</Typography></CardContent></Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">No income added yet.</Alert>
                )}
              </Stack>
            ) : null}

            {tab === 2 ? (
              <Stack spacing={2}>
                <Typography variant="h6">Crypto CSV import</Typography>
                <Alert severity="info">
                  Paste rows with these columns: date, asset, type, amount, price_nzd, fee_nzd, exchange. A sample row is prefilled so you can match the format before importing.
                </Alert>
                <TextField label="Paste CSV" value={csvText} onChange={(event) => setCsvText(event.target.value)} multiline minRows={6} fullWidth />
                <Button variant="contained" disabled={!csvText.trim() || importCryptoMutation.isPending} onClick={() => importCryptoMutation.mutate(csvText)}>
                  {importCryptoMutation.isPending ? 'Importing…' : 'Import crypto CSV'}
                </Button>
                {cryptoRows.length > 0 ? (
                  <Stack spacing={1}>
                    {cryptoRows.map((row) => (
                      <Card key={row.id} variant="outlined">
                        <CardContent>
                          <Typography variant="body1">{row.occurredAt} — {row.asset} {row.type} {row.amount}</Typography>
                          <Typography variant="body2" color="text.secondary">NZD price: ${row.priceNzd} · Fee: ${row.feeNzd} · Source: {row.source || '—'}</Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">No crypto transactions imported yet.</Alert>
                )}
              </Stack>
            ) : null}


            {tab === 3 ? (
              <Stack spacing={2}>
                <Typography variant="h6">Documents</Typography>
                <Alert severity="info">
                  Upload the records that support your figures. This helps you double-check numbers now and makes review easier later if anything looks off.
                </Alert>
                <TextField
                  select
                  label="Document type"
                  value={docType}
                  onChange={(event) => setDocType(event.target.value)}
                  helperText="Choose the document type that best matches the file so it lands in the right checklist bucket."
                  fullWidth
                >
                  <MenuItem value="paye_summary">PAYE summary</MenuItem>
                  <MenuItem value="interest_dividend_slips">Interest/dividend slips</MenuItem>
                  <MenuItem value="student_loan_statement">Student loan statement</MenuItem>
                  <MenuItem value="crypto_csv">Crypto CSV</MenuItem>
                  <MenuItem value="donation_receipts">Donation receipts</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                <Button variant="outlined" component="label">
                  {docFile ? `Selected: ${docFile.name}` : 'Choose file'}
                  <input
                    hidden
                    type="file"
                    onChange={(event) => setDocFile(event.target.files?.[0] || null)}
                  />
                </Button>
                <Button
                  variant="contained"
                  disabled={!docFile || uploadDocumentMutation.isPending}
                  onClick={() => docFile && uploadDocumentMutation.mutate({ file: docFile, docType })}
                >
                  {uploadDocumentMutation.isPending ? 'Uploading…' : 'Upload document'}
                </Button>

                <Typography variant="subtitle1">Checklist</Typography>
                {checklist.length > 0 ? (
                  <Stack spacing={1}>
                    {checklist.map((item) => (
                      <Card key={item.docType} variant="outlined">
                        <CardContent>
                          <Typography variant="body1">{item.docType}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.status} ({item.count})
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">No checklist yet.</Alert>
                )}

                <Typography variant="subtitle1">Uploaded documents</Typography>
                {docs.length > 0 ? (
                  <Stack spacing={1}>
                    {docs.map((doc) => {
                      const linkedEvidence = findEvidenceForDocument(doc.id, reviewEvidence)

                      return (
                        <Card key={doc.id} variant="outlined">
                          <CardContent>
                            <Stack spacing={1.25}>
                              <Box>
                                <Typography variant="body1">{doc.originalName}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {doc.docType} · {Math.round((doc.size || 0) / 1024)} KB · {doc.status}
                                </Typography>
                              </Box>
                              {linkedEvidence.length > 0 ? (
                                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                  {linkedEvidence.map((item) => (
                                    <Chip
                                      key={`${doc.id}-${item.supports}-${item.section}`}
                                      size="small"
                                      color={item.linkMode === 'manual' ? 'primary' : 'success'}
                                      variant="outlined"
                                      label={`${item.linkMode === 'manual' ? 'Manually linked' : 'Supports'} ${item.supports}`}
                                    />
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" color="text.secondary">Not yet linked to a review evidence area.</Typography>
                              )}
                              <TextField
                                select
                                size="small"
                                label="Evidence link"
                                value={getSelectedEvidenceLinkValues(doc, evidenceLinkOptions)}
                                onChange={(event) => {
                                  const selectedValues = normalizeEvidenceLinkSelection(event.target.value as unknown as string[])
                                  updateDocumentEvidenceLinkMutation.mutate({
                                    documentId: doc.id,
                                    evidenceLinks: resolveEvidenceLinkPayload(selectedValues, evidenceLinkOptions),
                                  })
                                }}
                                disabled={updateDocumentEvidenceLinkMutation.isPending}
                                helperText="Pick one or more review areas for this document, keep the automatic mapping, or remove it from review evidence."
                                fullWidth
                                SelectProps={{
                                  multiple: true,
                                  renderValue: (selected) => describeEvidenceLinkSelection(selected as unknown as string[], evidenceLinkOptions),
                                }}
                              >
                                {evidenceLinkOptions.map((option) => (
                                  <MenuItem key={option.key} value={getEvidenceLinkOptionValue(option)}>{option.label}</MenuItem>
                                ))}
                              </TextField>
                            </Stack>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </Stack>
                ) : (
                  <Alert severity="info">No documents uploaded yet.</Alert>
                )}
              </Stack>
            ) : null}


            {tab === 4 ? (
              <Stack spacing={2}>
                <Typography variant="h6">Audit trail</Typography>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Card variant="outlined" sx={{ flex: 1 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Visible events</Typography>
                      <Typography variant="h5">{audit.summary.totalEvents}</Typography>
                    </CardContent>
                  </Card>
                  <Card variant="outlined" sx={{ flex: 1 }}>
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Latest activity</Typography>
                      <Typography variant="body1">{formatDate(audit.summary.latestEventAt || undefined)}</Typography>
                    </CardContent>
                  </Card>
                </Stack>

                {audit.availableCategories.length > 0 ? (
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip
                      label={`All (${audit.overallSummary.totalEvents})`}
                      color={auditCategory === 'all' ? 'primary' : 'default'}
                      variant={auditCategory === 'all' ? 'filled' : 'outlined'}
                      onClick={() => setAuditCategory('all')}
                    />
                    {audit.availableCategories.map((category) => (
                      <Chip
                        key={category}
                        label={`${titleCase(category)} (${audit.overallSummary.byCategory[category] || 0})`}
                        color={auditCategory === category ? 'primary' : 'default'}
                        variant={auditCategory === category ? 'filled' : 'outlined'}
                        onClick={() => setAuditCategory(category)}
                      />
                    ))}
                  </Stack>
                ) : null}

                <TextField
                  label="Search audit events"
                  value={auditSearch}
                  onChange={(event) => setAuditSearch(event.target.value)}
                  placeholder="Search action, details, actor, or metadata"
                  fullWidth
                />

                {auditQuery.isFetching ? <LinearProgress /> : null}

                {audit.events.length > 0 ? (
                  <Stack spacing={1}>
                    {audit.events.map((event) => (
                      <Card key={event.id} variant="outlined">
                        <CardContent>
                          <Stack spacing={1.25}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                              <Box>
                                <Typography variant="body1">{event.label}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {event.actor || 'System'} · {formatDate(event.at)}
                                </Typography>
                              </Box>
                              <Chip label={titleCase(event.category)} size="small" variant="outlined" />
                            </Stack>
                            {event.details ? (
                              <Typography variant="body2">{event.details}</Typography>
                            ) : null}
                            <Typography variant="caption" color="text.secondary">
                              {event.action}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">
                    {auditSearch || auditCategory !== 'all'
                      ? 'No audit events match the current filters.'
                      : 'No audit events yet.'}
                  </Alert>
                )}
              </Stack>
            ) : null}

            {tab === 5 ? (
              <Stack spacing={2}>
                <Typography variant="h6">IR3 summary</Typography>
                <Alert severity="info">
                  This section turns what you entered into an IR3-style draft. Review it carefully: it is designed to help you understand your likely return, not replace your own final check.
                </Alert>
                {summaryItems.length > 0 ? (
                  <Stack spacing={1}>
                    {summaryItems.map(([ref, value]) => {
                      const fieldNote = fieldNotesByRef[ref] as { ref?: string; label?: string; note?: string; source?: string } | undefined
                      const friendlyLabel = fieldNote?.label || titleCase(ref)

                      return (
                        <Card key={ref} variant="outlined">
                          <CardContent>
                            <Stack spacing={1.25}>
                              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                                <Box>
                                  <Typography variant="body1">{friendlyLabel}</Typography>
                                  <Typography variant="body2" color="text.secondary">{formatFieldValue(value)}</Typography>
                                </Box>
                                <Chip label={`IR3 ${ref}`} size="small" variant="outlined" />
                              </Stack>
                              {fieldNote?.note ? (
                                <Typography variant="body2" color="text.secondary">{fieldNote.note}</Typography>
                              ) : null}
                              {fieldNote?.source ? (
                                <Typography variant="caption" color="text.secondary">Where this came from: {fieldNote.source}</Typography>
                              ) : null}
                            </Stack>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </Stack>
                ) : (
                  <Alert severity="info">No calculation data yet. Add income or crypto data first.</Alert>
                )}

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>Adjustments and deductions</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Add extra items here if they were not already included elsewhere. These can change your draft refund or tax to pay.
                    </Typography>
                    <Stack spacing={2}>
                      <TextField label="Donation amount (NZD)" type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} helperText="Total eligible donations for the year. Use your donation receipts and include only claimable gifts." fullWidth />
                      <TextField label="PIE income (NZD)" type="number" value={pieIncome} onChange={(e) => setPieIncome(e.target.value)} helperText="Income from portfolio investment entities, usually shown on an annual tax certificate from your provider." fullWidth />
                      <TextField label="PIE tax credits (NZD)" type="number" value={pieTaxCredits} onChange={(e) => setPieTaxCredits(e.target.value)} helperText="Tax already paid within your PIE investment. Enter the credit amount from your annual statement." fullWidth />
                      <TextField label="Student loan repayments (NZD)" type="number" value={studentLoanRepayments} onChange={(e) => setStudentLoanRepayments(e.target.value)} helperText="Add repayments already made through PAYE or separately if you need them reflected in this draft." fullWidth />
                      <Button variant="contained" onClick={handleSaveAdjustments} disabled={saveAdjustmentsMutation.isPending}>
                        {saveAdjustmentsMutation.isPending ? 'Saving…' : 'Save adjustments'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>

                {review ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>Review confidence</Typography>
                      <Alert severity={review.readiness.status === 'strong' ? 'success' : review.readiness.status === 'review_needed' ? 'warning' : 'error'} sx={{ mb: 2 }}>
                        Readiness score: {review.readiness.score}/100 · {review.readiness.status}
                      </Alert>
                      {(review.warnings || []).length > 0 ? (
                        <Stack spacing={1} sx={{ mb: 2 }}>
                          {review.warnings.map((warning) => (
                            <Alert key={warning.code} severity={warning.severity === 'high' ? 'error' : 'warning'}>{warning.message}</Alert>
                          ))}
                        </Stack>
                      ) : null}
                      {(review.assumptions || []).length > 0 ? (
                        <Stack spacing={1}>
                          <Typography variant="subtitle2">Current assumptions</Typography>
                          {review.assumptions.map((assumption, index) => (
                            <Typography key={index} variant="body2" color="text.secondary">• {assumption}</Typography>
                          ))}
                        </Stack>
                      ) : null}
                    </CardContent>
                  </Card>
                ) : null}

                {reviewEvidence.length > 0 ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>Supporting evidence</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        These uploaded documents are currently linked to parts of your review so you can see what supports each area of the draft.
                      </Typography>
                      <Stack spacing={1.5}>
                        {reviewEvidence.map((item) => (
                          <Card key={`${item.documentId}-${item.supports}-${item.section}`} variant="outlined">
                            <CardContent>
                              <Stack spacing={1.25}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                                  <Box>
                                    <Typography variant="body1">{item.supports}</Typography>
                                    <Typography variant="body2" color="text.secondary">{item.document}</Typography>
                                  </Box>
                                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                    <Chip size="small" label={item.section} variant="outlined" />
                                    <Chip size="small" color={item.linkMode === 'manual' ? 'primary' : 'default'} variant="outlined" label={item.linkMode === 'manual' ? 'Manual link' : 'Auto link'} />
                                  </Stack>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                  Linked from {titleCase(item.documentType)} · Added {formatDate(item.uploadedAt)}
                                </Typography>
                                {item.ir3Refs.length > 0 ? (
                                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                    {item.ir3Refs.map((ref) => (
                                      <Chip key={`${item.documentId}-${ref}`} size="small" label={`IR3 ${ref}`} />
                                    ))}
                                  </Stack>
                                ) : null}
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ) : null}

                {explanation ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>Plain-English explanation</Typography>
                      {explanation.headline ? (
                        <Alert severity="info" sx={{ mb: 2 }}>{explanation.headline}</Alert>
                      ) : null}
                      <Stack spacing={1}>
                        {(explanation.bullets || []).map((bullet, index) => (
                          <Typography key={index} variant="body2" color="text.secondary">• {bullet}</Typography>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ) : null}

                {exportQuery.data ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>Draft export package</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Download these files if you want a portable copy of your draft figures, summary, and supporting explanation.
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {exportQuery.data.pdf.title} · {formatDate(exportQuery.data.pdf.generatedAt)}
                      </Typography>
                      <Stack spacing={1} sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          JSON package includes workspace metadata, mapped values, calculated values, explanation, and review readiness.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          CSV rows: {exportQuery.data.csv.split('\n').filter(Boolean).length} · JSON generated: {formatDate(exportQuery.data.json.generatedAt)}
                        </Typography>
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          startIcon={<DownloadIcon />}
                          onClick={() => downloadTextFile(`ir3-draft-${workspaceId || 'workspace'}.csv`, exportQuery.data.csv, 'text/csv;charset=utf-8')}
                        >
                          Download CSV
                        </Button>
                        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadPdfFile}>
                          Download PDF
                        </Button>
                        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadJsonFile}>
                          Download JSON
                        </Button>
                        <Button variant="text" startIcon={<ContentCopyIcon />} onClick={copyCsvToClipboard}>
                          Copy CSV
                        </Button>
                      </Stack>
                      {copyFeedback ? <Alert severity={copyFeedback.includes('failed') ? 'warning' : 'success'} sx={{ mb: 2 }}>{copyFeedback}</Alert> : null}
                      <TextField value={exportQuery.data.csv} multiline minRows={8} fullWidth InputProps={{ readOnly: true }} />
                    </CardContent>
                  </Card>
                ) : null}
              </Stack>
            ) : null}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  )
}
