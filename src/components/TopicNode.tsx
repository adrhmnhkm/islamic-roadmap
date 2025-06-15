import { useAuthStore } from '../stores/authStore'
import { useUserProgressStore } from '../store/userProgressStore'

interface TopicNodeProps {
  id: string
  title: string
  description: string
}

export const TopicNode = ({ id, title, description }: TopicNodeProps) => {
  const { isAuthenticated, user } = useAuthStore()
  const userProgressStore = useUserProgressStore()
  
  const currentUser = user || { id: 'demo-user', email: 'demo@example.com', name: 'Demo User' }
  const topicProgress = userProgressStore.getTopicProgress(currentUser.id, id)
  const hasProgress = topicProgress.length > 0

  const updateProgress = (status: 'not_started' | 'in_progress' | 'completed') => {
    // This would need more specific implementation based on your needs
    // For now, we'll just create a generic progress entry
    userProgressStore.markResourceProgress(
      currentUser.id,
      id,
      'topic-overview',
      title,
      'article',
      'basic',
      status
    )
  }

  return (
    <div className="relative p-4 border rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Indikator Status (dot) */}
      <div 
        className={`absolute -left-2 top-1/2 w-4 h-4 rounded-full transform -translate-y-1/2 ${
          !hasProgress ? 'bg-gray-200' :
          topicProgress.some(p => p.status === 'completed') ? 'bg-green-500' :
          topicProgress.some(p => p.status === 'in_progress') ? 'bg-yellow-500' :
          'bg-gray-200'
        }`}
      />

      {/* Konten Topik */}
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>

      {/* Tombol Status (hanya muncul jika user login) */}
      {isAuthenticated && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => updateProgress('not_started')}
            className={`px-3 py-1 text-sm rounded-full ${
              !hasProgress
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Belum Mulai
          </button>
          <button
            onClick={() => updateProgress('in_progress')}
            className={`px-3 py-1 text-sm rounded-full ${
              topicProgress.some(p => p.status === 'in_progress')
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Sedang Dipelajari
          </button>
          <button
            onClick={() => updateProgress('completed')}
            className={`px-3 py-1 text-sm rounded-full ${
              topicProgress.some(p => p.status === 'completed')
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Selesai
          </button>
        </div>
      )}
    </div>
  )
} 