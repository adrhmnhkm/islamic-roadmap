import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useProgressStore } from '../store/progressStore'

interface ProgressData {
  topicId: string
  topicTitle: string
  completedLessons: number
  totalLessons: number
  progress: number
  lastUpdated: number
}

interface StudySession {
  date: string
  topicsStudied: string[]
  timeSpent: number
  progress: number
}

interface AnalyticsData {
  totalTopics: number
  completedTopics: number
  inProgressTopics: number
  totalProgress: number
  studyStreak: number
  weeklyProgress: StudySession[]
  topPerformingTopics: ProgressData[]
  recentActivity: ProgressData[]
  timeSpentToday: number
  averageSessionTime: number
}

export const AnalyticsDashboard = () => {
  const { user, isAuthenticated } = useAuthStore()
  const progressStore = useProgressStore()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week')

  useEffect(() => {
    if (isAuthenticated && user) {
      // Small delay to ensure data is loaded
      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    }
  }, [isAuthenticated, user])

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}j ${mins}m` : `${mins}m`
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center">Silakan login untuk melihat analytics pembelajaran Anda</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  const analyticsData = progressStore.getAnalyticsData()
  const completedTopics = progressStore.getCompletedTopics()
  const inProgressTopics = progressStore.getInProgressTopics()

  // Get top performing topics
  const topPerformingTopics = Object.values(progressStore.topicProgress)
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5)

  // Get recent activity
  const recentActivity = Object.values(progressStore.topicProgress)
    .sort((a, b) => b.lastStudied - a.lastStudied)
    .slice(0, 5)

  const getTopicTitle = (topicId: string): string => {
    const topicTitles: Record<string, string> = {
      'quran': 'Al-Quran',
      'hadith': 'Hadits',
      'aqeedah': 'Aqidah',
      'fiqh': 'Fikih',
      'sirah': 'Sirah',
      'tafsir': 'Tafsir',
      'arabic': 'Bahasa Arab'
    }
    return topicTitles[topicId] || topicId
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📊 Analytics Pembelajaran</h2>
        <p className="text-blue-100">Pantau progress dan pencapaian belajar Anda</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'all'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPeriod === period
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {period === 'week' ? 'Minggu Ini' : period === 'month' ? 'Bulan Ini' : 'Semua'}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Progress Keseluruhan</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalProgress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Topik Selesai</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.completedTopics}/{analyticsData.totalTopics}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <span className="text-2xl">🔥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Study Streak</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.studyStreak} hari</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Waktu Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{formatTime(analyticsData.timeSpentToday)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Progress Mingguan</h3>
        <div className="space-y-3">
          {analyticsData.weeklyProgress.map((session, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 w-20">
                  {new Date(session.date).toLocaleDateString('id-ID', { 
                    weekday: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(session.progress * 5, 100)}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {formatTime(session.timeSpent)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Topik Terbaik</h3>
          <div className="space-y-3">
            {topPerformingTopics.length > 0 ? (
              topPerformingTopics.map((topic, index) => (
                <div key={topic.topicId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📖'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{getTopicTitle(topic.topicId)}</p>
                      <p className="text-sm text-gray-500">
                        {topic.completedLessons}/{topic.totalLessons} pelajaran
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{topic.progress}%</p>
                    <p className="text-xs text-gray-500">{formatTime(topic.timeSpent)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Belum ada progress pembelajaran</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🕒 Aktivitas Terbaru</h3>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.topicId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{getTopicTitle(activity.topicId)}</p>
                    <p className="text-sm text-gray-500">
                      Progress: {activity.progress}% • {formatTime(activity.timeSpent)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(activity.lastStudied).toLocaleDateString('id-ID')}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Belum ada aktivitas pembelajaran</p>
            )}
          </div>
        </div>
      </div>

      {/* Study Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Insights Pembelajaran</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{formatTime(analyticsData.averageSessionTime)}</p>
            <p className="text-sm text-blue-800">Rata-rata Sesi Belajar</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{analyticsData.inProgressTopics}</p>
            <p className="text-sm text-green-800">Topik Sedang Dipelajari</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {analyticsData.totalTopics - analyticsData.completedTopics - analyticsData.inProgressTopics}
            </p>
            <p className="text-sm text-purple-800">Topik Belum Dimulai</p>
          </div>
        </div>
      </div>

      {/* Study Sessions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Sesi Belajar Terbaru</h3>
        <div className="space-y-3">
          {progressStore.studySessions.slice(-5).reverse().map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{getTopicTitle(session.topicId)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(session.startTime).toLocaleDateString('id-ID')} • {formatTime(session.duration)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">+{session.progress}% progress</p>
              </div>
            </div>
          ))}
          {progressStore.studySessions.length === 0 && (
            <p className="text-gray-500 text-center py-4">Belum ada sesi belajar yang tercatat</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/'}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors"
          >
            <span className="text-2xl block mb-2">📚</span>
            <p className="font-medium text-blue-900">Mulai Belajar</p>
            <p className="text-sm text-blue-700">Lanjutkan pembelajaran</p>
          </button>
          
          <button
            onClick={() => window.location.href = '/profile'}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors"
          >
            <span className="text-2xl block mb-2">⚙️</span>
            <p className="font-medium text-green-900">Pengaturan</p>
            <p className="text-sm text-green-700">Atur preferensi belajar</p>
          </button>
          
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <span className="text-2xl block mb-2">🎯</span>
            <p className="font-medium text-purple-900">Target Harian</p>
            <p className="text-sm text-purple-700">30 menit belajar</p>
          </div>
        </div>
      </div>
    </div>
  )
} 