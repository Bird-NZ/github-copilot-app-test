import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h2" component="h1" gutterBottom>
              NZ Tax Copilot
            </Typography>
            <Typography variant="h5" component="p" color="text.secondary">
              Simplified tax preparation for New Zealand individual taxpayers
            </Typography>
          </Box>

          <Alert severity="info" sx={{ textAlign: 'left' }}>
            V1 is currently running in no-auth mode so the core tax workflow can be tested end-to-end without sign-in.
          </Alert>

          <Box>
            <Button variant="contained" size="large" onClick={() => navigate('/workspaces')}>
              Open workspaces
            </Button>
          </Box>
        </Stack>
      </Box>
    </Container>
  )
}
