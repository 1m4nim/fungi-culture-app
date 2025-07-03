import { useState } from 'react'
<<<<<<< HEAD
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
=======
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, auth } from '../firebase'

export default function LogForm() {
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const storage = getStorage()

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault() // ← 重要：submitを止める

    if (!auth.currentUser) {
      alert('ログインしてください')
      return
    }

    if (note.trim() === '') {
      alert('培養メモを入力してください')
      return
    }

    let imageUrl = ''

    try {
      if (file) {
        const storageRef = ref(storage, `images/${auth.currentUser.uid}/${file.name}`)
        await uploadBytes(storageRef, file)
        imageUrl = await getDownloadURL(storageRef)
      }

      await addDoc(collection(db, 'logs'), {
        uid: auth.currentUser.uid,
        note,
        imageUrl,
        createdAt: Timestamp.now()
      })

      alert('保存しました')
      setNote('')
      setFile(null)
    } catch (error) {
      console.error('アップロードに失敗しました', error)
      alert('アップロード中にエラーが発生しました')
>>>>>>> bba55227 (ログが反映されるようになった。空でも送れてしまうのは問題)
    }
  }

  return (
<<<<<<< HEAD
    <div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="培養メモを記録"
      />
      <button onClick={addLog}>ログを追加</button>
    </div>
=======
    <form onSubmit={handleUpload}>
      <h2>培養メモを記録</h2>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="菌の状態などを記録"
        rows={5}
        cols={40}
      />
      <br />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) setFile(f)
        }}
      />
      <br />
      <button
  type="submit"  // ← submit に変更
  disabled={note.trim() === ''}
>
  画像付きログを保存
</button>
    </form>
>>>>>>> bba55227 (ログが反映されるようになった。空でも送れてしまうのは問題)
  )
}
