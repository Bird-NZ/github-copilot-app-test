import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { workspaceApi } from '../api/workspaces';

export default function Workspaces() {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: workspaces, isLoading, error } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceApi.listWorkspaces(),
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (taxYear: number) => workspaceApi.createWorkspace(taxYear),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      navigate(`/workspaces/${workspace.id}`);
    },
  });

  const handleCreateWorkspace = () => {
    const taxYear = new Date().getFullYear();
    createMutation.mutate(taxYear);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load workspaces: {(error as Error).message}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">My Tax Workspaces</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateWorkspace}
          disabled={createMutation.isPending}
        >
          New Workspace
        </Button>
      </Box>

      {workspaces && workspaces.length === 0 ? (
        <Alert severity="info">
          No workspaces yet. Create your first tax workspace to get started.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {workspaces?.map((workspace) => (
            <Grid item xs={12} md={6} lg={4} key={workspace.id}>
              <Card
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
                onClick={() => navigate(`/workspaces/${workspace.id}`)}
              >
                <CardContent>
                  <Typography variant="h6">Tax Year {workspace.taxYear}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Status: {workspace.status}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Created: {new Date(workspace.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}