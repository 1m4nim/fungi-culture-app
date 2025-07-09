import React from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../firebase'

export default function LoginPage() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      alert('ログイン失敗')
    }
  }

  return (
    <div>
      <h2>ログインページ</h2>
      <button onClick={handleLogin}>Googleでログイン</button>
    </div>
  )
}
