import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TopicProgress {
  topicId: string
  status: 'not_started' | 'in_progress' | 'completed'
  completedLessons: number
  totalLessons: number
  progress: number
  timeSpent: number // in minutes
  lastStudied: number // timestamp
  startedAt?: number // timestamp
  completedAt?: number // timestamp
}

export interface StudySession {
  id: string
  topicId: string
  startTime: number
  endTime: number
  duration: number // in minutes
  progress: number
  date: string
}

export interface LearningStreak {
  currentStreak: number
  longestStreak: number
  lastStudyDate: string
}

interface ProgressState {
  // Progress tracking
  topicProgress: Record<string, TopicProgress>
  studySessions: StudySession[]
  learningStreak: LearningStreak
  
  // Actions
  updateTopicProgress: (topicId: string, status: TopicProgress['status'], completedLessons?: number) => void
  startStudySession: (topicId: string) => string
  endStudySession: (sessionId: string, progress?: number) => void
  getTopicProgress: (topicId: string) => TopicProgress | null
  getTotalProgress: () => number
  getStudyTime: (period: 'today' | 'week' | 'month' | 'all') => number
  getCompletedTopics: () => TopicProgress[]
  getInProgressTopics: () => TopicProgress[]
  updateLearningStreak: () => void
  
  // Analytics
  getAnalyticsData: () => {
    totalTopics: number
    completedTopics: number
    inProgressTopics: number
    totalProgress: number
    studyStreak: number
    timeSpentToday: number
    averageSessionTime: number
    weeklyProgress: { date: string; timeSpent: number; progress: number }[]
  }
}

// Helper functions
const getDateString = (date: Date = new Date()) => {
  return date.toISOString().split('T')[0]
}

const isToday = (timestamp: number) => {
  const today = getDateString()
  const date = getDateString(new Date(timestamp))
  return today === date
}

const isThisWeek = (timestamp: number) => {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return timestamp >= weekAgo.getTime()
}

const isThisMonth = (timestamp: number) => {
  const now = new Date()
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return timestamp >= monthAgo.getTime()
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      topicProgress: {},
      studySessions: [],
      learningStreak: {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: ''
      },

      updateTopicProgress: (topicId, status, completedLessons = 0) => {
        const state = get()
        const existing = state.topicProgress[topicId]
        const now = Date.now()
        
        // Get total lessons for topic (you might want to make this configurable)
        const topicLessons: Record<string, number> = {
          'quran': 30,
          'hadith': 25,
          'aqeedah': 20,
          'fiqh': 35,
          'sirah': 28,
          'tafsir': 32,
          'arabic': 40
        }
        const totalLessons = topicLessons[topicId] || 20
        
        const updatedProgress: TopicProgress = {
          topicId,
          status,
          completedLessons,
          totalLessons,
          progress: Math.round((completedLessons / totalLessons) * 100),
          timeSpent: existing?.timeSpent || 0,
          lastStudied: now,
          startedAt: existing?.startedAt || (status !== 'not_started' ? now : undefined),
          completedAt: status === 'completed' ? now : existing?.completedAt
        }

        set({
          topicProgress: {
            ...state.topicProgress,
            [topicId]: updatedProgress
          }
        })

        // Update learning streak
        get().updateLearningStreak()
      },

      startStudySession: (topicId) => {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const now = Date.now()
        
        const session: StudySession = {
          id: sessionId,
          topicId,
          startTime: now,
          endTime: 0,
          duration: 0,
          progress: 0,
          date: getDateString()
        }

        set(state => ({
          studySessions: [...state.studySessions, session]
        }))

        return sessionId
      },

      endStudySession: (sessionId, progress = 0) => {
        const state = get()
        const sessionIndex = state.studySessions.findIndex(s => s.id === sessionId)
        
        if (sessionIndex === -1) return

        const session = state.studySessions[sessionIndex]
        const now = Date.now()
        const duration = Math.round((now - session.startTime) / (1000 * 60)) // minutes

        const updatedSession: StudySession = {
          ...session,
          endTime: now,
          duration,
          progress
        }

        const updatedSessions = [...state.studySessions]
        updatedSessions[sessionIndex] = updatedSession

        // Update topic time spent
        const topicProgress = state.topicProgress[session.topicId]
        if (topicProgress) {
          const updatedTopicProgress = {
            ...topicProgress,
            timeSpent: topicProgress.timeSpent + duration,
            lastStudied: now
          }

          set({
            studySessions: updatedSessions,
            topicProgress: {
              ...state.topicProgress,
              [session.topicId]: updatedTopicProgress
            }
          })
        } else {
          set({ studySessions: updatedSessions })
        }

        // Update learning streak
        get().updateLearningStreak()
      },

      getTopicProgress: (topicId) => {
        return get().topicProgress[topicId] || null
      },

      getTotalProgress: () => {
        const state = get()
        const progressValues = Object.values(state.topicProgress)
        
        if (progressValues.length === 0) return 0
        
        const totalProgress = progressValues.reduce((sum, p) => sum + p.progress, 0)
        return Math.round(totalProgress / progressValues.length)
      },

      getStudyTime: (period) => {
        const state = get()
        let filteredSessions = state.studySessions

        switch (period) {
          case 'today':
            filteredSessions = state.studySessions.filter(s => isToday(s.startTime))
            break
          case 'week':
            filteredSessions = state.studySessions.filter(s => isThisWeek(s.startTime))
            break
          case 'month':
            filteredSessions = state.studySessions.filter(s => isThisMonth(s.startTime))
            break
          case 'all':
          default:
            // Use all sessions
            break
        }

        return filteredSessions.reduce((total, session) => total + session.duration, 0)
      },

      getCompletedTopics: () => {
        const state = get()
        return Object.values(state.topicProgress).filter(p => p.status === 'completed')
      },

      getInProgressTopics: () => {
        const state = get()
        return Object.values(state.topicProgress).filter(p => p.status === 'in_progress')
      },

      updateLearningStreak: () => {
        const state = get()
        const today = getDateString()
        const yesterday = getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000))
        
        // Check if user studied today
        const studiedToday = state.studySessions.some(s => s.date === today)
        const studiedYesterday = state.studySessions.some(s => s.date === yesterday)
        
        let currentStreak = state.learningStreak.currentStreak
        let longestStreak = state.learningStreak.longestStreak
        
        if (studiedToday) {
          if (state.learningStreak.lastStudyDate === yesterday || state.learningStreak.lastStudyDate === today) {
            if (state.learningStreak.lastStudyDate !== today) {
              currentStreak += 1
            }
          } else {
            currentStreak = 1
          }
          
          longestStreak = Math.max(longestStreak, currentStreak)
          
          set({
            learningStreak: {
              currentStreak,
              longestStreak,
              lastStudyDate: today
            }
          })
        } else if (!studiedYesterday && state.learningStreak.lastStudyDate !== today) {
          // Reset streak if didn't study yesterday and today
          set({
            learningStreak: {
              ...state.learningStreak,
              currentStreak: 0
            }
          })
        }
      },

      getAnalyticsData: () => {
        const state = get()
        const progressValues = Object.values(state.topicProgress)
        
        // Weekly progress data
        const weeklyProgress = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateString = getDateString(date)
          
          const daySessions = state.studySessions.filter(s => s.date === dateString)
          const timeSpent = daySessions.reduce((total, s) => total + s.duration, 0)
          const progress = daySessions.reduce((total, s) => total + s.progress, 0)
          
          weeklyProgress.push({
            date: dateString,
            timeSpent,
            progress
          })
        }

        return {
          totalTopics: progressValues.length,
          completedTopics: progressValues.filter(p => p.status === 'completed').length,
          inProgressTopics: progressValues.filter(p => p.status === 'in_progress').length,
          totalProgress: get().getTotalProgress(),
          studyStreak: state.learningStreak.currentStreak,
          timeSpentToday: get().getStudyTime('today'),
          averageSessionTime: state.studySessions.length > 0 
            ? Math.round(state.studySessions.reduce((sum, s) => sum + s.duration, 0) / state.studySessions.length)
            : 0,
          weeklyProgress
        }
      }
    }),
    {
      name: 'progress-storage'
    }
  )
) 