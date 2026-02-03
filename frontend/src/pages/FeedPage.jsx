import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Feed from '../components/Feed'
import PostForm from '../components/PostForm'
import '../styles/FeedPage.css'

export default function FeedPage({ onLogout }) {
  return (
    <div className="feed-page">
      <Header onLogout={onLogout} />
      <main className="feed-main">
        <PostForm />
        <Feed />
      </main>
    </div>
  )
}
