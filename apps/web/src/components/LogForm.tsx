import { useState } from 'react'
import { db, auth } from '../firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'

type Props = {
  onAddSuccess?: () => void
}

export default function LogForm({ onAddSuccess }: Props) {
  const [note, setNote] = useState('')

  const addLog = async () => {
    if (!auth.currentUser) return alert('ログインしてください')
    try {
      await addDoc(collection(db, 'logs'), {
        uid: auth.currentUser.uid,
        note,
        createdAt: Timestamp.now(),
      })
      alert('ログ追加成功')
      setNote('')

      // ✅ 親から渡された onAddSuccess を呼ぶ
      if (onAddSuccess) onAddSuccess()
    } catch (e) {
      alert('エラー発生')
      console.error(e)
    }
  }

  return (
    <div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="培養メモを記録"
      />
      <button onClick={addLog}>ログを追加</button>
    </div>
  )
}
