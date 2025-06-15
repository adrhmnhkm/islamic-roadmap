import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { validateAuth, createAuthResponse, createAuthError } from '../../../lib/auth-middleware';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // 🛡️ SECURITY: Validate authentication
    const auth = await validateAuth(request);
    if (!auth) {
      return createAuthResponse('Authentication required');
    }

    // 🛡️ SECURITY: Only super admins can set admin roles
    if (!auth.isSuperAdmin) {
      return createAuthError('Only super administrators can set admin roles');
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Email and role are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid role' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 🛡️ SECURITY: Prevent self-demotion for super admins
    if (auth.user.email === email && auth.isSuperAdmin && role !== 'super_admin') {
      return createAuthError('Super administrators cannot demote themselves');
    }

    // Get user by email from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const authUser = authUsers.users.find(u => u.email === email);
    if (!authUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Update or insert user in users table
    const { error: upsertError } = await supabase
      .from('users')
      .upsert({
        id: authUser.id,
        email: authUser.email!,
        full_name: authUser.user_metadata?.full_name || authUser.email,
        avatar_url: authUser.user_metadata?.avatar_url,
        role: role,
        is_active: true,
        created_at: authUser.created_at,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (upsertError) {
      console.error('Error updating user role:', upsertError);
      return new Response(JSON.stringify({ error: 'Failed to update user role' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 🛡️ SECURITY: Log admin role assignment for audit
    console.log(`🔐 ADMIN SET: ${auth.user.email} set ${email} role to ${role}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `User ${email} role updated to ${role}`,
      user: {
        id: authUser.id,
        email: authUser.email,
        role: role
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Set admin error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 