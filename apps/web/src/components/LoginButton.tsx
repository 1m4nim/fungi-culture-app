import { signInWithPopup } from 'firebase/auth'
import { auth, provider } from '../firebase'

export default function LoginButton() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (e) {
      alert('ログイン失敗')
    }
  }

  return <button onClick={handleLogin}>Googleでログイン</button>
}
