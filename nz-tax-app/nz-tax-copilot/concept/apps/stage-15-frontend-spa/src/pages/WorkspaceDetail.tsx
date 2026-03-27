import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import {
  CheckCircleOutlineRounded as CheckCircleOutlineRoundedIcon,
  ErrorOutlineRounded as ErrorOutlineRoundedIcon,
  UploadFileRounded as UploadFileRoundedIcon,
  WarningAmberRounded as WarningAmberRoundedIcon,
} from '@mui/icons-material';
import { workspaceApi } from '../api/workspaces';

function CryptoTab({ workspaceId }: { workspaceId: string }) {
  const { data: review, isLoading, error } = useQuery({
    queryKey: ['workspace-review', workspaceId],
    queryFn: () => workspaceApi.getReview(workspaceId),
    enabled: !!workspaceId,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error || !review) {
    return (
      <Alert severity="warning">
        We could not load the crypto review guidance right now. Try refreshing this workspace.
      </Alert>
    );
  }

  const cryptoWarnings = review.warnings.filter((warning) => warning.code.startsWith('CRYPTO_'));
  const missingRecords = cryptoWarnings.find((warning) => warning.code === 'CRYPTO_ACTIVITY_MISSING');
  const missingEvidence = cryptoWarnings.find((warning) => warning.code === 'CRYPTO_EVIDENCE_MISSING');
  const transactionSummary = Object.entries(review.crypto.transactionCounts).filter(([, count]) => count > 0);

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          What this section is for
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Use this tab to sense-check whether your crypto activity is likely to affect the tax draft,
          what records are still missing, and what you should gather before final review.
        </Typography>
        <Alert severity={missingRecords ? 'warning' : 'info'} sx={{ mb: 2 }}>
          {review.crypto.intro}
        </Alert>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            color={review.crypto.status.hasAnyCryptoActivity ? 'warning' : 'success'}
            label={review.crypto.status.hasAnyCryptoActivity ? 'Crypto activity detected' : 'No imported crypto activity yet'}
          />
          <Chip
            color={review.crypto.status.hasCryptoCsv ? 'success' : 'default'}
            label={review.crypto.status.hasCryptoCsv ? 'CSV / export uploaded' : 'CSV / export still needed'}
          />
          <Chip
            color={review.crypto.status.saidHasCrypto ? 'primary' : 'default'}
            label={review.crypto.status.saidHasCrypto ? 'Questionnaire says you had crypto' : 'No crypto indicated in questionnaire'}
          />
        </Box>
      </Paper>

      {(missingRecords || missingEvidence) && (
        <Alert severity={missingRecords ? 'warning' : 'info'}>
          {missingRecords?.message || missingEvidence?.message}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Taxable activity checklist
        </Typography>
        <List disablePadding>
          {review.crypto.taxableActivities.map((item) => (
            <ListItem key={item.activity} disableGutters sx={{ py: 1.25 }}>
              {item.taxable ? (
                <WarningAmberRoundedIcon color="warning" sx={{ mr: 1.5 }} />
              ) : (
                <CheckCircleOutlineRoundedIcon color="success" sx={{ mr: 1.5 }} />
              )}
              <ListItemText
                primary={item.activity}
                secondary={
                  item.taxable
                    ? 'Likely worth reviewing for tax treatment.'
                    : 'Not currently showing up from the imported records.'
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          What to provide
        </Typography>
        <List disablePadding>
          {review.crypto.whatToProvide.map((item) => (
            <ListItem key={item} disableGutters sx={{ py: 1.1 }}>
              <UploadFileRoundedIcon color="primary" sx={{ mr: 1.5 }} />
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Imported crypto snapshot
        </Typography>
        {transactionSummary.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {transactionSummary.map(([type, count]) => (
              <Chip key={type} variant="outlined" label={`${count} ${type}`} />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ErrorOutlineRoundedIcon color="disabled" />
            <Typography color="text.secondary">
              No crypto transactions have been imported into this workspace yet.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

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

      <Tabs
        value={currentTab}
        onChange={(_event: SyntheticEvent, value: number) => setCurrentTab(value)}
        sx={{ mb: 3 }}
      >
        <Tab label="Income" />
        <Tab label="Crypto Transactions" />
        <Tab label="Documents" />
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      <Box sx={{ py: 2 }}>
        {currentTab === 0 && (
          <Typography>Income entries will be listed here</Typography>
        )}
        {currentTab === 1 && workspaceId && <CryptoTab workspaceId={workspaceId} />}
        {currentTab === 2 && (
          <Typography>Documents will be listed here</Typography>
        )}
      </Box>
    </Box>
  );
}
