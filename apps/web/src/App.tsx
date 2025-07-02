import React, { useState } from 'react'
import LoginButton from './components/LoginButton'
import LogForm from './components/LogForm'
import LogList from './components/LogList'
import { auth } from './firebase'
import { useAuthState } from 'react-firebase-hooks/auth'

export default function App() {
  const [user] = useAuthState(auth)
  const [reloadLogs, setReloadLogs] = useState(false)

  const handleLogAdded = () => {
    setReloadLogs((prev) => !prev)
  }

  return (
    <div>
      <h1>菌類培養ログアプリ</h1>
      {!user ? (
        <LoginButton />
      ) : (
        <>
          <p>こんにちは {user.displayName} さん</p>
          <LogForm onAddSuccess={handleLogAdded} />
          <LogList reloadTrigger={reloadLogs} />
        </>
      )}
    </div>
  )
}
