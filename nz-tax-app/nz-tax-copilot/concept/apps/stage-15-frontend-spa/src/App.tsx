import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Workspaces from './pages/Workspaces';
import WorkspaceDetail from './pages/WorkspaceDetail';
import Questionnaire from './pages/Questionnaire';
import Calculation from './pages/Calculation';
import Export from './pages/Export';
import Guidance from './pages/Guidance';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const { isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="workspaces"
              element={isAuthenticated ? <Workspaces /> : <Navigate to="/" replace />}
            />
            <Route
              path="workspaces/:workspaceId"
              element={isAuthenticated ? <WorkspaceDetail /> : <Navigate to="/" replace />}
            />
            <Route
              path="workspaces/:workspaceId/questionnaire"
              element={isAuthenticated ? <Questionnaire /> : <Navigate to="/" replace />}
            />
            <Route
              path="workspaces/:workspaceId/calculate"
              element={isAuthenticated ? <Calculation /> : <Navigate to="/" replace />}
            />
            <Route
              path="workspaces/:workspaceId/export"
              element={isAuthenticated ? <Export /> : <Navigate to="/" replace />}
            />
            <Route
              path="guidance"
              element={isAuthenticated ? <Guidance /> : <Navigate to="/" replace />}
            />
          </Route>
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;