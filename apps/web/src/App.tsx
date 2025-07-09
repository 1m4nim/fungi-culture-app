import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'

export default function App() {
  const [user, loading] = useAuthState(auth)

  if (loading) return <p>読み込み中...</p>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!user ? <LoginPage /> : <Navigate to="/home" />} />
        <Route path="/home" element={user ? <HomePage /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
