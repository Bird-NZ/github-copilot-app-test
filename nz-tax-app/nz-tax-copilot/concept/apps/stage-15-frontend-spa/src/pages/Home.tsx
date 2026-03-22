import { useAuth0 } from '@auth0/auth0-react';
import { Box, Typography, Button, Container, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" gutterBottom>
          NZ Tax Copilot
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Simplified tax preparation for New Zealand individuals
        </Typography>

        {!isAuthenticated ? (
          <Button
            variant="contained"
            size="large"
            onClick={() => loginWithRedirect()}
          >
            Get Started
          </Button>
        ) : (
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/workspaces')}
          >
            View My Workspaces
          </Button>
        )}
      </Box>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Guided Workflow
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Step-by-step questionnaire to determine which income categories apply to you
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Crypto Support
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automatic capital gains calculation using FIFO method for cryptocurrency transactions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                IRD Guidance
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered assistant with answers grounded in official Inland Revenue documentation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}