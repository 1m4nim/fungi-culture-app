import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import LogList from '../components/LogList'
import LogForm from '../components/LogForm'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    // ログインしているユーザーの名前を取得
    const user = auth.currentUser
    if (user) {
      setUserName(user.displayName)
    }
  }, [])

  return (
    <div>
      <h2>ようこそ！{userName} さん</h2>
      <button onClick={() => signOut(auth)}>ログアウト</button>
      <LogList />
      <LogForm />
    </div>
  )
}
