import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { validateAuth, createAuthResponse, createAuthError } from '../../../lib/auth-middleware';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // 🛡️ SECURITY: Validate authentication
    const auth = await validateAuth(request);
    if (!auth) {
      return createAuthResponse('Authentication required');
    }

    // 🛡️ SECURITY: Only super admins can update roles
    if (!auth.isSuperAdmin) {
      return createAuthError('Only super administrators can update user roles');
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Email and role are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid role. Must be: user, admin, or super_admin' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 🛡️ SECURITY: Prevent self-demotion for super admins
    if (auth.user.email === email && auth.isSuperAdmin && role !== 'super_admin') {
      return createAuthError('Super administrators cannot demote themselves');
    }

    // Use service role key to bypass RLS
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseServiceKey) {
      return new Response(JSON.stringify({ 
        error: 'Service role key not configured' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Update user role in database using admin client
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ 
        role: role,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select('id, email, role, is_active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return new Response(JSON.stringify({ 
          success: false,
          error: 'User not found in database',
          message: 'User needs to be synced to database first'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      console.error('Database error:', error);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 🛡️ SECURITY: Log role change for audit
    console.log(`🔐 ROLE CHANGE: ${auth.user.email} changed ${email} role to ${role}`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `User role updated to ${role}`,
      user: {
        id: data.id,
        email: data.email,
        role: data.role,
        isAdmin: data.role === 'admin' || data.role === 'super_admin',
        isSuperAdmin: data.role === 'super_admin',
        is_active: data.is_active
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Update role error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 