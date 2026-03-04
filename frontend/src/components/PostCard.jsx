import { useState, useRef, useEffect } from 'react'
import { Heart, MoreHorizontal, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { reactionsAPI, postsAPI } from '../services/api'
import { cn } from '../lib/utils'
import ImageViewer from './ImageViewer'
import Toast from './Toast'

const URL_REGEX = /(https?:\/\/[^\s]+)/g

function linkifyText(text) {
  return text.split(URL_REGEX).map((part, index) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={`link-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-dark underline break-all"
          onClick={(event) => event.stopPropagation()}
        >
          {part}
        </a>
      )
    }

    return <span key={`text-${index}`}>{part}</span>
  })
}

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
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [comments, setComments] = useState([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentCount, setCommentCount] = useState(post.comment_count || 0)
  const [latestComment, setLatestComment] = useState(post.latest_comment || null)
  const [newComment, setNewComment] = useState('')
  const touchStartXRef = useRef(null)
  const menuRef = useRef(null)

  const MAX_LENGTH = 160
  const shouldTruncate = post.content.length > MAX_LENGTH
  const displayContent = isExpanded ? post.content : post.content.substring(0, MAX_LENGTH)

  useEffect(() => {
    setReactionCount(post.reaction_count || 0)
    setHasReacted(post.has_reacted || false)
    setCommentCount(post.comment_count || 0)
    setLatestComment(post.latest_comment || null)
  }, [post])

  useEffect(() => {
    if (!isExpanded || isEditing) {
      return
    }

    const fetchComments = async () => {
      setIsLoadingComments(true)
      try {
        const response = await postsAPI.listComments(post.id)
        if (response?.detail) {
          setToast({ message: response.detail, type: 'error' })
          return
        }
        setComments(response.data || [])
      } catch (err) {
        const errorMsg = err?.detail || 'Failed to load comments'
        setToast({ message: errorMsg, type: 'error' })
      } finally {
        setIsLoadingComments(false)
      }
    }

    fetchComments()
  }, [isExpanded, isEditing, post.id])

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

  useEffect(() => {
    if (currentMediaIndex > visibleMedia.length - 1) {
      setCurrentMediaIndex(0)
    }
  }, [visibleMedia.length, currentMediaIndex])

  const handleToggleExpand = () => {
    if (!isEditing) {
      setIsExpanded(prev => !prev)
    }
  }

  const goToPreviousMedia = () => {
    setCurrentMediaIndex((prev) => (prev === 0 ? visibleMedia.length - 1 : prev - 1))
  }

  const goToNextMedia = () => {
    setCurrentMediaIndex((prev) => (prev === visibleMedia.length - 1 ? 0 : prev + 1))
  }

  const handleMediaTouchStart = (event) => {
    if (visibleMedia.length <= 1) {
      return
    }
    touchStartXRef.current = event.touches[0].clientX
  }

  const handleMediaTouchEnd = (event) => {
    if (visibleMedia.length <= 1 || touchStartXRef.current === null) {
      return
    }

    const touchEndX = event.changedTouches[0].clientX
    const swipeDelta = touchEndX - touchStartXRef.current
    const swipeThreshold = 40

    if (swipeDelta > swipeThreshold) {
      goToPreviousMedia()
    } else if (swipeDelta < -swipeThreshold) {
      goToNextMedia()
    }

    touchStartXRef.current = null
  }

  const handleAddComment = () => {
    const submitComment = async () => {
      const trimmedComment = newComment.trim()
      if (!trimmedComment) {
        return
      }

      try {
        const response = await postsAPI.createComment(post.id, trimmedComment)
        if (response?.detail || response?.content) {
          setToast({ message: response?.detail || response?.content?.[0] || 'Failed to add comment', type: 'error' })
          return
        }

        const createdComment = response.data
        setComments(prev => [createdComment, ...prev])
        setLatestComment(createdComment)
        setCommentCount(prev => prev + 1)
        setNewComment('')
        if (onPostUpdated) onPostUpdated()
      } catch (err) {
        const errorMsg = err?.detail || err?.content?.[0] || 'Failed to add comment'
        setToast({ message: errorMsg, type: 'error' })
      }
    }

    submitComment()
  }

  const renderCommentItem = (comment) => (
    <div key={comment.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
      <p className="text-xs text-gray-500 mb-1">{comment.author_username || 'User'}</p>
      <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
      <p className="text-xs text-gray-500 mt-1">
        {new Date(comment.created_at).toLocaleString()}
      </p>
    </div>
  )

  return (
    <>
      <article
        className={cn(
          'bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all',
          !isExpanded && 'max-h-[460px]'
        )}
      >
        <div className="p-4 sm:p-5" onClick={handleToggleExpand}>
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
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(!showMenu)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowMenu(false)
                        setIsEditing(true)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
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
                onClick={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm resize-none"
              />
            ) : (
              <>
                <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-justify">
                  {linkifyText(displayContent)}
                  {shouldTruncate && !isExpanded && '...'}
                </p>
                {(shouldTruncate || !isExpanded) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }}
                    className="text-primary hover:text-primary-dark text-sm font-medium mt-1 transition-colors"
                  >
                    {isExpanded ? 'Show less' : 'Expand post'}
                  </button>
                )}
              </>
            )}
          </div>

          {visibleMedia.length > 0 && (
            <div className="mb-3">
              <div
                className="relative w-full rounded-lg overflow-hidden bg-gray-100"
                style={{ paddingBottom: '100%' }}
                onTouchStart={handleMediaTouchStart}
                onTouchEnd={handleMediaTouchEnd}
              >
                {visibleMedia[currentMediaIndex]?.media_type === 'image' ? (
                  <img
                    src={visibleMedia[currentMediaIndex].file}
                    alt=""
                    className="absolute inset-0 w-full h-full object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ top: 0, left: 0 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isEditing) {
                        setViewerImage(visibleMedia[currentMediaIndex].file)
                      }
                    }}
                  />
                ) : (
                  <video controls className="absolute inset-0 w-full h-full object-contain" style={{ top: 0, left: 0 }} onClick={(e) => e.stopPropagation()}>
                    <source src={visibleMedia[currentMediaIndex].file} />
                  </video>
                )}

                {visibleMedia.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        goToPreviousMedia()
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        goToNextMedia()
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleMediaRemoval(visibleMedia[currentMediaIndex].id)
                    }}
                    className={cn(
                      "absolute top-2 right-2 p-1.5 rounded-full transition-colors",
                      editMediaToRemove.includes(visibleMedia[currentMediaIndex].id)
                        ? "bg-primary text-white"
                        : "bg-black/50 text-white hover:bg-red-500"
                    )}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {visibleMedia.length > 1 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {currentMediaIndex + 1} / {visibleMedia.length}
                </p>
              )}
            </div>
          )}

          {isEditing ? (
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCancelEdit()
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSaveEdit()
                }}
                className="px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleReaction('like')
                }}
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
              <span className="text-sm text-gray-500">{commentCount} comentários</span>
            </div>
          )}

          {!isExpanded && latestComment && !isEditing && (
            <div className="mt-3 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs text-gray-500 mb-2">Último comentário</p>
              {renderCommentItem(latestComment)}
            </div>
          )}

          {isExpanded && !isEditing && (
            <div className="mt-4 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Comentários</h4>
              <div className="flex items-start gap-2 mb-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="2"
                  placeholder="Escreva um comentário..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm resize-none"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
                >
                  Comentar
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {isLoadingComments ? (
                  <p className="text-sm text-gray-500">Carregando comentários...</p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum comentário ainda.</p>
                ) : (
                  comments.map((comment) => renderCommentItem(comment))
                )}
              </div>
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
