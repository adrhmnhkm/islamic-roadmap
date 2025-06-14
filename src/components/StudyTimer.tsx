import { useState, useEffect, useRef } from 'react'
import { useProgressStore } from '../store/progressStore'

interface StudyTimerProps {
  topicId: string
  topicTitle: string
  onSessionEnd?: (duration: number) => void
}

export const StudyTimer = ({ topicId, topicTitle, onSessionEnd }: StudyTimerProps) => {
  const progressStore = useProgressStore()
  const [isActive, setIsActive] = useState(false)
  const [time, setTime] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(time => time + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive])

  const startTimer = () => {
    const newSessionId = progressStore.startStudySession(topicId)
    setSessionId(newSessionId)
    setIsActive(true)
    setTime(0)
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const stopTimer = () => {
    if (sessionId) {
      const minutes = Math.floor(time / 60)
      progressStore.endStudySession(sessionId, 5) // Mock progress increment
      onSessionEnd?.(minutes)
    }
    
    setIsActive(false)
    setTime(0)
    setSessionId(null)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTime(0)
    if (sessionId) {
      // End current session without progress
      progressStore.endStudySession(sessionId, 0)
      setSessionId(null)
    }
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getMotivationalMessage = () => {
    const minutes = Math.floor(time / 60)
    if (minutes === 0) return "Mari mulai belajar! 🚀"
    if (minutes < 5) return "Bagus! Terus semangat! 💪"
    if (minutes < 15) return "Luar biasa! Kamu sedang fokus! 🎯"
    if (minutes < 30) return "Hebat! Konsistensi adalah kunci! ⭐"
    if (minutes < 60) return "Amazing! Kamu sangat berdedikasi! 🏆"
    return "Subhanallah! Semangat belajarmu luar biasa! 🌟"
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">⏱️ Study Timer</h3>
        <p className="text-sm text-gray-600">{topicTitle}</p>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-mono font-bold text-blue-600 mb-2">
          {formatTime(time)}
        </div>
        <p className="text-sm text-gray-500">{getMotivationalMessage()}</p>
      </div>

      {/* Progress Ring */}
      <div className="flex justify-center mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${Math.min((time / 1800) * 283, 283)} 283`}
              className="text-blue-500 transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-600">
              {Math.floor(time / 60)}m
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-3">
        {!isActive && time === 0 && (
          <button
            onClick={startTimer}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            ▶️ Mulai
          </button>
        )}

        {isActive && (
          <button
            onClick={pauseTimer}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
          >
            ⏸️ Pause
          </button>
        )}

        {!isActive && time > 0 && (
          <button
            onClick={() => setIsActive(true)}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            ▶️ Lanjut
          </button>
        )}

        {time > 0 && (
          <>
            <button
              onClick={stopTimer}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              ⏹️ Selesai
            </button>
            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              🔄 Reset
            </button>
          </>
        )}
      </div>

      {/* Study Stats */}
      {time > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Target</p>
              <p className="font-semibold text-gray-900">30 menit</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="font-semibold text-blue-600">
                {Math.min(Math.round((time / 1800) * 100), 100)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Achievements */}
      {time >= 1800 && ( // 30 minutes
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🎉</span>
            <div>
              <p className="font-medium text-green-800">Target Tercapai!</p>
              <p className="text-sm text-green-600">Kamu sudah belajar 30 menit hari ini!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 