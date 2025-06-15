import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    // 🚨 DEVELOPMENT ONLY - Remove in production!
    if (import.meta.env.PROD) {
      return new Response(JSON.stringify({ 
        error: 'This endpoint is only available in development' 
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { email, role = 'super_admin' } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
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

    // First, try to find the user in the database
    const { data: existingUser, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('Database error:', findError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (existingUser) {
      // User exists, update their role
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          role: role,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update user role' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      console.log(`🔥 DEV: Updated ${email} to ${role}`);

      return new Response(JSON.stringify({ 
        success: true,
        message: `User ${email} updated to ${role}`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          isAdmin: updatedUser.role === 'admin' || updatedUser.role === 'super_admin',
          isSuperAdmin: updatedUser.role === 'super_admin',
          is_active: updatedUser.is_active
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } else {
      // User doesn't exist, create them (this might happen if they haven't logged in yet)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'User not found in database',
        message: 'Please login first, then run this endpoint again'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Set admin error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 