import { useState, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import { ChangePassword } from './ChangePassword'
import { ExtendedProfileForm } from './ExtendedProfileForm'

type TabType = 'basic' | 'extended' | 'security'

export const UserProfile = () => {
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabType>('basic')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
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
      full_name: user.full_name || '',
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
          full_name: formData.full_name,
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
          full_name: formData.full_name
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

  const tabs = [
    { id: 'basic' as TabType, label: 'Profil Dasar', icon: '👤' },
    { id: 'extended' as TabType, label: 'Informasi Lengkap', icon: '📝' },
    { id: 'security' as TabType, label: 'Keamanan', icon: '🔒' }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Header with Avatar */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            <div 
              className="relative w-24 h-24 cursor-pointer"
              onClick={handleAvatarClick}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center border-4 border-white">
                  <span className="text-2xl text-gray-600">
                    {(user?.full_name || user?.email)?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user.full_name || user.email}</h1>
              <p className="text-blue-100">{user.email}</p>
              <p className="text-blue-200 text-sm">
                Bergabung sejak {new Date(user.created_at).toLocaleDateString('id-ID', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          {isUploading && <p className="text-blue-100 text-sm mt-2">Uploading...</p>}
          {uploadError && (
            <p className="text-red-200 text-sm mt-2">{uploadError}</p>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'basic' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profil Dasar</h2>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
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
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Email tidak dapat diubah
                    </p>
                  </div>
                  <div className="flex space-x-4 mt-6">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm transition-colors ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1 text-lg text-gray-900">{user.full_name || 'Belum diisi'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-lg text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status Akun</h3>
                    <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aktif
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Terakhir Update</h3>
                    <p className="mt-1 text-lg text-gray-900">
                      {new Date(user.updated_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'extended' && <ExtendedProfileForm />}

          {activeTab === 'security' && <ChangePassword />}
        </div>
      </div>
    </div>
  )
} 