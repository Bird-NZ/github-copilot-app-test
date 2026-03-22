import { Container, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          NZ Tax Copilot
        </Typography>
        <Typography variant="h5" component="p" color="text.secondary" paragraph>
          Simplified tax preparation for New Zealand individual taxpayers
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/workspaces')}
          >
            Get Started
          </Button>
        </Box>
      </Box>
    </Container>
  )
}