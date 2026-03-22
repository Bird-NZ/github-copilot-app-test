import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

export default function Export() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Export IR3 Summary
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Download your draft tax return summary.
      </Typography>

      {/* Export options will be displayed here */}
      <Typography variant="body2" sx={{ mb: 2 }}>
        Export functionality coming soon...
      </Typography>

      <Button
        variant="outlined"
        onClick={() => navigate(`/workspaces/${workspaceId}`)}
      >
        Back to Workspace
      </Button>
    </Box>
  );
}