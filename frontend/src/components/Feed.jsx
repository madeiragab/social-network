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
import { postsAPI } from '../services/api'
import PostCard from './PostCard'
import '../styles/Feed.css'

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
      const response = await postsAPI.list()
      setPosts(response.data.results || response.data)
    } catch (err) {
      setError('Failed to load posts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="feed"><p>Loading posts...</p></div>
  if (error) return <div className="feed"><p className="error">{error}</p></div>

  return (
    <div className="feed">
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to post!</p>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onPostDeleted={() => fetchPosts()} />
        ))
      )}
    </div>
  )
}
