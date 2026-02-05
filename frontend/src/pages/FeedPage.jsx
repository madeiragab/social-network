import { useState, useEffect } from 'react'
import Feed from '../components/Feed'
import PostCreation from '../components/PostCreation'

export default function FeedPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    document.title = 'Feed - Social Network'
  }, [])

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <PostCreation onPostCreated={handlePostCreated} />
      <Feed refreshTrigger={refreshTrigger} />
    </main>
  )
}
