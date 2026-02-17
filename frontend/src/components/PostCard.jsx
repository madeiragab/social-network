import { useState, useRef, useEffect } from 'react'
import { Heart, MoreHorizontal, Pencil, Trash2, X } from 'lucide-react'
import { reactionsAPI, postsAPI } from '../services/api'
import { cn } from '../lib/utils'
import ImageViewer from './ImageViewer'
import Toast from './Toast'

export default function PostCard({ post, onPostUpdated }) {
  const [reactionCount, setReactionCount] = useState(post.reaction_count || 0)
  const [hasReacted, setHasReacted] = useState(post.has_reacted || false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [editMediaToRemove, setEditMediaToRemove] = useState([])
  const [viewerImage, setViewerImage] = useState(null)
  const [toast, setToast] = useState(null)
  const menuRef = useRef(null)

  const MAX_LENGTH = 200
  const shouldTruncate = post.content.length > MAX_LENGTH
  const displayContent = isExpanded ? post.content : post.content.substring(0, MAX_LENGTH)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
        setToast({ message: 'Failed to remove reaction', type: 'error' })
      }
    } else {
      setReactionCount(prev => prev + 1)
      setHasReacted(true)
      try {
        await reactionsAPI.create(post.id, reactionType)
      } catch (err) {
        setReactionCount(prev => prev - 1)
        setHasReacted(false)
        const errorMsg = err?.detail || 'Failed to add reaction'
        setToast({ message: errorMsg, type: 'error' })
      }
    }
  }

  const handleDelete = async () => {
    try {
      const response = await postsAPI.delete(post.id)
      
      // Check if it's an error response
      if (response?.detail) {
        setToast({ message: response.detail, type: 'error' })
        setShowDeleteDialog(false)
        return
      }
      
      setToast({ message: 'Post deleted successfully', type: 'success' })
      setTimeout(() => {
        if (onPostUpdated) onPostUpdated()
      }, 500)
    } catch (err) {
      const errorMsg = err?.detail || 'Failed to delete post'
      setToast({ message: errorMsg, type: 'error' })
    }
    setShowDeleteDialog(false)
  }

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      setToast({ message: 'Post content cannot be empty', type: 'error' })
      return
    }
    
    try {
      const formData = new FormData()
      formData.append('content', editContent)
      formData.append('remove_media', JSON.stringify(editMediaToRemove))
      const response = await postsAPI.update(post.id, formData)
      
      // Check if it's an error response
      if (response?.content) {
        setToast({ message: response.content[0] || 'Failed to update post', type: 'error' })
        return
      }
      
      setIsEditing(false)
      setEditMediaToRemove([])
      setToast({ message: 'Post updated successfully', type: 'success' })
      if (onPostUpdated) onPostUpdated()
    } catch (err) {
      const errorMsg = err?.content?.[0] || err?.detail || 'Failed to update post'
      setToast({ message: errorMsg, type: 'error' })
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(post.content)
    setEditMediaToRemove([])
  }

  const toggleMediaRemoval = (mediaId) => {
    setEditMediaToRemove(prev => 
      prev.includes(mediaId) 
        ? prev.filter(id => id !== mediaId)
        : [...prev, mediaId]
    )
  }

  const visibleMedia = post.media?.filter(m => !editMediaToRemove.includes(m.id)) || []

  return (
    <>
      <article className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {post.author_avatar ? (
                <img src={post.author_avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold text-sm">
                  {post.author_username?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-sm">{post.author_username}</p>
                <p className="text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {post.is_owner && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-10">
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        setIsEditing(true)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        setShowDeleteDialog(true)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-3">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm resize-none"
              />
            ) : (
              <>
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
              </>
            )}
          </div>

          {post.media && post.media.length > 0 && (
            <div className={cn(
              "grid gap-2 mb-3",
              post.media.length === 1 && "grid-cols-1",
              post.media.length === 2 && "grid-cols-2",
              post.media.length >= 3 && "grid-cols-2 sm:grid-cols-3"
            )}>
              {post.media.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "relative rounded-lg overflow-hidden bg-gray-100",
                    isEditing && editMediaToRemove.includes(item.id) && "opacity-40"
                  )}
                >
                  {item.media_type === 'image' ? (
                    <img 
                      src={item.file} 
                      alt="" 
                      className="w-full h-48 sm:h-56 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => !isEditing && setViewerImage(item.file)}
                    />
                  ) : (
                    <video controls className="w-full h-48 sm:h-56 object-cover">
                      <source src={item.file} />
                    </video>
                  )}
                  {isEditing && (
                    <button
                      onClick={() => toggleMediaRemoval(item.id)}
                      className={cn(
                        "absolute top-2 right-2 p-1.5 rounded-full transition-colors",
                        editMediaToRemove.includes(item.id)
                          ? "bg-primary text-white"
                          : "bg-black/50 text-white hover:bg-red-500"
                      )}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {isEditing ? (
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          ) : (
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
          )}
        </div>
      </article>

      {viewerImage && (
        <ImageViewer src={viewerImage} alt="Post image" onClose={() => setViewerImage(null)} />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {showDeleteDialog && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteDialog(false)}
        >
          <div 
            className="relative bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Post</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
