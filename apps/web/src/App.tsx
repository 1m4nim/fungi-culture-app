import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase'
import LoginPage from './pages/LoginPage'
import LogForm from './components/LogForm'
import LogList from './components/LogList'

export default function App() {
  const [user, loading] = useAuthState(auth)

  if (loading) return <p>読み込み中...</p>

  return (
    <BrowserRouter>
      <Routes>
        {/* "/" はログインページに */}
        <Route path="/" element={!user ? <LoginPage /> : <Navigate to="/home" />} />

        {/* "/home" にログイン後アクセス可能 */}

        <Route path='/home' element={user?<LogForm/>:<Navigate to="/" />}/>
        <Route path="/home" element={user ? <LogList /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
