import React, { useEffect, useState } from 'react'
import { db, auth } from '../firebase'
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore'

type Log = {
  id: string
  note: string
  imageUrl?: string
  createdAt: any
}

type Props = {
  reloadTrigger?: boolean
}

export default function LogList({ reloadTrigger }: Props) {
  const [logs, setLogs] = useState<Log[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editNote, setEditNote] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      if (!auth.currentUser) return

      const q = query(
        collection(db, 'logs'),
        where('uid', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      setLogs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Log)))
    }

    fetchLogs()
  }, [reloadTrigger, auth.currentUser])

  const deleteLog = async (id: string) => {
    if (!window.confirm('本当に削除しますか？')) return
    try {
      await deleteDoc(doc(db, 'logs', id))
      setLogs((prev) => prev.filter((log) => log.id !== id))
      alert('削除成功')
    } catch (e) {
      alert('削除失敗')
      console.error(e)
    }
  }

  const startEdit = (log: Log) => {
    setEditingId(log.id)
    setEditNote(log.note)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditNote('')
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      await updateDoc(doc(db, 'logs', editingId), {
        note: editNote,
      })
      setLogs((prev) =>
        prev.map((log) =>
          log.id === editingId ? { ...log, note: editNote } : log
        )
      )
      cancelEdit()
      alert('編集成功')
    } catch (e) {
      alert('編集失敗')
      console.error(e)
    }
  }

  return (
    <div>
      <h3>あなたのログ</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {logs.map((log) => (
          <li key={log.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '0.5rem' }}>
            {editingId === log.id ? (
              <>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={4}
                  cols={30}
                />
                <br />
                <button onClick={saveEdit}>保存</button>
                <button onClick={cancelEdit}>キャンセル</button>
              </>
            ) : (
              <>
                <p>{log.note}</p>
                <p>
                  （
                  {log.createdAt?.toDate().toLocaleString() ?? '日時不明'}
                  ）
                </p>
                {log.imageUrl && (
                  <img
                    src={log.imageUrl}
                    alt="培養写真"
                    style={{ maxWidth: '200px', maxHeight: '200px' }}
                  />
                )}
                <br />
                <button onClick={() => startEdit(log)}>編集</button>{' '}
                <button onClick={() => deleteLog(log.id)}>削除</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
