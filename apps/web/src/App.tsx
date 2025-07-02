import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ViewLog from './pages/ViewLog'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/logs/:logId" element={<ViewLog />} />
    </Routes>
  )
}
