import { useEffect, useState } from 'react'
import {
  addDoc,
  collection,
  Timestamp,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db, auth } from '../firebase'

type Log = {
  id: string
  uid: string
  note: string
  imageDataUrl?: string
  imageName?: string
  createdAt: Timestamp
}

export default function LogForm() {
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(false)

  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editPreview, setEditPreview] = useState<string | null>(null)

  // 新規ファイルプレビュー
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  // 編集ファイルプレビュー
  useEffect(() => {
    if (!editFile) {
      setEditPreview(editingLog ? editingLog.imageDataUrl || null : null)
      return
    }
    const objectUrl = URL.createObjectURL(editFile)
    setEditPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [editFile, editingLog])

  // Firestoreからログ取得
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const fetchLogs = async () => {
      const q = query(
        collection(db, 'logs'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Log, 'id'>),
      }))
      setLogs(data)
    }

    fetchLogs()
  }, [auth.currentUser])

  const resetForm = () => {
    setNote('')
    setFile(null)
    setPreview(null)
  }

  // FileをBase64に変換
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result)
        else reject(new Error('読み込みエラー'))
      }
      reader.onerror = () => reject(new Error('読み込みエラー'))
      reader.readAsDataURL(file)
    })
  }

  // ファイル名生成 (例: 20250710_092530_a1b2c3d4)
  const generateImageName = () => {
    const now = new Date()
    const y = now.getFullYear().toString()
    const m = (now.getMonth() + 1).toString().padStart(2, '0')
    const d = now.getDate().toString().padStart(2, '0')
    const hh = now.getHours().toString().padStart(2, '0')
    const mm = now.getMinutes().toString().padStart(2, '0')
    const ss = now.getSeconds().toString().padStart(2, '0')
    const randomStr = Math.random().toString(36).slice(2, 10)
    return `${y}${m}${d}_${hh}${mm}${ss}_${randomStr}`
  }

  // 新規ログ保存
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user) {
      alert('ログインしてください')
      return
    }
    if (note.trim() === '') {
      alert('培養メモを入力してください')
      return
    }

    setLoading(true)
    try {
      let imageDataUrl = ''
      let imageName = ''

      if (file) {
        imageDataUrl = await fileToDataUrl(file)
        imageName = generateImageName()
      }

      await addDoc(collection(db, 'logs'), {
        uid: user.uid,
        note,
        imageDataUrl,
        imageName,
        createdAt: Timestamp.now(),
      })

      alert('保存しました')
      await reloadLogs()
      resetForm()
    } catch (error) {
      console.error('保存に失敗しました', error)
      alert('エラーが発生しました')
    }
    setLoading(false)
  }

  // ログ再読み込み
  const reloadLogs = async () => {
    const user = auth.currentUser
    if (!user) return

    const q = query(
      collection(db, 'logs'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Log, 'id'>),
    }))
    setLogs(data)
  }

  // 編集モーダル開く
  const openEditModal = (log: Log) => {
    setEditingLog(log)
    setEditNote(log.note)
    setEditFile(null)
    setEditPreview(log.imageDataUrl || null)
  }

  const closeEditModal = () => {
    setEditingLog(null)
    setEditNote('')
    setEditFile(null)
    setEditPreview(null)
  }

  // 編集内容保存
  const handleEditSave = async () => {
    if (!editingLog) return
    const user = auth.currentUser
    if (!user) {
      alert('ログインしてください')
      return
    }
    if (editNote.trim() === '') {
      alert('培養メモを入力してください')
      return
    }

    setLoading(true)
    try {
      let imageDataUrl = editingLog.imageDataUrl || ''
      let imageName = editingLog.imageName || ''

      if (editFile) {
        imageDataUrl = await fileToDataUrl(editFile)
        imageName = generateImageName()
      }

      const logDoc = doc(db, 'logs', editingLog.id)
      await updateDoc(logDoc, {
        note: editNote,
        imageDataUrl,
        imageName,
      })

      alert('更新しました')
      await reloadLogs()
      closeEditModal()
    } catch (error) {
      console.error('更新に失敗しました', error)
      alert('エラーが発生しました')
    }
    setLoading(false)
  }

  // ログ削除
  const handleDelete = async (log: Log) => {
    if (!window.confirm('本当に削除しますか？')) return
    try {
      await deleteDoc(doc(db, 'logs', log.id))
      setLogs((prev) => prev.filter((l) => l.id !== log.id))
      if (editingLog?.id === log.id) closeEditModal()
      alert('削除しました')
    } catch (error) {
      console.error('削除に失敗しました', error)
      alert('エラーが発生しました')
    }
  }

  return (
    <>
      <form onSubmit={handleUpload}>
        <h2>培養メモを記録</h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="菌の状態などを記録"
          rows={5}
          cols={40}
          disabled={loading}
        />
        <br />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) setFile(f)
            else setFile(null)
          }}
          disabled={loading}
        />
        <br />
        {preview && (
          <div style={{ marginTop: 10 }}>
            <strong>画像プレビュー：</strong>
            <br />
            <img
              src={preview}
              alt="preview"
              style={{ maxWidth: '300px', borderRadius: '8px' }}
            />
          </div>
        )}
        <br />
        <button type="submit" disabled={note.trim() === '' || loading}>
          画像付きログを保存
        </button>
      </form>

      <hr />

      <h2>過去のログ一覧</h2>
      {logs.length === 0 && <p>ログがありません</p>}
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {logs.map((log) => (
          <li
            key={log.id}
            style={{
              marginBottom: 20,
              borderBottom: '1px solid #ccc',
              paddingBottom: 10,
            }}
          >
            <p>{log.note}</p>
            {log.imageDataUrl && (
              <img
                src={log.imageDataUrl}
                alt={log.imageName || 'log image'}
                style={{ maxWidth: 200, borderRadius: '8px' }}
              />
            )}
            <p style={{ fontSize: 12, color: '#666' }}>
              作成日: {log.createdAt.toDate().toLocaleString()}
            </p>
            <button
              onClick={() => openEditModal(log)}
              disabled={loading}
              style={{ marginRight: 10 }}
            >
              編集
            </button>
            <button
              onClick={() => handleDelete(log)}
              disabled={loading}
              style={{ color: 'red' }}
            >
              削除
            </button>
          </li>
        ))}
      </ul>

      {editingLog && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
            }}
            onClick={closeEditModal}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 8,
              zIndex: 1000,
              width: '90%',
              maxWidth: 400,
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>ログを編集</h3>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              rows={5}
              style={{ width: '100%' }}
              disabled={loading}
            />
            <br />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) setEditFile(f)
              }}
              disabled={loading}
            />
            <br />
            {editPreview && (
              <div style={{ marginTop: 10 }}>
                <strong>画像プレビュー：</strong>
                <br />
                <img
                  src={editPreview}
                  alt="edit preview"
                  style={{ maxWidth: '300px', borderRadius: '8px' }}
                />
              </div>
            )}
            <br />
            <button
              onClick={handleEditSave}
              disabled={editNote.trim() === '' || loading}
            >
              保存
            </button>
            <button
              onClick={closeEditModal}
              style={{ marginLeft: 10 }}
              disabled={loading}
            >
              キャンセル
            </button>
          </div>
        </>
      )}
    </>
  )
}
