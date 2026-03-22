import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Workspaces from './pages/Workspaces';
import WorkspaceDetail from './pages/WorkspaceDetail';
import Login from './pages/Login';

const App: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={isAuthenticated ? <Navigate to="/workspaces" replace /> : <Home />} />
        <Route path="login" element={<Login />} />
        <Route path="workspaces" element={isAuthenticated ? <Workspaces /> : <Navigate to="/login" replace />} />
        <Route path="workspaces/:workspaceId" element={isAuthenticated ? <WorkspaceDetail /> : <Navigate to="/login" replace />} />
      </Route>
    </Routes>
  );
};

export default App;