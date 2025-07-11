import React, { useState, ChangeEvent, KeyboardEvent } from 'react'
import { db, storage } from '../firebase' // 環境に合わせて調整
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ref, uploadString, getDownloadURL } from 'firebase/storage'

type ExperimentFormProps = {
  onComplete: () => void
}

const CATEGORY_OPTIONS = ['培養', 'PCR', '観察', '測定', '分析']

export default function ExperimentForm({ onComplete }: ExperimentFormProps) {
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [note, setNote] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // タグ入力エンターで追加
  const handleAddTag = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  // 画像選択時のプレビュー作成
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result) setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 送信処理
  const handleSubmit = async () => {
    if (!category) {
      alert('カテゴリを選択してください')
      return
    }
    setLoading(true)
    try {
      let imageUrl = ''
      if (imagePreview) {
        const imageRef = ref(storage, `images/${Date.now()}.jpg`)
        await uploadString(imageRef, imagePreview, 'data_url')
        imageUrl = await getDownloadURL(imageRef)
      }
      await addDoc(collection(db, 'experiments'), {
        category,
        tags,
        note,
        imageUrl,
        createdAt: serverTimestamp(),
      })
      // 保存後リセット
      setCategory('')
      setTags([])
      setNote('')
      setImageFile(null)
      setImagePreview('')
      onComplete()
    } catch (error) {
      console.error(error)
      alert('保存に失敗しました')
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <h2>新しい実験を記録</h2>

      {/* カテゴリ */}
      <label>カテゴリ:</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ width: '100%', marginBottom: 12, padding: 6 }}
        disabled={loading}
      >
        <option value="">選択してください</option>
        {CATEGORY_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* タグ */}
      <label>タグ:</label>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          border: '1px solid #ccc',
          padding: 8,
          borderRadius: 4,
          marginBottom: 12,
        }}
      >
        {tags.map((tag, index) => (
          <div
            key={index}
            style={{
              backgroundColor: '#eee',
              padding: '4px 8px',
              borderRadius: 12,
              marginRight: 6,
              marginBottom: 6,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {tag}
            <button
              onClick={() => removeTag(index)}
              style={{
                marginLeft: 6,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
              disabled={loading}
            >
              ×
            </button>
          </div>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Enterで追加"
          style={{
            flex: 1,
            minWidth: '100px',
            border: 'none',
            outline: 'none',
          }}
          disabled={loading}
        />
      </div>

      {/* メモ */}
      <label>メモ:</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
        placeholder="実験内容や結果などを記録"
        disabled={loading}
      />

      {/* 画像アップロード */}
      <label>画像:</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={loading}
        style={{ marginBottom: 8 }}
      />
      {imagePreview && (
        <img
          src={imagePreview}
          alt="プレビュー"
          style={{ width: '100%', borderRadius: 4, marginBottom: 12 }}
        />
      )}

      {/* 送信ボタン */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '8px 16px',
          border: 'none',
          borderRadius: 4,
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
        }}
      >
        {loading ? '保存中...' : '保存'}
      </button>
    </div>
  )
}
