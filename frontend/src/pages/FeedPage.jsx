import { useState } from 'react'
import Header from '../components/Header'
import Feed from '../components/Feed'
import PostCreation from '../components/PostCreation'

export default function FeedPage({ onLogout }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={onLogout} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <PostCreation onPostCreated={handlePostCreated} />
        <Feed refreshTrigger={refreshTrigger} />
      </main>
    </div>
  )
}
