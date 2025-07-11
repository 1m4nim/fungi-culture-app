import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  where,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { User } from 'firebase/auth'

type Log = {
  id: string
  uid: string
  note: string
  imageUrl: string
  createdAt: any
  tags: string[]
  category?: string
}

type LogFormProps = {
  currentUser: User
}

const CATEGORY_OPTIONS = ['菌株', '培地', 'PCR', '観察', 'その他']

export default function LogForm({ currentUser }: LogFormProps) {
  const [logs, setLogs] = useState<Log[]>([])
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([])
  const [searchTag, setSearchTag] = useState('')

  const [showNewModal, setShowNewModal] = useState(false)
  const [note, setNote] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [newTags, setNewTags] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [editNote, setEditNote] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState('')

  const [loading, setLoading] = useState(false)

  const reloadLogs = async () => {
    const q = query(
      collection(db, 'logs'),
      where('uid', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    const loadedLogs: Log[] = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        uid: data.uid,
        note: data.note ?? '',
        imageUrl: data.imageUrl ?? '',
        createdAt: data.createdAt,
        tags: (data.tags ?? []) as string[],
        category: data.category ?? '',
      }
    })
    setLogs(loadedLogs)
    filterLogs(searchTag, loadedLogs)
  }

  useEffect(() => {
    reloadLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser])

  const filterLogs = (keyword: string, sourceLogs?: Log[]) => {
    const baseLogs = sourceLogs ?? logs
    if (keyword.trim() === '') {
      setFilteredLogs(baseLogs)
      return
    }
    const filtered = baseLogs.filter(
      (log) =>
        log.tags.some((tag) => tag.includes(keyword.trim())) ||
        (log.category?.includes(keyword.trim()) ?? false)
    )
    setFilteredLogs(filtered)
  }

  const handleSearchTagChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearchTag(val)
    filterLogs(val)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setImagePreview('')
    }
  }

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!note.trim()) {
      alert('メモを入力してください')
      return
    }
    setLoading(true)
    try {
      let uploadedImageUrl = ''
      if (imageFile) {
        const storageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`)
        await uploadBytes(storageRef, imageFile)
        uploadedImageUrl = await getDownloadURL(storageRef)
      }

      await addDoc(collection(db, 'logs'), {
        uid: currentUser.uid,
        note,
        imageUrl: uploadedImageUrl,
        createdAt: serverTimestamp(),
        tags: newTags
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t !== ''),
        category: newCategory.trim(),
      })

      setNote('')
      setImageFile(null)
      setImagePreview('')
      setNewTags('')
      setNewCategory('')
      setShowNewModal(false)
      await reloadLogs()
    } catch (error) {
      console.error(error)
      alert('送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (log: Log) => {
    setEditingLog(log)
    setEditNote(log.note)
    setEditTags(log.tags.join(', '))
    setEditCategory(log.category ?? '')
    setEditImagePreview(log.imageUrl)
    setEditImageFile(null)
  }

  const handleEditFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setEditImageFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setEditImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      setEditImagePreview(editingLog?.imageUrl ?? '')
    }
  }

  const handleEditSave = async () => {
  if (!editingLog) return
  if (!editNote.trim()) {
    alert('メモは必須です')
    return
  }

  setLoading(true)

  try {
    let uploadedImageUrl = editingLog.imageUrl

    // 画像ファイルが新しく設定されている場合だけアップロード
    if (editImageFile) {
      try {
        const storageRef = ref(storage, `images/${Date.now()}_${editImageFile.name}`)
        await uploadBytes(storageRef, editImageFile)
        uploadedImageUrl = await getDownloadURL(storageRef)
      } catch (uploadError) {
        console.error('画像のアップロードまたは取得に失敗しました:', uploadError)
        alert('画像のアップロードまたは取得に失敗しました。CORS 設定などを確認してください。')
        return
      }
    }

    const docRef = doc(db, 'logs', editingLog.id)

    await updateDoc(docRef, {
      note: editNote,
      imageUrl: uploadedImageUrl,
      tags: editTags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t !== ''),
      category: editCategory.trim(),
    })

    await reloadLogs()
    setEditingLog(null)
  } catch (error) {
    console.error('保存エラー:', error)
    alert('更新に失敗しました。もう一度お試しください。')
  } finally {
    setLoading(false)
  }
}

    
  const cancelEdit = () => setEditingLog(null)

  const cancelNew = () => {
    setShowNewModal(false)
    setNote('')
    setImageFile(null)
    setImagePreview('')
    setNewTags('')
    setNewCategory('')
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <button
        type="button"
        onClick={() => setShowNewModal(true)}
        style={{
          marginBottom: 20,
          padding: '8px 12px',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        ＋ 新しい実験を追加（カテゴリ・タグなど）
      </button>

      {showNewModal && (
  <>
    <div
      onClick={cancelNew}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999,
      }}
    />
    <div
      onClick={(e) => e.stopPropagation()}
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
        maxWidth: 500,
        maxHeight: '80vh',     // ここを追加
        overflowY: 'auto',    // ここを追加
        boxSizing: 'border-box',
      }}
    >


            <h3>新しい実験を追加</h3>
            <form onSubmit={handleUpload}>
              <textarea
                placeholder="メモを入力"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                style={{ width: '100%', marginBottom: 12, padding: 8 }}
              />
              <input
                type="text"
                placeholder="タグ（カンマ区切り）"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                style={{ width: '100%', marginBottom: 12 }}
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ width: '100%', marginBottom: 12, padding: 8 }}
              >
                <option value="">カテゴリを選択</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ marginBottom: 12 }}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="プレビュー"
                  style={{ maxWidth: '100%', marginBottom: 12, borderRadius: 4 }}
                />
              )}
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: 4,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginRight: 8,
                }}
              >
                {loading ? '送信中...' : '送信'}
              </button>
              <button
                type="button"
                onClick={cancelNew}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: 4,
                  border: '1px solid #ccc',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                キャンセル
              </button>
            </form>
          </div>
        </>
      )}

      {/* 検索 */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="タグ・カテゴリで検索"
          value={searchTag}
          onChange={handleSearchTagChange}
          style={{ padding: 8, width: '60%' }}
        />
      </div>

      {/* ログ一覧 */}
      <h2>過去のログ一覧</h2>
      {filteredLogs.length === 0 ? (
        <p>該当するログはありません。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredLogs.map((log) => (
            <li key={log.id} style={{ padding: '8px 0' }}>
              <p><strong>カテゴリ:</strong> {log.category || '-'}</p>
              <p>{log.note}</p>
              {log.imageUrl && (
                <img
                  src={log.imageUrl}
                  alt="log"
                  style={{ maxWidth: '100%', borderRadius: 4 }}
                />
              )}
              <p>
                <strong>タグ:</strong> {log.tags.length > 0 ? log.tags.join(', ') : '-'}
              </p>
              <small>
                {log.createdAt?.toDate ? log.createdAt.toDate().toLocaleString() : ''}
              </small>
              <br />
              <button
                onClick={() => startEdit(log)}
                style={{
                  marginTop: 8,
                  padding: '6px 12px',
                  borderRadius: 4,
                  border: '1px solid #1976d2',
                  backgroundColor: 'white',
                  color: '#1976d2',
                  cursor: 'pointer',
                }}
              >
                編集
              </button>
              <hr style={{ marginTop: 16, borderColor: '#ddd' }} />
            </li>
          ))}
        </ul>
      )}

      {/* 編集モーダル */}
      {editingLog && (
        <>
          <div
            onClick={cancelEdit}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
            }}
          />
          <div
  onClick={(e) => e.stopPropagation()}
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
    maxWidth: 500,
    maxHeight: '80vh', // モーダルの高さ上限
    overflowY: 'auto', // モーダル内スクロール
    boxSizing: 'border-box',
  }}
>

            <h3>投稿を編集</h3>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              rows={4}
              style={{ width: '100%', marginBottom: 12, padding: 8 }}
            />
            <input
              type="text"
              placeholder="タグ（カンマ区切り）"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              style={{ width: '100%', marginBottom: 12 }}
            />
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              style={{ width: '100%', marginBottom: 12, padding: 8 }}
            >
              <option value="">カテゴリを選択</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={handleEditFileChange}
              style={{ marginBottom: 12 }}
            />
            {editImagePreview && (
              <img
                src={editImagePreview}
                alt="編集プレビュー"
                style={{ maxWidth: '100%', marginBottom: 12, borderRadius: 4 }}
              />
            )}
            <button
              onClick={handleEditSave}
              disabled={loading}
              style={{
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: 4,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginRight: 8,
              }}
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              onClick={cancelEdit}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: 4,
                border: '1px solid #ccc',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              キャンセル
            </button>
          </div>
        </>
      )}
    </div>
  )
}
