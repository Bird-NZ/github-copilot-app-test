import { useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Chip, Container, Stack, TextField, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading, login, signup, getUserEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [pending, setPending] = useState(false)

  const handleAuth = async () => {
    setPending(true)
    setError(null)
    try {
      if (mode === 'signup') {
        await signup(email.trim().toLowerCase(), password)
      }
      await login(email.trim().toLowerCase(), password)
      navigate('/workspaces')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      setError(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: { xs: 5, md: 10 } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="stretch">
          <Card sx={{ flex: 1, background: 'linear-gradient(135deg, rgba(15,118,110,0.96), rgba(124,58,237,0.9))', color: 'white' }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={3}>
                <Chip label="NZ Tax Copilot" sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.16)', color: 'white' }} />
                <Box>
                  <Typography variant="h3" component="h1" gutterBottom>
                    Understand your NZ tax return before you fill it in
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.92 }}>
                    Start a guided IR3 workspace, add the numbers from your payslips and bank statements, and see a plain-English draft summary before you file anything.
                  </Typography>
                </Box>
                <Stack spacing={1.5}>
                  <Typography variant="body1">• Plain-English explanations instead of tax jargon</Typography>
                  <Typography variant="body1">• Clear prompts about where to find each figure</Typography>
                  <Typography variant="body1">• Downloadable draft package to review before filing</Typography>
                </Stack>
                <Alert severity="info" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white', '& .MuiAlert-icon': { color: 'white' } }}>
                  This app helps you organise and understand your return. It does not submit anything to Inland Revenue for you.
                </Alert>
                {isAuthenticated ? (
                  <Alert severity="success" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white', '& .MuiAlert-icon': { color: 'white' } }}>
                    Signed in as {getUserEmail()}. Your workspace is ready.
                  </Alert>
                ) : null}
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {mode === 'signup' ? 'Create your account' : 'Sign in'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use a simple local account so your workspaces stay private and you can come back to them later.
                  </Typography>
                </Box>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  helperText="Use the email address you want attached to your saved workspaces."
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText="Create a password you can remember. You'll use it each time you return to your tax workspace."
                  fullWidth
                />
                {error ? <Alert severity="error">{error}</Alert> : null}
                <Stack spacing={1.5}>
                  <Button variant="contained" size="large" onClick={handleAuth} disabled={!email || !password || pending || isLoading} fullWidth>
                    {pending || isLoading ? 'Working…' : mode === 'signup' ? 'Create account and sign in' : 'Sign in'}
                  </Button>
                  <Button variant="outlined" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} disabled={pending || isLoading} fullWidth>
                    {mode === 'signup' ? 'Switch to sign in' : 'Create a new account'}
                  </Button>
                  <Button variant="text" onClick={() => navigate('/workspaces')} disabled={!isAuthenticated}>
                    Open workspaces
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  )
}
