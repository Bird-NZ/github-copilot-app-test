import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { workspaceApi } from '../api/workspaces';

export default function WorkspaceDetail() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);

  const { data: workspace, isLoading, error } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceApi.getWorkspace(workspaceId!),
    enabled: !!workspaceId,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !workspace) {
    return (
      <Alert severity="error">
        Failed to load workspace: {(error as Error)?.message || 'Workspace not found'}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Tax Year {workspace.taxYear}</Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate(`/workspaces/${workspaceId}/questionnaire`)}
            sx={{ mr: 1 }}
          >
            Questionnaire
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/workspaces/${workspaceId}/calculate`)}
          >
            Calculate IR3
          </Button>
        </Box>
      </Box>

      <Tabs value={currentTab} onChange={(_, v) => setCurrentTab(v)} sx={{ mb: 3 }}>
        <Tab label="Income" />
        <Tab label="Crypto Transactions" />
        <Tab label="Documents" />
      </Tabs>

      <Box sx={{ py: 2 }}>
        {currentTab === 0 && (
          <Typography>Income entries will be listed here</Typography>
        )}
        {currentTab === 1 && (
          <Typography>Crypto transactions will be listed here</Typography>
        )}
        {currentTab === 2 && (
          <Typography>Documents will be listed here</Typography>
        )}
      </Box>
    </Box>
  );
}