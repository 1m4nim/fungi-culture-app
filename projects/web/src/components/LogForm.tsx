import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase' // Firebase初期化済みのdb, storageをimport
import ExperimentForm from './ExperimentForm' // ExperimentFormのパスに合わせて調整してください

type Log = {
  id: string
  note: string
  imageUrl: string
  createdAt: any
}

export default function LogForm() {
  const [logs, setLogs] = useState<Log[]>([])
  const [note, setNote] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [showExperimentForm, setShowExperimentForm] = useState(false)

  // Firestoreからログ一覧取得
  const reloadLogs = async () => {
    const q = query(collection(db, 'logs'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    const loadedLogs: Log[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Log[]
    setLogs(loadedLogs)
  }

  useEffect(() => {
    reloadLogs()
  }, [])

  // ファイル選択時の処理
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview('')
    }
  }

  // フォーム送信処理
  const handleUpload = async (e: FormEvent) => {
    e.preventDefault()
    if (!note) {
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
        note,
        imageUrl: uploadedImageUrl,
        createdAt: serverTimestamp(),
      })

      // フォーム初期化
      setNote('')
      setImageFile(null)
      setImagePreview('')

      // 再読み込み
      reloadLogs()
    } catch (error) {
      console.error(error)
      alert('送信中にエラーが発生しました')
    }

    setLoading(false)
  }

  // ExperimentFormで新規作成完了した時の処理
  const handleExperimentComplete = async () => {
    setShowExperimentForm(false)
    await reloadLogs()
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      {/* + 実験追加ボタン */}
      <button
        type="button"
        onClick={() => setShowExperimentForm(true)}
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

      {/* モーダル表示 */}
      {showExperimentForm && (
        <>
          {/* 背景の半透明オーバーレイ */}
          <div
            onClick={() => setShowExperimentForm(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
            }}
          />
          {/* モーダル本体 */}
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
            }}
          >
            <ExperimentForm onComplete={handleExperimentComplete} />
            <button
              onClick={() => setShowExperimentForm(false)}
              style={{
                marginTop: 10,
                padding: '6px 12px',
                borderRadius: 4,
                border: '1px solid #ccc',
                backgroundColor: '#f0f0f0',
                cursor: 'pointer',
              }}
            >
              閉じる
            </button>
          </div>
        </>
      )}

      {/* 既存のログ登録フォーム */}
      <form onSubmit={handleUpload} style={{ marginBottom: 40 }}>
        <textarea
          placeholder="メモを入力"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          style={{ width: '100%', marginBottom: 12, padding: 8 }}
          disabled={loading}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
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
            cursor: 'pointer',
          }}
        >
          {loading ? '送信中...' : '送信'}
        </button>
      </form>

      {/* 過去のログ一覧 */}
      <h2>過去のログ一覧</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {logs.map((log) => (
          <li
            key={log.id}
            style={{
              borderBottom: '1px solid #ddd',
              padding: '8px 0',
            }}
          >
            <p>{log.note}</p>
            {log.imageUrl && (
              <img
                src={log.imageUrl}
                alt="log image"
                style={{ maxWidth: '100%', borderRadius: 4 }}
              />
            )}
            <small>
              {log.createdAt?.toDate
                ? log.createdAt.toDate().toLocaleString()
                : ''}
            </small>
          </li>
        ))}
      </ul>
    </div>
  )
}
