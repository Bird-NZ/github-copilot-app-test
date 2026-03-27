import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { workspaceApi, type Workspace } from '../api/workspaces'
import { useAuth } from '../auth/useAuth'

type TaxYearOption = {
  label: string
  taxYearStart: string
  taxYearEnd: string
}

function getNzTaxYearOptions(): TaxYearOption[] {
  const now = new Date()
  const currentStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  const startYears = [currentStartYear - 1, currentStartYear, currentStartYear + 1]

  return startYears.map((year) => ({
    label: `${year}–${year + 1} NZ tax year`,
    taxYearStart: `${year}-04-01`,
    taxYearEnd: `${year + 1}-03-31`,
  }))
}

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function WorkspaceCard({ workspace, onOpen }: { workspace: Workspace; onOpen: () => void }) {
  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <CardActionArea onClick={onOpen}>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1}
            >
              <Box>
                <Typography variant="h6">Tax workspace {workspace.id.slice(0, 8)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Covers income from {workspace.taxYearStart} to {workspace.taxYearEnd}
                </Typography>
              </Box>
              <Chip
                label={workspace.status || 'unknown'}
                color={workspace.status === 'in_progress' ? 'primary' : 'default'}
                variant="outlined"
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(workspace.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {formatDate(workspace.updatedAt)}
              </Typography>
            </Stack>
            <Typography variant="body2" color="primary" fontWeight={600}>
              Open and continue this return draft →
            </Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default function Workspaces() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated, isLoading, getUserEmail, logout } = useAuth()
  const taxYearOptions = useMemo(() => getNzTaxYearOptions(), [])
  const [selectedTaxYear, setSelectedTaxYear] = useState(taxYearOptions[1]?.taxYearStart || taxYearOptions[0].taxYearStart)

  const selectedOption = taxYearOptions.find((option) => option.taxYearStart === selectedTaxYear) || taxYearOptions[0]

  const workspacesQuery = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.list,
    enabled: isAuthenticated,
  })

  const createWorkspace = useMutation({
    mutationFn: workspaceApi.create,
    onSuccess: async (workspace) => {
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      navigate(`/workspaces/${workspace.id}`)
    },
  })

  const handleCreate = async () => {
    await createWorkspace.mutateAsync({
      taxYearStart: selectedOption.taxYearStart,
      taxYearEnd: selectedOption.taxYearEnd,
    })
  }

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3} sx={{ py: 4 }}>
        <Card sx={{ background: 'linear-gradient(135deg, rgba(15,118,110,0.95), rgba(15,23,42,0.92))', color: 'white' }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  My Tax Workspaces
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.86 }}>
                  Signed in as {getUserEmail()} · Start a workspace for one NZ tax year, then work through your income, documents, and IR3 draft step by step.
                </Typography>
              </Box>
              <Button variant="outlined" color="inherit" onClick={() => logout()} sx={{ borderColor: 'rgba(255,255,255,0.35)' }}>
                Sign out
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Alert severity="info">
          A workspace is your private draft area for one tax year. Pick the year you are filing for, then add the figures from your payslips, bank summaries, dividend statements, and other records.
        </Alert>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Create a workspace</Typography>
              <Typography variant="body2" color="text.secondary">
                Choose the NZ tax year first. In New Zealand, the tax year usually runs from 1 April to 31 March.
              </Typography>
              <TextField
                select
                label="Tax year"
                value={selectedTaxYear}
                onChange={(event) => setSelectedTaxYear(event.target.value)}
                helperText="Example: 2024–2025 means income earned between 1 April 2024 and 31 March 2025."
                fullWidth
              >
                {taxYearOptions.map((option) => (
                  <MenuItem key={option.taxYearStart} value={option.taxYearStart}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Typography variant="body2" color="text.secondary">
                Selected range: {selectedOption.taxYearStart} to {selectedOption.taxYearEnd}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Button variant="contained" onClick={handleCreate} disabled={createWorkspace.isPending}>
                  {createWorkspace.isPending ? 'Creating…' : 'Create workspace'}
                </Button>
                <Button variant="text" onClick={() => workspacesQuery.refetch()} disabled={workspacesQuery.isFetching}>
                  Refresh list
                </Button>
              </Stack>
              {createWorkspace.isError ? (
                <Alert severity="error">
                  Could not create workspace. {(createWorkspace.error as Error)?.message || 'Unknown error'}
                </Alert>
              ) : null}
            </Stack>
          </CardContent>
        </Card>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5">Existing workspaces</Typography>
            {workspacesQuery.isFetching ? <CircularProgress size={20} /> : null}
          </Stack>

          {workspacesQuery.isError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Failed to load workspaces. {(workspacesQuery.error as Error)?.message || 'Unknown error'}
            </Alert>
          ) : null}

          {workspacesQuery.isLoading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : workspacesQuery.data && workspacesQuery.data.length > 0 ? (
            <Stack spacing={2}>
              {workspacesQuery.data.map((workspace) => (
                <WorkspaceCard
                  key={workspace.id}
                  workspace={workspace}
                  onOpen={() => navigate(`/workspaces/${workspace.id}`)}
                />
              ))}
            </Stack>
          ) : (
            <Alert severity="info">No workspaces yet. Create your first tax workspace above to start gathering the information for your return.</Alert>
          )}
        </Box>
      </Stack>
    </Container>
  )
}
