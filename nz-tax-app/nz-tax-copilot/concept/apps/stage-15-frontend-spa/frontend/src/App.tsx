import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useIsAuthenticated } from '@azure/msal-react'
import { Container, Box } from '@mui/material'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Workspaces } from './pages/Workspaces'
import { WorkspaceDetail } from './pages/WorkspaceDetail'
import { Questionnaire } from './pages/Questionnaire'
import { Calculation } from './pages/Calculation'
import { Export } from './pages/Export'
import { Guidance } from './pages/Guidance'
import { AuthCallback } from './pages/AuthCallback'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated()
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route element={<Layout />}>
        <Route 
          path="/workspaces" 
          element={
            <ProtectedRoute>
              <Workspaces />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workspaces/:workspaceId" 
          element={
            <ProtectedRoute>
              <WorkspaceDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workspaces/:workspaceId/questionnaire" 
          element={
            <ProtectedRoute>
              <Questionnaire />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workspaces/:workspaceId/calculation" 
          element={
            <ProtectedRoute>
              <Calculation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workspaces/:workspaceId/export" 
          element={
            <ProtectedRoute>
              <Export />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/guidance" 
          element={
            <ProtectedRoute>
              <Guidance />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  )
}

export default App