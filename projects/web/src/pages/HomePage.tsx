import { signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../firebase'
import LogForm from '../components/LogForm'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [userName, setUserName] = useState<string | null>(null)
  const [user, setUser] = useState(null)
  const provider = new GoogleAuthProvider()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName)
        setUser(user)
      } else {
        setUserName(null)
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider)
      // ログイン成功後はonAuthStateChangedが呼ばれるのでuserがセットされる
    } catch (error) {
      alert('Googleログインに失敗しました。')
    }
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <h2>ログインしてください</h2>
        <button
          onClick={handleGoogleLogin}
          style={{
            padding: '10px 20px',
            fontSize: 16,
            borderRadius: 5,
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Googleでログイン
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>ようこそ！{userName} さん</h2>
      <button
        onClick={() => signOut(auth)}
        style={{
          marginBottom: 20,
          padding: '8px 12px',
          backgroundColor: '#d32f2f',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        ログアウト
      </button>
      <LogForm />
    </div>
  )
}
