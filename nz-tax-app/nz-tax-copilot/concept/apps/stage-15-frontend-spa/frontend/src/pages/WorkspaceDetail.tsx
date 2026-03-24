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
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { workspaceApi } from '../api/workspaces'
import { workspaceFlowsApi, type QuestionnaireAnswers } from '../api/workspaceFlows'

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export default function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({})
  const [gross, setGross] = useState('')
  const [payeWithheld, setPayeWithheld] = useState('')
  const [csvText, setCsvText] = useState('date,asset,type,amount,price_nzd,fee_nzd,exchange\n2025-06-01,BTC,buy,0.01,100000,15,Binance')

  const workspaceQuery = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceApi.get(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  const questionnaireQuery = useQuery({
    queryKey: ['workspace-questionnaire', workspaceId, answers],
    queryFn: () => workspaceFlowsApi.evaluateQuestionnaire(answers),
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

  const addPayeMutation = useMutation({
    mutationFn: (payload: { gross: number; payeWithheld: number }) =>
      workspaceFlowsApi.addPayeIncome(workspaceId || '', payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspace-income', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-calc', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-export', workspaceId] })
      setGross('')
      setPayeWithheld('')
    },
  })

  const importCryptoMutation = useMutation({
    mutationFn: (csv: string) => workspaceFlowsApi.importCryptoCsv(workspaceId || '', csv),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspace-crypto', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-calc', workspaceId] })
      await queryClient.invalidateQueries({ queryKey: ['workspace-export', workspaceId] })
    },
  })

  const visibleQuestions = questionnaireQuery.data?.visible || []
  const status = questionnaireQuery.data?.status
  const payeRows = incomeQuery.data?.paye || []
  const cryptoRows = cryptoQuery.data || []

  const summaryItems = useMemo(() => {
    const mapped = calcQuery.data?.map || {}
    const calc = calcQuery.data?.calc || {}
    return [...Object.entries(mapped), ...Object.entries(calc)]
  }, [calcQuery.data])

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
            <Tabs value={tab} onChange={(_e, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
              <Tab label="Questionnaire" />
              <Tab label="Income" />
              <Tab label="Crypto" />
              <Tab label="IR3 Summary" />
            </Tabs>

            <Divider sx={{ my: 2 }} />

            {tab === 0 ? (
              <Stack spacing={2}>
                <Typography variant="h6">Questionnaire</Typography>
                {status ? (
                  <Alert severity={status.complete ? 'success' : 'info'}>
                    {status.answeredVisible} of {status.totalVisible} visible questions answered
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
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: value === 'true',
                      }))
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
                <Typography variant="h6">PAYE income</Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    label="Gross income (NZD)"
                    type="number"
                    value={gross}
                    onChange={(event) => setGross(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="PAYE withheld (NZD)"
                    type="number"
                    value={payeWithheld}
                    onChange={(event) => setPayeWithheld(event.target.value)}
                    fullWidth
                  />
                </Stack>
                <Button
                  variant="contained"
                  disabled={!gross || !payeWithheld || addPayeMutation.isPending}
                  onClick={() =>
                    addPayeMutation.mutate({
                      gross: Number(gross),
                      payeWithheld: Number(payeWithheld),
                    })
                  }
                >
                  {addPayeMutation.isPending ? 'Saving…' : 'Add PAYE income'}
                </Button>
                {payeRows.length > 0 ? (
                  <Stack spacing={1}>
                    {payeRows.map((row) => (
                      <Card key={row.id} variant="outlined">
                        <CardContent>
                          <Typography variant="body1">Gross: ${row.gross}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            PAYE withheld: ${row.payeWithheld}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">No PAYE income added yet.</Alert>
                )}
              </Stack>
            ) : null}

            {tab === 2 ? (
              <Stack spacing={2}>
                <Typography variant="h6">Crypto CSV import</Typography>
                <TextField
                  label="Paste CSV"
                  value={csvText}
                  onChange={(event) => setCsvText(event.target.value)}
                  multiline
                  minRows={6}
                  fullWidth
                />
                <Button
                  variant="contained"
                  disabled={!csvText.trim() || importCryptoMutation.isPending}
                  onClick={() => importCryptoMutation.mutate(csvText)}
                >
                  {importCryptoMutation.isPending ? 'Importing…' : 'Import crypto CSV'}
                </Button>
                {cryptoRows.length > 0 ? (
                  <Stack spacing={1}>
                    {cryptoRows.map((row) => (
                      <Card key={row.id} variant="outlined">
                        <CardContent>
                          <Typography variant="body1">
                            {row.occurredAt} — {row.asset} {row.type} {row.amount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            NZD price: ${row.priceNzd} · Fee: ${row.feeNzd} · Source: {row.source || '—'}
                          </Typography>
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
                <Typography variant="h6">IR3 summary</Typography>
                {summaryItems.length > 0 ? (
                  <Stack spacing={1}>
                    {summaryItems.map(([ref, value]) => (
                      <Card key={ref} variant="outlined">
                        <CardContent>
                          <Typography variant="body1">{ref}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {value}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Alert severity="info">No calculation data yet. Add income or crypto data first.</Alert>
                )}

                {exportQuery.data ? (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Draft export preview
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {exportQuery.data.pdf.title} · {formatDate(exportQuery.data.pdf.generatedAt)}
                      </Typography>
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
