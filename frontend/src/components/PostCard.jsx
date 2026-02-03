import { useState } from 'react'import { useState } from 'react'






















































}  )    </div>      </div>        <span className="reaction-count">{reactionCount}</span>        </button>          👍 Like        <button onClick={() => handleReaction('like')} disabled={hasReacted}>      <div className="post-actions">      )}        </div>          ))}            </div>              )}                </video>                  <source src={item.file} />                <video controls>              ) : (                <img src={item.file} alt="Post media" />              {item.media_type === 'image' ? (            <div key={item.id} className="media-item">          {post.media.map((item) => (        <div className="post-media">      {post.media && post.media.length > 0 && (      <p className="post-content">{post.content}</p>      </div>        </span>          {new Date(post.created_at).toLocaleDateString()}        <span className="post-date">        <strong>{post.author_username}</strong>      <div className="post-header">    <div className="post-card">  return (  }    }      console.error('Failed to add reaction')    } catch (err) {      setHasReacted(true)      setReactionCount(reactionCount + 1)      await reactionsAPI.create(post.id, reactionType)    try {  const handleReaction = async (reactionType) => {  const [hasReacted, setHasReacted] = useState(false)  const [reactionCount, setReactionCount] = useState(post.reactions?.length || 0)export default function PostCard({ post, onPostDeleted }) {import '../styles/PostCard.css'import { reactionsAPI, postsAPI } from '../services/api'import { postsAPI } from '../services/api'
import '../styles/PostForm.css'

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState('')
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('content', content)
      
      media.forEach((file) => {
        formData.append('media', file)
      })

      await postsAPI.create(formData)
      setContent('')
      setMedia([])
      if (onPostCreated) onPostCreated()
    } catch (err) {
      setError('Failed to create post')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMediaChange = (e) => {
    setMedia([...media, ...Array.from(e.target.files)])
  }

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows="4"
      />
      
      <div className="form-actions">
        <input
          type="file"
          multiple
          onChange={handleMediaChange}
          accept="image/*,video/*"
          className="file-input"
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading || !content.trim()}>
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>

      {media.length > 0 && (
        <div className="media-preview">
          <p>{media.length} file(s) selected</p>
        </div>
      )}
    </form>
  )
}
