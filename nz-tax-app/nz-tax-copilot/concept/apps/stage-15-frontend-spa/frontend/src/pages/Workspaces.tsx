import { Container, Typography, Box } from '@mui/material'

export default function Workspaces() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Tax Workspaces
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Workspace list will appear here (requires backend API integration)
        </Typography>
      </Box>
    </Container>
  )
}