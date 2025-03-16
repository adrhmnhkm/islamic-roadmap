import { useAuthStore } from '../store/authStore'

interface TopicNodeProps {
  id: string
  title: string
  description: string
}

export const TopicNode = ({ id, title, description }: TopicNodeProps) => {
  const { isAuthenticated, getProgress, updateProgress } = useAuthStore()
  const progress = getProgress(id)

  return (
    <div className="relative p-4 border rounded-lg shadow hover:shadow-md transition-shadow">
      {/* Indikator Status (dot) */}
      <div 
        className={`absolute -left-2 top-1/2 w-4 h-4 rounded-full transform -translate-y-1/2 ${
          !isAuthenticated || !progress ? 'bg-gray-200' :
          progress.status === 'completed' ? 'bg-green-500' :
          progress.status === 'in_progress' ? 'bg-yellow-500' :
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
            onClick={() => updateProgress(id, 'not_started')}
            className={`px-3 py-1 text-sm rounded-full ${
              progress?.status === 'not_started' 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Belum Mulai
          </button>
          <button
            onClick={() => updateProgress(id, 'in_progress')}
            className={`px-3 py-1 text-sm rounded-full ${
              progress?.status === 'in_progress' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Sedang Dipelajari
          </button>
          <button
            onClick={() => updateProgress(id, 'completed')}
            className={`px-3 py-1 text-sm rounded-full ${
              progress?.status === 'completed' 
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