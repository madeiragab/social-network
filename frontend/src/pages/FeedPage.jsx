import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Feed from '../components/Feed'
import PostCreation from '../components/PostCreation'
import '../styles/FeedPage.css'

export default function FeedPage({ onLogout }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handlePostCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="feed-page">
      <Header onLogout={onLogout} />
      <main className="feed-main">
        <PostCreation onPostCreated={handlePostCreated} />
        <Feed refreshTrigger={refreshTrigger} />
      </main>
    </div>
  )
}
