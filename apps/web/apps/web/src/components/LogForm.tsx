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
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { db, auth } from '../firebase'

type Log = {
  id: string
  uid: string
  note: string
  imageUrl?: string
  createdAt: Timestamp
}

export default function LogForm() {
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(false)

  // 編集用モーダル管理
  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editPreview, setEditPreview] = useState<string | null>(null)

  const storage = getStorage()

  // プレビュー画像生成・破棄（新規用）
  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  // プレビュー画像生成・破棄（編集用）
  useEffect(() => {
    if (!editFile) {
      setEditPreview(editingLog ? editingLog.imageUrl || null : null)
      return
    }
    const objectUrl = URL.createObjectURL(editFile)
    setEditPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [editFile, editingLog])

  // ログ一覧取得
  useEffect(() => {
    if (!auth.currentUser) return

    const fetchLogs = async () => {
      const q = query(
        collection(db, 'logs'),
        where('uid', '==', auth.currentUser.uid),
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

  // 新規作成フォーム送信
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser) {
      alert('ログインしてください')
      return
    }
    if (note.trim() === '') {
      alert('培養メモを入力してください')
      return
    }

    setLoading(true)

    try {
      let imageUrl = ''

      if (file) {
        const storageRef = ref(
          storage,
          `images/${auth.currentUser.uid}/${Date.now()}_${file.name}`
        )
        await uploadBytes(storageRef, file)
        imageUrl = await getDownloadURL(storageRef)
      }

      await addDoc(collection(db, 'logs'), {
        uid: auth.currentUser.uid,
        note,
        imageUrl,
        createdAt: Timestamp.now(),
      })

      alert('保存しました')
      await reloadLogs()
      resetForm()
    } catch (error) {
      console.error('アップロードに失敗しました', error)
      alert('アップロード中にエラーが発生しました')
    }
    setLoading(false)
  }

  // ログ一覧再取得関数
  const reloadLogs = async () => {
    if (!auth.currentUser) return
    const q = query(
      collection(db, 'logs'),
      where('uid', '==', auth.currentUser.uid),
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
    setEditPreview(log.imageUrl || null)
  }

  // 編集モーダル閉じる
  const closeEditModal = () => {
    setEditingLog(null)
    setEditNote('')
    setEditFile(null)
    setEditPreview(null)
  }

  // 編集モーダル保存
  const handleEditSave = async () => {
    if (!editingLog) return
    if (editNote.trim() === '') {
      alert('培養メモを入力してください')
      return
    }

    setLoading(true)
    try {
      let imageUrl = editingLog.imageUrl || ''

      if (editFile) {
        // 新規画像アップロード
        const storageRef = ref(
          storage,
          `images/${auth.currentUser!.uid}/${Date.now()}_${editFile.name}`
        )
        await uploadBytes(storageRef, editFile)
        imageUrl = await getDownloadURL(storageRef)

        // 古い画像削除（あれば）
        if (editingLog.imageUrl) {
          try {
            const oldRef = ref(storage, editingLog.imageUrl)
            await deleteObject(oldRef)
          } catch {
            // 削除失敗は無視
          }
        }
      }

      const logDoc = doc(db, 'logs', editingLog.id)
      await updateDoc(logDoc, {
        note: editNote,
        imageUrl,
      })

      alert('更新しました')
      await reloadLogs()
      closeEditModal()
    } catch (error) {
      console.error('更新に失敗しました', error)
      alert('更新中にエラーが発生しました')
    }
    setLoading(false)
  }

  // 削除処理
  const handleDelete = async (log: Log) => {
    if (!window.confirm('本当に削除しますか？')) return
    try {
      await deleteDoc(doc(db, 'logs', log.id))
      if (log.imageUrl) {
        try {
          const imageRef = ref(storage, log.imageUrl)
          await deleteObject(imageRef)
        } catch {
          // 削除失敗は無視
        }
      }
      setLogs((prev) => prev.filter((l) => l.id !== log.id))
      if (editingLog?.id === log.id) closeEditModal()
      alert('削除しました')
    } catch (error) {
      console.error('削除に失敗しました', error)
      alert('削除中にエラーが発生しました')
    }
  }

  return (
    <>
      {/* 新規作成フォーム */}
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

      {/* ログ一覧 */}
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
            {log.imageUrl && (
              <img
                src={log.imageUrl}
                alt="log image"
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

      {/* 編集モーダル */}
      {editingLog && (
        <>
          {/* オーバーレイ */}
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
          {/* モーダル本体 */}
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
