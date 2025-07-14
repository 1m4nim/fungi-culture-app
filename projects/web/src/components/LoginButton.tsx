import React from 'react'
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

export default function LoginButton() {
  const handleLogin = async () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      // ログイン成功後の処理はApp側で auth.onAuthStateChanged などで行うことが多いです
      alert('ログインに成功しました！')
    } catch (error) {
      console.error('ログインエラー:', error)
      alert('ログインに失敗しました。')
    }
  }

  return (
    <button
      onClick={handleLogin}
      style={{
        padding: '8px 16px',
        backgroundColor: '#4285F4',
        color: 'white',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
      }}
    >
      Googleでログイン
    </button>
  )
}
