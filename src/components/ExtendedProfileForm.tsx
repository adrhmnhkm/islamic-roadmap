import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'

interface ExtendedProfile {
  first_name: string
  last_name: string
  bio: string
  location: string
  phone: string
  date_of_birth: string
  preferred_language: 'indonesia' | 'english' | 'arabic'
  learning_level: 'beginner' | 'intermediate' | 'advanced'
  favorite_topics: string[]
  study_time_preference: 'morning' | 'afternoon' | 'evening' | 'night'
  notification_email: boolean
  notification_reminders: boolean
}

const topics = [
  { id: 'quran', label: 'Al-Quran' },
  { id: 'hadith', label: 'Hadits' },
  { id: 'aqeedah', label: 'Aqidah' },
  { id: 'fiqh', label: 'Fikih' },
  { id: 'sirah', label: 'Sirah' },
  { id: 'tafsir', label: 'Tafsir' },
  { id: 'arabic', label: 'Bahasa Arab' }
]

export const ExtendedProfileForm = () => {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [profileData, setProfileData] = useState<ExtendedProfile>({
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    phone: '',
    date_of_birth: '',
    preferred_language: 'indonesia',
    learning_level: 'beginner',
    favorite_topics: [],
    study_time_preference: 'evening',
    notification_email: true,
    notification_reminders: true
  })

  useEffect(() => {
    if (user?.id) {
      loadExtendedProfile()
    }
  }, [user?.id])

  const loadExtendedProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setProfileData(data)
      }
    } catch (err: any) {
      console.error('Error loading profile:', err)
    }
  }

  const handleInputChange = (field: keyof ExtendedProfile, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTopicToggle = (topicId: string) => {
    setProfileData(prev => ({
      ...prev,
      favorite_topics: prev.favorite_topics.includes(topicId)
        ? prev.favorite_topics.filter(id => id !== topicId)
        : [...prev.favorite_topics, topicId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSuccess('Profil berhasil diperbarui!')
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui profil')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Informasi Profil Lengkap</h3>
      
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Depan
            </label>
            <input
              type="text"
              value={profileData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama depan"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Belakang
            </label>
            <input
              type="text"
              value={profileData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan nama belakang"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ceritakan sedikit tentang diri Anda..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi
            </label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Kota, Negara"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+62 xxx-xxxx-xxxx"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Lahir
          </label>
          <input
            type="date"
            value={profileData.date_of_birth}
            onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Learning Preferences */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Preferensi Pembelajaran</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bahasa Pilihan
              </label>
              <select
                value={profileData.preferred_language}
                onChange={(e) => handleInputChange('preferred_language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="indonesia">Bahasa Indonesia</option>
                <option value="english">English</option>
                <option value="arabic">العربية</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level Pembelajaran
              </label>
              <select
                value={profileData.learning_level}
                onChange={(e) => handleInputChange('learning_level', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Pemula</option>
                <option value="intermediate">Menengah</option>
                <option value="advanced">Lanjutan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Waktu Belajar Favorit
            </label>
            <select
              value={profileData.study_time_preference}
              onChange={(e) => handleInputChange('study_time_preference', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="morning">Pagi (06:00 - 12:00)</option>
              <option value="afternoon">Siang (12:00 - 18:00)</option>
              <option value="evening">Sore (18:00 - 21:00)</option>
              <option value="night">Malam (21:00 - 24:00)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Topik Favorit
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {topics.map(topic => (
                <label key={topic.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profileData.favorite_topics.includes(topic.id)}
                    onChange={() => handleTopicToggle(topic.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{topic.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Preferensi Notifikasi</h4>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profileData.notification_email}
                onChange={(e) => handleInputChange('notification_email', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Terima notifikasi email</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={profileData.notification_reminders}
                onChange={(e) => handleInputChange('notification_reminders', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Pengingat belajar harian</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Profil'}
          </button>
        </div>
      </form>
    </div>
  )
} 