<<<<<<< HEAD
import React from 'react'

export default function App() {
  return <h1>Hello, Fungi Culture App!</h1>
=======
import LoginButton from './components/LoginButton'
import LogForm from './components/LogForm'
import LogList from './components/LogList'
import { auth } from './firebase'
import { useAuthState } from 'react-firebase-hooks/auth'

export default function App() {
  const [user] = useAuthState(auth)

  return (
    <div>
      <h1>菌類培養ログアプリ</h1>
      {!user ? (
        <LoginButton />
      ) : (
        <>
          <p>こんにちは {user.displayName} さん</p>
          <LogForm />
          <LogList />
        </>
      )}
    </div>
  )
>>>>>>> bba55227 (ログが反映されるようになった。空でも送れてしまうのは問題)
}
