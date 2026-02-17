import { useState, useRef, useEffect } from 'react'
import { LogOut, User, ChevronLeft } from 'lucide-react'

export default function Header({ onLogout, onNavigateProfile, onNavigateFeed, user }) {
  const [showPopover, setShowPopover] = useState(false)
  const popoverRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setShowPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <h1 
          onClick={onNavigateFeed}
          className="text-lg sm:text-xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity"
        >
          Social Network
        </h1>
        
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setShowPopover(!showPopover)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all focus:outline-none"
            tabIndex={0}
            style={{ boxShadow: 'none', border: 'none' }}
          >
            <ChevronLeft 
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${showPopover ? 'rotate-[-90deg]' : ''}`}
            />
          </button>

          {showPopover && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setShowPopover(false)
                  onNavigateProfile()
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => {
                  setShowPopover(false)
                  onLogout()
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
