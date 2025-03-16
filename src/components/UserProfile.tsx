import { useState, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'

export const UserProfile = () => {
  const { user, isAuthenticated } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
  })
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isAuthenticated || !user) {
    return null
  }

  const handleEdit = () => {
    setFormData({
      username: user.username,
      email: user.email,
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          username: formData.username,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      // Update local state
      useAuthStore.setState({
        user: {
          ...user,
          username: formData.username
        }
      })
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError('')

    try {
      // Upload file ke Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Dapatkan public URL dari file yang diupload
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      if (publicUrlData?.publicUrl) {
        // Update user profile dengan URL avatar baru
        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar_url: publicUrlData.publicUrl })
          .eq('id', user?.id)

        if (updateError) throw updateError

        setAvatarUrl(publicUrlData.publicUrl)
        // Update local state
        useAuthStore.setState({
          user: { ...user!, avatar_url: publicUrlData.publicUrl }
        })
      }
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Profile</h2>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="shadow-sm block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
              />
              <p className="mt-1 text-sm text-gray-500">
                Email cannot be changed
              </p>
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Username</h3>
              <p className="mt-1 text-lg">{user.username}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-lg">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
              <p className="mt-1 text-lg">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <div 
            className="relative w-32 h-32 mb-4 cursor-pointer"
            onClick={handleAvatarClick}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl text-gray-500">
                  {user?.username?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
          {uploadError && (
            <p className="text-sm text-red-500">{uploadError}</p>
          )}
        </div>

        {/* Additional Profile Sections */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <button
              onClick={() => {/* Implement password change */}}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Change Password
            </button>
            <button
              onClick={() => {/* Implement account deletion */}}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 