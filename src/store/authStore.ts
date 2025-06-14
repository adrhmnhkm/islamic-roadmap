import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  username: string
  email: string
  created_at: string
  updated_at: string
  avatar_url?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  signup: (email: string, password: string, username: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      signup: async (email: string, password: string, username: string) => {
        try {
          console.log('Starting signup process...')
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
          })
          
          if (authError) {
            console.error('Auth signup error:', authError)
            throw authError
          }
          
          if (!authData.user) {
            throw new Error('No user data returned after signup')
          }

          console.log('Auth signup successful, creating user profile...')

          const now = new Date().toISOString()

          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              username,
              email,
              created_at: now,
              updated_at: now
            })

          if (profileError) {
            console.error('Profile creation detailed error:', profileError)
            await supabase.auth.signOut()
            throw new Error(`Profile creation failed: ${profileError.message}`)
          }

          set({
            user: {
              id: authData.user.id,
              username,
              email,
              created_at: now,
              updated_at: now,
              avatar_url: undefined
            },
            isAuthenticated: false
          })

          console.log('Signup process completed successfully')
          alert('Please check your email to verify your account before logging in.')
          
        } catch (error) {
          console.error('Complete signup error:', error)
          throw error
        }
      },
      login: async (email: string, password: string) => {
        try {
          console.log('Attempting login...')
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (authError) {
            console.error('Login error:', authError)
            throw authError
          }
          
          if (!authData.user) {
            throw new Error('No user data returned after login')
          }

          console.log('Auth successful, fetching user profile...')

          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single()
          
          if (userError) {
            console.error('Error fetching user profile:', userError)
            throw new Error('Gagal mengambil data profil')
          }

          set({
            user: userData,
            isAuthenticated: true
          })

          console.log('Login successful')
          
        } catch (error) {
          console.error('Complete login error:', error)
          throw error
        }
      },
      logout: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        
        set({
          user: null,
          isAuthenticated: false
        })
      },
      setUser: (user) => set({ isAuthenticated: !!user, user }),
      avatarUrl: null,
      setAvatarUrl: (url) => set({ avatarUrl: url })
    }),
    {
      name: 'auth-storage'
    }
  )
)

supabase.auth.onAuthStateChange((event, session: Session | null) => {
  const user = session?.user
  if (user) {
    useAuthStore.getState().setUser({
      id: user.id,
      username: user.email?.split('@')[0] || 'user',
      email: user.email ?? '',
      created_at: user.created_at ?? '',
      updated_at: user.updated_at ?? '',
      avatar_url: user.user_metadata?.avatar_url ?? ''
    })
  } else {
    useAuthStore.getState().setUser(null)
  }
})