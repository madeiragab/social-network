import { useState } from 'react'
import '../styles/PostCard.css'
import { reactionsAPI } from '../services/api'

export default function PostCard({ post, onPostDeleted }) {
  const [reactionCount, setReactionCount] = useState(post.reaction_count || 0)
  const [hasReacted, setHasReacted] = useState(post.has_reacted || false)
  const [isExpanded, setIsExpanded] = useState(false)

  const MAX_LENGTH = 200
  const shouldTruncate = post.content.length > MAX_LENGTH
  const displayContent = isExpanded ? post.content : post.content.substring(0, MAX_LENGTH)

  const handleReaction = async (reactionType) => {
    setReactionCount(prev => prev + 1)
    setHasReacted(true)
    try {
      await reactionsAPI.create(post.id, reactionType)
    } catch (err) {
      setReactionCount(prev => prev - 1)
      setHasReacted(false)
      console.error('Failed to add reaction')
    }
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <strong>{post.author_username}</strong>
        <span className="post-date">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="post-content">{displayContent}
        {shouldTruncate && !isExpanded && '...'}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn-read-more"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
      {post.media && post.media.length > 0 && (
        <div className="post-media">
          {post.media.map((item) => (
            <div key={item.id} className="media-item">
              {item.media_type === 'image' ? (
                <img src={item.file} alt="Post media" />
              ) : (
                <video controls>
                  <source src={item.file} />
                </video>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="post-actions">
        <button onClick={() => handleReaction('like')} disabled={hasReacted}>
          👍 Like
        </button>
        <span className="reaction-count">{reactionCount}</span>
      </div>
    </div>
  )
}
