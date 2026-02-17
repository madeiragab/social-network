/*
Implement feed view:

- Fetch posts from backend
- Display posts in chronological order
- Each post shows:
  - author
  - text content
  - clickable hyperlinks inside text
  - list of media (images and/or videos)
  - reactions count

Do NOT:
- calculate feed logic
- sort locally beyond simple ordering
*/

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { postsAPI } from '../services/api'
import PostCard from './PostCard'

export default function Feed({ refreshTrigger }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [refreshTrigger])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await postsAPI.list()
      
      // Check if response is an error object
      if (response?.detail) {
        setError(response.detail)
        setPosts([])
        return
      }
      
      setPosts(response.data?.results || response.data || [])
    } catch (err) {
      console.error('Failed to load posts:', err)
      setError('Failed to load posts. Please try again.')
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">No posts yet. Be the first to post!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onPostUpdated={() => fetchPosts()} />
        ))
      )}
    </div>
  )
}
