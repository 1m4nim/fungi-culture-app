import { useEffect, useState } from 'react'
import { db, auth } from '../firebase'
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore'

type Log = {
  id: string
  note: string
  imageUrl?: string
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
      <h3>あなたの培養ログ</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {logs.map((log) => (
          <li
            key={log.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
          >
            {log.imageUrl && (
              <img
                src={log.imageUrl}
                alt="培養写真"
                width="150"
                style={{ borderRadius: '4px' }}
              />
            )}
            <p>{log.note}</p>
            <p>{log.createdAt?.toDate().toLocaleString() ?? ''}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
