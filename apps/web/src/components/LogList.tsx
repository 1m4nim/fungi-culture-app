import { useEffect, useState } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

type Log = {
  id: string
  note: string
  createdAt: any
}

export default function LogList() {
  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    if (!auth.currentUser) return

    const fetchLogs = async () => {
      const q = query(
        collection(db, 'logs'),
        where('uid', '==', auth.currentUser?.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      setLogs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Log)))
    }

    fetchLogs()
  }, [auth.currentUser])

  return (
    <div>
      <h3>あなたのログ</h3>
      <ul>
        {logs.map((log) => (
          <li key={log.id}>
            {log.note}（{log.createdAt?.toDate().toLocaleString() ?? '日時不明'}）
          </li>
        ))}
      </ul>
    </div>
  )
}
