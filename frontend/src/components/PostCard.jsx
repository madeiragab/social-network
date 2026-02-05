import { useState } from 'react'
import { Heart } from 'lucide-react'
import { reactionsAPI } from '../services/api'
import { cn } from '../lib/utils'

export default function PostCard({ post, onPostDeleted }) {
  const [reactionCount, setReactionCount] = useState(post.reaction_count || 0)
  const [hasReacted, setHasReacted] = useState(post.has_reacted || false)
  const [isExpanded, setIsExpanded] = useState(false)

  const MAX_LENGTH = 200
  const shouldTruncate = post.content.length > MAX_LENGTH
  const displayContent = isExpanded ? post.content : post.content.substring(0, MAX_LENGTH)

  const handleReaction = async (reactionType) => {
    if (hasReacted) {
      setReactionCount(prev => prev - 1)
      setHasReacted(false)
      try {
        const userReaction = post.user_reaction_id
        if (userReaction) {
          await reactionsAPI.delete(userReaction)
        }
      } catch (err) {
        setReactionCount(prev => prev + 1)
        setHasReacted(true)
        console.error('Failed to remove reaction')
      }
    } else {
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
  }

  return (
    <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold text-sm">
              {post.author_username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{post.author_username}</p>
              <p className="text-xs text-gray-500">
                {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-3">
          <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-justify">
            {displayContent}
            {shouldTruncate && !isExpanded && '...'}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:text-primary-dark text-sm font-medium mt-1 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 && (
          <div className={cn(
            "grid gap-2 mb-3",
            post.media.length === 1 && "grid-cols-1",
            post.media.length === 2 && "grid-cols-2",
            post.media.length >= 3 && "grid-cols-2 sm:grid-cols-3"
          )}>
            {post.media.map((item) => (
              <div key={item.id} className="rounded-lg overflow-hidden bg-gray-100">
                {item.media_type === 'image' ? (
                  <img 
                    src={item.file} 
                    alt="Post media" 
                    className="w-full h-48 sm:h-56 object-cover"
                  />
                ) : (
                  <video controls className="w-full h-48 sm:h-56 object-cover">
                    <source src={item.file} />
                  </video>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleReaction('like')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
              hasReacted 
                ? "bg-red-50 text-red-500 hover:bg-red-100" 
                : "hover:bg-gray-100 text-gray-600"
            )}
          >
            <Heart className={cn("w-4 h-4", hasReacted && "fill-current")} />
            <span>{reactionCount}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
