import { signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import LogForm from '../components/LogForm'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName)
      } else {
        setUserName(null)
      }
    })

    return () => unsubscribe() // クリーンアップ
  }, [])

  return (
    <div>
      <h2>ようこそ！{userName} さん</h2>
      <button onClick={() => signOut(auth)}>ログアウト</button>
      <LogForm />
    </div>
  )
}
