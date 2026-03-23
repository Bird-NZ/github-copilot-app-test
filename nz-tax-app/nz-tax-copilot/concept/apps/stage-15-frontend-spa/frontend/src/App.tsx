import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Workspaces from './pages/Workspaces'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/workspaces" element={<Workspaces />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
