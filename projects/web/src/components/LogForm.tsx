import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
} from 'react'

type Log = {
  id: string
  uid: string
  note: string
  imageBase64: string
  createdAt: number
  tags: string[]
  category?: string
}

type LogFormProps = {
  currentUser: { uid: string }
}

const CATEGORY_OPTIONS = ['菌株', '培地', 'PCR', '観察', 'その他']

export default function LogForm({ currentUser }: LogFormProps) {
  const [logs, setLogs] = useState<Log[]>([])
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([])
  const [searchTag, setSearchTag] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const [note, setNote] = useState('')
  const [imageBase64, setImageBase64] = useState<string>('')
  const [newCategory, setNewCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInputValue, setTagInputValue] = useState('')

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('logs')
    if (saved) {
      const parsed: Log[] = JSON.parse(saved)
      setLogs(parsed)
      setFilteredLogs(parsed)
    }
  }, [])

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
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImageBase64(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInputValue.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInputValue.trim())) {
        setTags([...tags, tagInputValue.trim()])
      }
      setTagInputValue('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    if (!note.trim()) {
      alert('メモを入力してください')
      return
    }
    setLoading(true)

    try {
      if (editId) {
        const updatedLogs = logs.map((log) =>
          log.id === editId
            ? {
                ...log,
                note,
                imageBase64: imageBase64 || log.imageBase64,
                tags,
                category: newCategory.trim(),
              }
            : log
        )
        setLogs(updatedLogs)
        filterLogs(searchTag, updatedLogs)
        localStorage.setItem('logs', JSON.stringify(updatedLogs))
      } else {
        const newLog: Log = {
          id: Date.now().toString(),
          uid: currentUser.uid,
          note,
          imageBase64,
          createdAt: Date.now(),
          tags,
          category: newCategory.trim(),
        }
        const newLogs = [newLog, ...logs]
        setLogs(newLogs)
        filterLogs(searchTag, newLogs)
        localStorage.setItem('logs', JSON.stringify(newLogs))
      }
    } finally {
      setLoading(false)
      setNote('')
      setImageBase64('')
      setTags([])
      setTagInputValue('')
      setNewCategory('')
      setEditId(null)
      setShowModal(false)
    }
  }

  const startEdit = (log: Log) => {
    setEditId(log.id)
    setNote(log.note)
    setImageBase64(log.imageBase64)
    setTags(log.tags)
    setTagInputValue('')
    setNewCategory(log.category ?? '')
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('本当に削除しますか？')) return
    const newLogs = logs.filter((log) => log.id !== id)
    setLogs(newLogs)
    filterLogs(searchTag, newLogs)
    localStorage.setItem('logs', JSON.stringify(newLogs))
  }

  const openNewModal = () => {
    setEditId(null)
    setNote('')
    setImageBase64('')
    setTags([])
    setTagInputValue('')
    setNewCategory('')
    setShowModal(true)
  }

  const cancelModal = () => {
    setShowModal(false)
    setEditId(null)
    setNote('')
    setImageBase64('')
    setTags([])
    setTagInputValue('')
    setNewCategory('')
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <button
        onClick={openNewModal}
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

      {showModal && (
        <>
          <div
            onClick={cancelModal}
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
              maxHeight: '80vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          >
            <h3>{editId ? '実験を編集' : '新しい実験を追加'}</h3>
            <form onSubmit={handleSave}>
              <textarea
                placeholder="メモを入力"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                style={{ width: '100%', marginBottom: 12, padding: 8 }}
              />
              <div style={{ marginBottom: 12 }}>
                <input
                  type="text"
                  placeholder="タグを入力してEnter"
                  value={tagInputValue}
                  onChange={(e) => setTagInputValue(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  style={{ width: '100%', padding: 8 }}
                />
                <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap' }}>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        backgroundColor: '#e0e0e0',
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
                        type="button"
                        onClick={() => removeTag(tag)}
                        style={{
                          marginLeft: 6,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
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
              {imageBase64 && (
                <img
                  src={imageBase64}
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
                {loading ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={cancelModal}
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

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="タグ・カテゴリで検索"
          value={searchTag}
          onChange={handleSearchTagChange}
          style={{ padding: 8, width: '60%' }}
        />
      </div>

      <h2>過去のログ一覧</h2>
      {filteredLogs.length === 0 ? (
        <p>該当するログはありません。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {filteredLogs.map((log) => (
            <li key={log.id} style={{ padding: '8px 0' }}>
              <p>
                <strong>カテゴリ:</strong> {log.category || '-'}
              </p>
              <p>{log.note}</p>
              {log.imageBase64 && (
                <img
                  src={log.imageBase64}
                  alt="log"
                  style={{ maxWidth: '100%', borderRadius: 4 }}
                />
              )}
              <p>
                <strong>タグ:</strong>{' '}
                {log.tags.length > 0 ? log.tags.join(', ') : '-'}
              </p>
              <small>{new Date(log.createdAt).toLocaleString()}</small>
              <br />
              <button
                onClick={() => startEdit(log)}
                style={{
                  marginRight: 8,
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(log.id)}
                style={{
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: 'none',
                  backgroundColor: '#d32f2f',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                削除
              </button>
              <hr style={{ marginTop: 16, borderColor: '#ddd' }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}