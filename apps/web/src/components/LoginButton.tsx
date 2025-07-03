<<<<<<< HEAD
import React from 'react'
=======
>>>>>>> bba55227 (ログが反映されるようになった。空でも送れてしまうのは問題)
import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../firebase'

export default function LoginButton() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      alert('ログイン失敗')
<<<<<<< HEAD
      console.error(e)
=======
>>>>>>> bba55227 (ログが反映されるようになった。空でも送れてしまうのは問題)
    }
  }

  return <button onClick={handleLogin}>Googleでログイン</button>
}
