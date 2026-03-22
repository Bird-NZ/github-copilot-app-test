import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

export default function Questionnaire() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tax Questionnaire
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Answer these questions to help us determine which income categories apply to you.
      </Typography>

      {/* Questionnaire form will be implemented here */}
      <Typography variant="body2" sx={{ mb: 2 }}>
        Questionnaire form coming soon...
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate(`/workspaces/${workspaceId}`)}
      >
        Back to Workspace
      </Button>
    </Box>
  );
}