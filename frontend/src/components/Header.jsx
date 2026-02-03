import '../styles/Header.css'

export default function Header({ onLogout }) {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="logo">Social Network</h1>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </header>
  )
}
