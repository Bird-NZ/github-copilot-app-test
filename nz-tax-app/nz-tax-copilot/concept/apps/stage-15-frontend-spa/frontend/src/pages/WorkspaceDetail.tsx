import { useMemo, useState } from 'react'
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
import { workspaceFlowsApi, type QuestionnaireAnswers, type IncomeBucket } from '../api/workspaceFlows'
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
    queryKey: ['workspace-audit', workspaceId],
    queryFn: () => workspaceFlowsApi.getAudit(workspaceId || ''),
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
      await queryClient.invalidateQueries({ queryKey: ['workspace'] })
    },
  })

  const uploadDocumentMutation = useMutation({
    mutationFn: (payload: { file: File; docType: string }) => workspaceFlowsApi.uploadDocument(workspaceId || '', payload.file, payload.docType),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspace-docs', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-checklist', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace'] })
      setDocFile(null)
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
  const docs = docsQuery.data || []
  const checklist = checklistQuery.data || []

  const summaryItems = useMemo(() => {
    const mapped = calcQuery.data?.map || {}
    const calc = calcQuery.data?.calc || {}
    return [...Object.entries(mapped), ...Object.entries(calc)].filter(([key]) => key !== 'summary')
  }, [calcQuery.data])

  const explanation = exportQuery.data?.explanation || calcQuery.data?.explanation

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

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />
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

  return (
    <Container maxWidth="lg">
      <Stack spacing={3} sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Workspace
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Run through the core tax workflow for this workspace.
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
                  <Typography variant="h5">Workspace {workspaceQuery.data.id.slice(0, 8)}</Typography>
                  <Chip
                    label={workspaceQuery.data.status || 'unknown'}
                    color={workspaceQuery.data.status === 'in_progress' ? 'primary' : 'default'}
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Tax year: {workspaceQuery.data.taxYearStart} to {workspaceQuery.data.taxYearEnd}
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
                <TextField select label="Income type" value={incomeType} onChange={(event) => setIncomeType(event.target.value as 'paye' | 'interest' | 'dividends' | 'other')} fullWidth>
                  <MenuItem value="paye">PAYE</MenuItem>
                  <MenuItem value="interest">Interest</MenuItem>
                  <MenuItem value="dividends">Dividends</MenuItem>
                  <MenuItem value="other">Other income</MenuItem>
                </TextField>
                {incomeType === 'paye' ? (
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField label="Gross income (NZD)" type="number" value={gross} onChange={(event) => setGross(event.target.value)} fullWidth />
                    <TextField label="PAYE withheld (NZD)" type="number" value={payeWithheld} onChange={(event) => setPayeWithheld(event.target.value)} fullWidth />
                  </Stack>
                ) : (
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField label="Amount (NZD)" type="number" value={incomeAmount} onChange={(event) => setIncomeAmount(event.target.value)} fullWidth />
                    <TextField label="Source" value={incomeSourceName} onChange={(event) => setIncomeSourceName(event.target.value)} fullWidth />
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
                <TextField
                  select
                  label="Document type"
                  value={docType}
                  onChange={(event) => setDocType(event.target.value)}
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
                    {docs.map((doc) => (
                      <Card key={doc.id} variant="outlined">
                        <CardContent>
                          <Typography variant="body1">{doc.originalName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {doc.docType} · {Math.round((doc.size || 0) / 1024)} KB · {doc.status}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">No documents uploaded yet.</Alert>
                )}
              </Stack>
            ) : null}


            {tab === 4 ? (
              <Stack spacing={2}>
                <Typography variant="h6">Audit trail</Typography>
                {auditQuery.data && auditQuery.data.length > 0 ? (
                  <Stack spacing={1}>
                    {auditQuery.data.slice().reverse().map((event, index) => (
                      <Card key={`${event.at}-${index}`} variant="outlined">
                        <CardContent>
                          <Typography variant="body1">{event.action}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.actor} · {formatDate(event.at)}
                          </Typography>
                          {event.meta ? (
                            <Typography variant="caption" color="text.secondary">
                              {JSON.stringify(event.meta)}
                            </Typography>
                          ) : null}
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">No audit events yet.</Alert>
                )}
              </Stack>
            ) : null}

            {tab === 5 ? (
              <Stack spacing={2}>
                <Typography variant="h6">IR3 summary</Typography>
                {summaryItems.length > 0 ? (
                  <Stack spacing={1}>
                    {summaryItems.map(([ref, value]) => (
                      <Card key={ref} variant="outlined">
                        <CardContent>
                          <Typography variant="body1">{ref}</Typography>
                          <Typography variant="body2" color="text.secondary">{String(value)}</Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">No calculation data yet. Add income or crypto data first.</Alert>
                )}

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
                        {exportQuery.data.pdf.title} · {formatDate(exportQuery.data.pdf.generatedAt)}
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                        <Button
                          variant="contained"
                          onClick={() => downloadTextFile(`ir3-draft-${workspaceId || 'workspace'}.csv`, exportQuery.data.csv, 'text/csv;charset=utf-8')}
                        >
                          Download CSV
                        </Button>
                        <Button variant="outlined" onClick={downloadPdfFile}>
                          Download PDF
                        </Button>
                      </Stack>
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
