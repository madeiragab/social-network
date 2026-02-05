/*
Post creation flow:

- User can write text
- User can attach:
  - multiple images
  - multiple videos
  - images and videos together

- Media is handled as a list
- Allow adding and removing media before submission
- Submit post as a single request
*/
import { useState } from 'react'
import { postsAPI } from '../services/api'
import '../styles/PostCreation.css'

export default function PostCreation({ onPostCreated }) {
  const [content, setContent] = useState('')
  const [mediaList, setMediaList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddMedia = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setMediaList(prev => [...prev, {
          file,
          preview: event.target.result,
          type: file.type.startsWith('video') ? 'video' : 'image'
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveMedia = (index) => {
    setMediaList(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('content', content)
      
      mediaList.forEach(({ file }) => {
        formData.append('media', file)
      })

      await postsAPI.create(formData)
      setContent('')
      setMediaList([])
      if (onPostCreated) onPostCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="post-creation">
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="3"
      />
      
      <div className="media-container">
        {mediaList.map((item, index) => (
          <div key={index} className="media-preview">
            {item.type === 'image' ? (
              <img src={item.preview} alt="preview" />
            ) : (
              <video src={item.preview} controls />
            )}
            <button
              type="button"
              onClick={() => handleRemoveMedia(index)}
              className="btn-remove"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <label className="file-input-label" title="Formatos suportados: JPEG, PNG, GIF, WebP, MP4, WebM">
          Add Media
          <input
            type="file"
            multiple
            onChange={handleAddMedia}
            accept="image/*,video/*"
            style={{ display: 'none' }}
          />
        </label>
        
        {error && <p className="error">{error}</p>}
        
        <button type="submit" disabled={loading || !content.trim()} className="btn-primary">
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}