import type { APIContext } from 'astro';
import { supabase } from './supabase';

export interface AuthValidation {
  user: any;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export async function validateAuth(request: Request): Promise<AuthValidation | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    // Get user role from database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      return {
        user,
        isAuthenticated: true,
        isAdmin: false,
        isSuperAdmin: false
      };
    }

    const role = userData.role || 'user';
    const isActive = userData.is_active !== false;

    if (!isActive) {
      return null;
    }

    return {
      user,
      isAuthenticated: true,
      isAdmin: role === 'admin' || role === 'super_admin',
      isSuperAdmin: role === 'super_admin'
    };

  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

export function createAuthResponse(message: string, status: number = 401) {
  return new Response(JSON.stringify({ 
    error: message,
    code: 'AUTH_REQUIRED' 
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export function createAuthError(message: string, status: number = 403) {
  return new Response(JSON.stringify({ 
    error: message,
    code: 'INSUFFICIENT_PERMISSIONS' 
  }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
} 