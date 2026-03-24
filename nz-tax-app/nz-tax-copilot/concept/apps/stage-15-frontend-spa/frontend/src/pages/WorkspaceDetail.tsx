import { Alert, Box, Button, Card, CardContent, Chip, Container, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { workspaceApi } from '../api/workspaces'

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

export default function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>()

  const workspaceQuery = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceApi.get(workspaceId || ''),
    enabled: Boolean(workspaceId),
  })

  return (
    <Container maxWidth="md">
      <Stack spacing={3} sx={{ py: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Workspace
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View the tax year details for this workspace.
            </Typography>
          </Box>
          <Button component={RouterLink} to="/workspaces" variant="outlined">
            Back to workspaces
          </Button>
        </Stack>

        {workspaceQuery.isError ? (
          <Alert severity="error">
            Could not load workspace. {(workspaceQuery.error as Error)?.message || 'Unknown error'}
          </Alert>
        ) : null}

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

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tax year
                  </Typography>
                  <Typography variant="body1">
                    {workspaceQuery.data.taxYearStart} to {workspaceQuery.data.taxYearEnd}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body1">{formatDate(workspaceQuery.data.createdAt)}</Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Updated
                  </Typography>
                  <Typography variant="body1">{formatDate(workspaceQuery.data.updatedAt)}</Typography>
                </Box>

                <Alert severity="info">
                  Next step: I still need to wire the deeper workflow screens inside a workspace. For now, this confirms the workspace opens correctly.
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        ) : workspaceQuery.isLoading ? (
          <Typography color="text.secondary">Loading workspace…</Typography>
        ) : null}
      </Stack>
    </Container>
  )
}
