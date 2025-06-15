import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface ExtendedUser extends User {
  role?: UserRole;
  full_name?: string;
  avatar_url?: string;
  is_active?: boolean;
}

interface AuthState {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  updateProfile: (updates: { full_name?: string; avatar_url?: string }) => Promise<{ error: any }>;
  checkRole: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forceRefreshAdminStatus: () => Promise<void>;
  initialize: () => Promise<void>;
  // Legacy compatibility
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      role: 'user',
      isAdmin: false,
      isSuperAdmin: false,
      isAuthenticated: false,

      signIn: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) return { error };

          if (data.user && data.session) {
            set({ session: data.session });
            
            // Refresh user data from database using API
            await get().refreshUser();
          }

          return { error: null };
        } catch (error) {
          return { error };
        }
      },

      signUp: async (email: string, password: string, fullName: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });

          if (error) return { error };

          return { error: null };
        } catch (error) {
          return { error };
        }
      },

      signOut: async () => {
        try {
          await supabase.auth.signOut();
          set({ 
            user: null, 
            session: null, 
            role: 'user',
            isAdmin: false,
            isSuperAdmin: false,
            isAuthenticated: false
          });
        } catch (error) {
          console.error('Sign out error:', error);
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          return { error };
        } catch (error) {
          return { error };
        }
      },

      updatePassword: async (password: string) => {
        try {
          const { error } = await supabase.auth.updateUser({ password });
          return { error };
        } catch (error) {
          return { error };
        }
      },

      updateProfile: async (updates: { full_name?: string; avatar_url?: string }) => {
        try {
          const { error: authError } = await supabase.auth.updateUser({
            data: updates,
          });

          if (authError) return { error: authError };

          await get().refreshUser();
          return { error: null };
        } catch (error) {
          return { error };
        }
      },

      checkRole: async () => {
        try {
          const { user } = get();
          if (!user?.email) return;

          // Use API endpoint to check role (bypasses RLS)
          const response = await fetch('/api/auth/check-role', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: user.email })
          });

          if (!response.ok) {
            console.error('Error checking role: API response not ok');
            return;
          }

          const result = await response.json();
          
          if (result.success) {
            const role = result.user.role || 'user';
            const isActive = result.user.is_active !== false;

            if (!isActive) {
              await get().signOut();
              return;
            }

            set({ 
              role,
              isAdmin: result.user.isAdmin,
              isSuperAdmin: result.user.isSuperAdmin
            });
          } else {
            console.error('Error checking role:', result.error);
          }

        } catch (error) {
          console.error('Error checking role:', error);
        }
      },

      refreshUser: async () => {
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          
          if (error || !user) {
            set({ 
              user: null, 
              session: null, 
              role: 'user',
              isAdmin: false,
              isSuperAdmin: false,
              isAuthenticated: false
            });
            return;
          }

          // Use API endpoint to get user data (bypasses RLS)
          try {
            const response = await fetch('/api/auth/check-role', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email: user.email })
            });

            if (response.ok) {
              const result = await response.json();
              
              if (result.success) {
                // User exists in database with role info
                const extendedUser: ExtendedUser = {
                  ...user,
                  role: result.user.role,
                  full_name: result.user.full_name || user.user_metadata?.full_name,
                  avatar_url: user.user_metadata?.avatar_url,
                  is_active: result.user.is_active,
                };

                const role = result.user.role || 'user';
                const isActive = result.user.is_active !== false;

                if (!isActive) {
                  await get().signOut();
                  return;
                }

                set({ 
                  user: extendedUser,
                  role,
                  isAdmin: result.user.isAdmin,
                  isSuperAdmin: result.user.isSuperAdmin,
                  isAuthenticated: true
                });

                console.log('✅ User refreshed with role:', { 
                  email: user.email, 
                  role, 
                  isAdmin: result.user.isAdmin, 
                  isSuperAdmin: result.user.isSuperAdmin 
                });
                return;
              }
            } else {
              console.error('API check-role failed with status:', response.status);
            }
          } catch (apiError) {
            console.error('Error fetching user data from API:', apiError);
          }

          // Fallback: user exists in auth but not in database or API failed
          // Try to determine admin status from localStorage backup
          const backupAuth = localStorage.getItem('auth-storage');
          let fallbackRole = 'user';
          let fallbackIsAdmin = false;
          let fallbackIsSuperAdmin = false;
          
          if (backupAuth) {
            try {
              const parsed = JSON.parse(backupAuth);
              if (parsed.state?.role) {
                fallbackRole = parsed.state.role;
                fallbackIsAdmin = parsed.state.isAdmin || false;
                fallbackIsSuperAdmin = parsed.state.isSuperAdmin || false;
                console.log('🔄 Using fallback role from localStorage:', fallbackRole);
              }
            } catch (e) {
              console.error('Error parsing backup auth:', e);
            }
          }

          const extendedUser: ExtendedUser = {
            ...user,
            role: fallbackRole as UserRole,
            full_name: user.user_metadata?.full_name || user.email,
            avatar_url: user.user_metadata?.avatar_url,
            is_active: true,
          };

          set({ 
            user: extendedUser,
            role: fallbackRole as UserRole,
            isAdmin: fallbackIsAdmin,
            isSuperAdmin: fallbackIsSuperAdmin,
            isAuthenticated: true
          });

          console.log('⚠️ User refreshed with fallback role - API check failed:', {
            email: user.email,
            role: fallbackRole,
            isAdmin: fallbackIsAdmin
          });

        } catch (error) {
          console.error('Error refreshing user:', error);
          set({ 
            user: null, 
            session: null, 
            role: 'user',
            isAdmin: false,
            isSuperAdmin: false,
            isAuthenticated: false
          });
        }
      },

      forceRefreshAdminStatus: async () => {
        try {
          const { user } = get();
          if (!user?.email) {
            console.log('No user found for admin status refresh');
            return;
          }

          console.log('🔄 Force refreshing admin status for:', user.email);

          // Force API call to check role
          const response = await fetch('/api/auth/check-role', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: user.email })
          });

          if (response.ok) {
            const result = await response.json();
            
            if (result.success) {
              const role = result.user.role || 'user';
              const isAdmin = result.user.isAdmin;
              const isSuperAdmin = result.user.isSuperAdmin;

              set({ 
                role,
                isAdmin,
                isSuperAdmin
              });

              console.log('✅ Admin status force refreshed:', { 
                email: user.email, 
                role, 
                isAdmin, 
                isSuperAdmin 
              });
            } else {
              console.error('Failed to get user role:', result.error);
            }
          } else {
            console.error('API check-role failed with status:', response.status);
          }
        } catch (error) {
          console.error('Error force refreshing admin status:', error);
        }
      },

      initialize: async () => {
        try {
          set({ loading: true });

          // Get initial session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            set({ loading: false });
            return;
          }

          if (session?.user) {
            set({ session });
            await get().refreshUser();
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            
            set({ session });

            if (event === 'SIGNED_IN' && session?.user) {
              await get().refreshUser();
            } else if (event === 'SIGNED_OUT') {
              set({ 
                user: null, 
                session: null, 
                role: 'user',
                isAdmin: false,
                isSuperAdmin: false,
                isAuthenticated: false
              });
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              await get().refreshUser();
            }
          });

          set({ loading: false });
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ loading: false });
        }
      },

      // Legacy compatibility
      login: async (email: string, password: string) => {
        const result = await get().signIn(email, password);
        if (result.error) {
          throw result.error;
        }
      },

      signup: async (email: string, password: string, username: string) => {
        const result = await get().signUp(email, password, username);
        if (result.error) {
          throw result.error;
        }
      },

      logout: async () => {
        await get().signOut();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        role: state.role,
        isAdmin: state.isAdmin,
        isSuperAdmin: state.isSuperAdmin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 

// Expose auth store to window for debugging
if (typeof window !== 'undefined') {
  (window as any).useAuthStore = useAuthStore;
} 