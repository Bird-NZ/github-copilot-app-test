import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

export default function Calculation() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        IR3 Calculation
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Your draft tax return calculation will be displayed here.
      </Typography>

      {/* Calculation results will be displayed here */}
      <Typography variant="body2" sx={{ mb: 2 }}>
        Calculation results coming soon...
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate(`/workspaces/${workspaceId}/export`)}
        sx={{ mr: 1 }}
      >
        Export IR3
      </Button>
      <Button
        variant="outlined"
        onClick={() => navigate(`/workspaces/${workspaceId}`)}
      >
        Back to Workspace
      </Button>
    </Box>
  );
}