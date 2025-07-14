import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase'
import LoginButton from './components/LoginButton'
import LogForm from './components/LogForm'
import LogList from './components/LogList'

export default function App() {
  const [user, loading, error] = useAuthState(auth)

  if (loading) {
    return <p>読み込み中...</p>
  }

  if (error) {
    return <p>エラーが発生しました: {error.message}</p>
  }

  return (
    <div style={{ padding: '1rem', maxWidth: 800, margin: 'auto' }}>
      <h1>菌類培養ログアプリ</h1>

      {!user ? (
        <LoginButton />
      ) : (
        <>
          <p>こんにちは {user.displayName ?? 'ユーザー'} さん</p>
          <button
            onClick={() => auth.signOut()}
            style={{
              padding: '6px 12px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              marginBottom: '1rem',
            }}
          >
            ログアウト
          </button>
          <LogForm currentUser={{ uid: user.uid }} />
          <LogList />
        </>
      )}
    </div>
  )
}
