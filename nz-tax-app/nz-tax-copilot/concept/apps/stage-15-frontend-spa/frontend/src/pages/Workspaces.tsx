import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workspaceApi, type Workspace } from '../api/workspaces'

function getDefaultTaxYearRange() {
  const now = new Date()
  const year = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  return {
    taxYearStart: `${year}-04-01`,
    taxYearEnd: `${year + 1}-03-31`,
  }
}

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
          >
            <Box>
              <Typography variant="h6">Workspace {workspace.id.slice(0, 8)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Tax year: {workspace.taxYearStart} to {workspace.taxYearEnd}
              </Typography>
            </Box>
            <Chip
              label={workspace.status || 'unknown'}
              color={workspace.status === 'in_progress' ? 'primary' : 'default'}
              variant="outlined"
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            Created: {formatDate(workspace.createdAt)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Updated: {formatDate(workspace.updatedAt)}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default function Workspaces() {
  const queryClient = useQueryClient()
  const defaults = useMemo(() => getDefaultTaxYearRange(), [])
  const [taxYearStart, setTaxYearStart] = useState(defaults.taxYearStart)
  const [taxYearEnd, setTaxYearEnd] = useState(defaults.taxYearEnd)

  const workspacesQuery = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.list,
  })

  const createWorkspace = useMutation({
    mutationFn: workspaceApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })

  const handleCreate = async () => {
    await createWorkspace.mutateAsync({ taxYearStart, taxYearEnd })
  }

  return (
    <Container maxWidth="lg">
      <Stack spacing={3} sx={{ py: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            My Tax Workspaces
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No-auth V1 mode is active. You can create and manage draft tax workspaces without signing in.
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Create a workspace</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Tax year start"
                  type="date"
                  value={taxYearStart}
                  onChange={(event) => setTaxYearStart(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="Tax year end"
                  type="date"
                  value={taxYearEnd}
                  onChange={(event) => setTaxYearEnd(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Button
                  variant="contained"
                  onClick={handleCreate}
                  disabled={!taxYearStart || !taxYearEnd || createWorkspace.isPending}
                >
                  {createWorkspace.isPending ? 'Creating…' : 'Create workspace'}
                </Button>
                <Button
                  variant="text"
                  onClick={() => workspacesQuery.refetch()}
                  disabled={workspacesQuery.isFetching}
                >
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
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </Stack>
          ) : (
            <Alert severity="info">No workspaces yet. Create your first tax workspace above.</Alert>
          )}
        </Box>
      </Stack>
    </Container>
  )
}
