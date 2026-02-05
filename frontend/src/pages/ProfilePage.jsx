import { useState, useEffect } from 'react'
import { ArrowLeft, Loader2, Camera, Trash2 } from 'lucide-react'
import { profileAPI, usersAPI } from '../services/api'
import { cn } from '../lib/utils'
import Toast from '../components/Toast'

export default function ProfilePage({ onBack, onProfileUpdate }) {
  const [user, setUser] = useState(null)
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [originalBio, setOriginalBio] = useState('')
  const [originalAvatar, setOriginalAvatar] = useState(null)
  const [avatarToRemove, setAvatarToRemove] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const [userRes, profileRes] = await Promise.all([
        usersAPI.me(),
        profileAPI.me()
      ])
      
      // Check for errors
      if (userRes?.detail || profileRes?.detail) {
        setToast({ message: 'Failed to load profile', type: 'error' })
        return
      }
      
      setUser(userRes.data)
      setBio(profileRes.data.bio || '')
      setOriginalBio(profileRes.data.bio || '')
      setOriginalAvatar(profileRes.data.avatar)
      setAvatarPreview(profileRes.data.avatar)
    } catch (err) {
      console.error('Failed to load profile:', err)
      setToast({ message: 'Failed to load profile. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: 'Avatar must be smaller than 5MB', type: 'error' })
        return
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setToast({ message: 'Please select an image file', type: 'error' })
        return
      }
      
      setAvatar(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target.result)
      }
      reader.onerror = () => {
        setToast({ message: 'Failed to read image', type: 'error' })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarToRemove(true)
    setAvatarPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate bio length
    if (bio.length > 500) {
      setToast({ message: 'Bio must be less than 500 characters', type: 'error' })
      return
    }
    
    setSaving(true)

    try {
      // Handle avatar removal first if needed
      if (avatarToRemove && originalAvatar) {
        await profileAPI.removeAvatar()
      }

      // Then update profile
      const formData = new FormData()
      formData.append('bio', bio)
      if (avatar) {
        formData.append('avatar_file', avatar)
      }
      
      const response = await profileAPI.update(formData)
      
      // Check for errors
      if (response?.bio && Array.isArray(response.bio)) {
        setToast({ message: response.bio[0], type: 'error' })
        return
      }
      if (response?.avatar_file && Array.isArray(response.avatar_file)) {
        setToast({ message: response.avatar_file[0], type: 'error' })
        return
      }
      if (response?.detail) {
        setToast({ message: response.detail, type: 'error' })
        return
      }
      
      setAvatarToRemove(false)
      setAvatar(null)
      setToast({ message: 'Profile updated successfully', type: 'success' })
      if (onProfileUpdate) onProfileUpdate()
      await fetchProfile()
    } catch (err) {
      console.error('Failed to update profile:', err)
      setToast({ message: 'Failed to update profile. Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const isPristine = bio === originalBio && !avatar && !avatarToRemove

  useEffect(() => {
    document.title = 'Profile - Social Network'
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <button
          onClick={onBack}
          className="mb-4 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Feed
        </button>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-2xl">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-2 bg-white border border-gray-200 rounded-full cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              {originalAvatar && !avatarToRemove && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove photo
                </button>
              )}
              {avatarToRemove && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarToRemove(false)
                    setAvatarPreview(originalAvatar)
                  }}
                  className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Undo removal
                </button>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows="4"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="submit"
              disabled={isPristine || saving}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
                isPristine || saving
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-primary-dark text-white"
              )}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  )
}
