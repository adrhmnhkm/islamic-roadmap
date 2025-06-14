import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserResourceProgress {
  userId: string
  topicId: string
  resourceId: string
  resourceTitle: string
  resourceType: 'video' | 'article' | 'book'
  level: 'basic' | 'intermediate' | 'advanced'
  status: 'not_started' | 'in_progress' | 'completed'
  notes?: string
  rating?: number // 1-5 stars
  completedAt?: number // timestamp
  createdAt: number
  updatedAt: number
}

export interface TopicGoal {
  userId: string
  topicId: string
  targetCompletionDate?: string
  weeklyTarget?: number
  personalNotes?: string
  createdAt: number
  updatedAt: number
}

export interface TopicStats {
  topicId: string
  totalResources: number
  completedResources: number
  inProgressResources: number
  progressPercentage: number
  basicCompleted: number
  basicTotal: number
  intermediateCompleted: number
  intermediateTotal: number
  advancedCompleted: number
  advancedTotal: number
  lastActivity?: number
}

export interface ExportData {
  version: string
  exportDate: string
  userId: string
  userData: {
    resourceProgress: Record<string, UserResourceProgress>
    topicGoals: Record<string, TopicGoal>
  }
  metadata: {
    totalTopics: number
    totalResources: number
    completedResources: number
    exportType: 'full' | 'topic' | 'partial'
  }
}

interface UserProgressState {
  // Progress tracking
  resourceProgress: Record<string, UserResourceProgress> // key: userId-topicId-resourceId
  topicGoals: Record<string, TopicGoal> // key: userId-topicId
  
  // Actions
  markResourceProgress: (
    userId: string,
    topicId: string,
    resourceId: string,
    resourceTitle: string,
    resourceType: 'video' | 'article' | 'book',
    level: 'basic' | 'intermediate' | 'advanced',
    status: 'not_started' | 'in_progress' | 'completed',
    notes?: string,
    rating?: number
  ) => void
  
  setTopicGoal: (
    userId: string,
    topicId: string,
    goal: Partial<Omit<TopicGoal, 'userId' | 'topicId' | 'createdAt' | 'updatedAt'>>
  ) => void
  
  getUserResourceProgress: (userId: string, topicId: string, resourceId: string) => UserResourceProgress | null
  getTopicProgress: (userId: string, topicId: string) => UserResourceProgress[]
  getTopicStats: (userId: string, topicId: string, totalResourcesByLevel: { basic: number, intermediate: number, advanced: number }) => TopicStats
  getTopicGoal: (userId: string, topicId: string) => TopicGoal | null
  getAllTopicsStats: (userId: string) => Record<string, TopicStats>
  
  // Export/Import functions
  exportUserData: (userId: string, options?: { topicId?: string, format?: 'json' | 'csv' }) => ExportData
  importUserData: (data: ExportData, options?: { merge?: boolean, userId?: string }) => { success: boolean, message: string, imported: number }
  clearUserData: (userId: string, topicId?: string) => void
  validateImportData: (data: any) => { valid: boolean, errors: string[] }
  
  // Analytics
  getUserOverallStats: (userId: string) => {
    totalTopics: number
    activeTopics: number
    totalResourcesCompleted: number
    currentStreak: number
    lastActivity?: number
  }
}

const generateKey = (userId: string, topicId: string, resourceId?: string) => {
  return resourceId ? `${userId}-${topicId}-${resourceId}` : `${userId}-${topicId}`
}

export const useUserProgressStore = create<UserProgressState>()(
  persist(
    (set, get) => ({
      resourceProgress: {},
      topicGoals: {},

      markResourceProgress: (userId, topicId, resourceId, resourceTitle, resourceType, level, status, notes, rating) => {
        const key = generateKey(userId, topicId, resourceId)
        const now = Date.now()
        const existing = get().resourceProgress[key]

        const progress: UserResourceProgress = {
          userId,
          topicId,
          resourceId,
          resourceTitle,
          resourceType,
          level,
          status,
          notes,
          rating,
          completedAt: status === 'completed' ? now : existing?.completedAt,
          createdAt: existing?.createdAt || now,
          updatedAt: now
        }

        set(state => ({
          resourceProgress: {
            ...state.resourceProgress,
            [key]: progress
          }
        }))
      },

      setTopicGoal: (userId, topicId, goal) => {
        const key = generateKey(userId, topicId)
        const now = Date.now()
        const existing = get().topicGoals[key]

        const topicGoal: TopicGoal = {
          userId,
          topicId,
          ...goal,
          createdAt: existing?.createdAt || now,
          updatedAt: now
        }

        set(state => ({
          topicGoals: {
            ...state.topicGoals,
            [key]: topicGoal
          }
        }))
      },

      getUserResourceProgress: (userId, topicId, resourceId) => {
        const key = generateKey(userId, topicId, resourceId)
        return get().resourceProgress[key] || null
      },

      getTopicProgress: (userId, topicId) => {
        const state = get()
        return Object.values(state.resourceProgress).filter(
          progress => progress.userId === userId && progress.topicId === topicId
        )
      },

      getTopicStats: (userId, topicId, totalResourcesByLevel) => {
        const topicProgress = get().getTopicProgress(userId, topicId)
        
        const completed = topicProgress.filter(p => p.status === 'completed')
        const inProgress = topicProgress.filter(p => p.status === 'in_progress')
        
        const basicCompleted = completed.filter(p => p.level === 'basic').length
        const intermediateCompleted = completed.filter(p => p.level === 'intermediate').length
        const advancedCompleted = completed.filter(p => p.level === 'advanced').length
        
        const totalResources = totalResourcesByLevel.basic + totalResourcesByLevel.intermediate + totalResourcesByLevel.advanced
        const completedResources = completed.length
        
        const lastActivity = topicProgress.length > 0 
          ? Math.max(...topicProgress.map(p => p.updatedAt))
          : undefined

        return {
          topicId,
          totalResources,
          completedResources,
          inProgressResources: inProgress.length,
          progressPercentage: totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0,
          basicCompleted,
          basicTotal: totalResourcesByLevel.basic,
          intermediateCompleted,
          intermediateTotal: totalResourcesByLevel.intermediate,
          advancedCompleted,
          advancedTotal: totalResourcesByLevel.advanced,
          lastActivity
        }
      },

      getTopicGoal: (userId, topicId) => {
        const key = generateKey(userId, topicId)
        return get().topicGoals[key] || null
      },

      getAllTopicsStats: (userId) => {
        // This would need topic definitions to calculate properly
        // For now, return empty object - will be populated by components
        return {}
      },

      // Export user data
      exportUserData: (userId, options = {}) => {
        const state = get()
        const { topicId, format = 'json' } = options

        let resourceProgress = state.resourceProgress
        let topicGoals = state.topicGoals

        // Filter by topic if specified
        if (topicId) {
          resourceProgress = Object.fromEntries(
            Object.entries(resourceProgress).filter(([_, progress]) => 
              progress.userId === userId && progress.topicId === topicId
            )
          )
          topicGoals = Object.fromEntries(
            Object.entries(topicGoals).filter(([_, goal]) => 
              goal.userId === userId && goal.topicId === topicId
            )
          )
        } else {
          // Filter by userId
          resourceProgress = Object.fromEntries(
            Object.entries(resourceProgress).filter(([_, progress]) => progress.userId === userId)
          )
          topicGoals = Object.fromEntries(
            Object.entries(topicGoals).filter(([_, goal]) => goal.userId === userId)
          )
        }

        const userProgress = Object.values(resourceProgress)
        const completed = userProgress.filter(p => p.status === 'completed')
        const topics = new Set(userProgress.map(p => p.topicId))

        const exportData: ExportData = {
          version: '1.0',
          exportDate: new Date().toISOString(),
          userId,
          userData: {
            resourceProgress,
            topicGoals
          },
          metadata: {
            totalTopics: topics.size,
            totalResources: userProgress.length,
            completedResources: completed.length,
            exportType: topicId ? 'topic' : 'full'
          }
        }

        return exportData
      },

      // Import user data
      importUserData: (data, options = {}) => {
        const { merge = true, userId } = options
        const validation = get().validateImportData(data)
        
        if (!validation.valid) {
          return {
            success: false,
            message: `Import failed: ${validation.errors.join(', ')}`,
            imported: 0
          }
        }

        const targetUserId = userId || data.userId
        let imported = 0

        set(state => {
          const newResourceProgress = { ...state.resourceProgress }
          const newTopicGoals = { ...state.topicGoals }

          // Import resource progress
          Object.entries(data.userData.resourceProgress).forEach(([key, progress]) => {
            const newKey = userId ? key.replace(data.userId, targetUserId) : key
            const updatedProgress = userId ? { ...progress, userId: targetUserId } : progress

            if (merge || !newResourceProgress[newKey]) {
              newResourceProgress[newKey] = updatedProgress
              imported++
            }
          })

          // Import topic goals
          Object.entries(data.userData.topicGoals).forEach(([key, goal]) => {
            const newKey = userId ? key.replace(data.userId, targetUserId) : key
            const updatedGoal = userId ? { ...goal, userId: targetUserId } : goal

            if (merge || !newTopicGoals[newKey]) {
              newTopicGoals[newKey] = updatedGoal
            }
          })

          return {
            resourceProgress: newResourceProgress,
            topicGoals: newTopicGoals
          }
        })

        return {
          success: true,
          message: `Successfully imported ${imported} items`,
          imported
        }
      },

      // Clear user data
      clearUserData: (userId, topicId) => {
        set(state => {
          if (topicId) {
            // Clear specific topic
            const newResourceProgress = Object.fromEntries(
              Object.entries(state.resourceProgress).filter(([_, progress]) => 
                !(progress.userId === userId && progress.topicId === topicId)
              )
            )
            const newTopicGoals = Object.fromEntries(
              Object.entries(state.topicGoals).filter(([_, goal]) => 
                !(goal.userId === userId && goal.topicId === topicId)
              )
            )
            return {
              resourceProgress: newResourceProgress,
              topicGoals: newTopicGoals
            }
          } else {
            // Clear all user data
            const newResourceProgress = Object.fromEntries(
              Object.entries(state.resourceProgress).filter(([_, progress]) => progress.userId !== userId)
            )
            const newTopicGoals = Object.fromEntries(
              Object.entries(state.topicGoals).filter(([_, goal]) => goal.userId !== userId)
            )
            return {
              resourceProgress: newResourceProgress,
              topicGoals: newTopicGoals
            }
          }
        })
      },

      // Validate import data
      validateImportData: (data) => {
        const errors: string[] = []

        if (!data || typeof data !== 'object') {
          errors.push('Invalid data format')
          return { valid: false, errors }
        }

        if (!data.version) {
          errors.push('Missing version information')
        }

        if (!data.userId) {
          errors.push('Missing user ID')
        }

        if (!data.userData || typeof data.userData !== 'object') {
          errors.push('Missing user data')
        }

        if (data.userData && !data.userData.resourceProgress) {
          errors.push('Missing resource progress data')
        }

        return {
          valid: errors.length === 0,
          errors
        }
      },

      getUserOverallStats: (userId) => {
        const state = get()
        const userProgress = Object.values(state.resourceProgress).filter(p => p.userId === userId)
        
        const completedResources = userProgress.filter(p => p.status === 'completed')
        const activeTopics = new Set(userProgress.filter(p => p.status !== 'not_started').map(p => p.topicId)).size
        const totalTopics = new Set(userProgress.map(p => p.topicId)).size
        
        const lastActivity = userProgress.length > 0 
          ? Math.max(...userProgress.map(p => p.updatedAt))
          : undefined

        // Simple streak calculation - consecutive days with activity
        const today = new Date().toDateString()
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
        
        const todayActivity = completedResources.some(p => 
          p.completedAt && new Date(p.completedAt).toDateString() === today
        )
        const yesterdayActivity = completedResources.some(p => 
          p.completedAt && new Date(p.completedAt).toDateString() === yesterday
        )
        
        // Basic streak calculation (can be enhanced later)
        const currentStreak = todayActivity ? (yesterdayActivity ? 2 : 1) : 0

        return {
          totalTopics,
          activeTopics,
          totalResourcesCompleted: completedResources.length,
          currentStreak,
          lastActivity
        }
      }
    }),
    {
      name: 'user-progress-storage'
    }
  )
) 