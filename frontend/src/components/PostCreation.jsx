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
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { postsAPI } from '../services/api'
import { cn } from '../lib/utils'
import Toast from './Toast'
import Tooltip from './Tooltip'

export default function PostCreation({ onPostCreated }) {
  const [content, setContent] = useState('')
  const [mediaList, setMediaList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

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
    if (!content.trim()) {
      setToast({ message: 'Please write something before posting', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('content', content)
      
      mediaList.forEach(({ file }) => {
        formData.append('media', file)
      })

      const response = await postsAPI.create(formData)
      
      // Check if response is an error object instead of expected response
      if (response.content) {
        setToast({ message: response.content[0] || 'Failed to create post', type: 'error' })
        return
      }
      
      setContent('')
      setMediaList([])
      setToast({ message: 'Post created successfully', type: 'success' })
      if (onPostCreated) onPostCreated()
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.content?.[0] || 'Failed to create post'
      setToast({ message: errorMsg, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4">
      <div className="p-4 sm:p-5">
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
          className="w-full resize-none border-0 focus:ring-0 focus:outline-none text-gray-800 placeholder-gray-400 text-sm sm:text-base"
        />
      </div>
      
      {mediaList.length > 0 && (
        <div className="px-4 sm:px-5 pb-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {mediaList.map((item, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                {item.type === 'image' ? (
                <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <video src={item.preview} className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => handleRemoveMedia(index)}
                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-gray-100">
        <Tooltip content="JPEG, PNG, GIF, WebP, MP4, WebM" position="bottom">
          <label 
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors text-sm"
          >
            <ImagePlus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Media</span>
            <input
              type="file"
              multiple
              onChange={handleAddMedia}
              accept="image/*,video/*"
              className="hidden"
            />
          </label>
        </Tooltip>
        
        <div className="flex items-center gap-3">
          {error && <p className="text-red-500 text-xs">{error}</p>}
          
          <button 
            type="submit" 
            disabled={loading || !content.trim()} 
            className={cn(
              "px-4 py-2 rounded-full text-sm font-semibold transition-all",
              content.trim() 
                ? "bg-primary hover:bg-primary-dark text-white" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Post'
            )}
          </button>
        </div>
      </div>
    </form>
    </>
  )
}