import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

// 🛡️ SECURITY: Simple rate limiter for this endpoint
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // Max 10 requests per minute per IP
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  
  if (!rateLimiter.has(key)) {
    rateLimiter.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  const limit = rateLimiter.get(key)!;
  
  if (now > limit.resetTime) {
    rateLimiter.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT) {
    return false;
  }
  
  limit.count++;
  return true;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 🛡️ SECURITY: Rate limiting
    const clientIP = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ 
        error: 'Too many requests. Please try again later.' 
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { email } = body;

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

    // Check user in database by email using admin client
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, is_active, full_name, created_at, updated_at')
      .eq('email', email)
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

    // 🛡️ SECURITY: Log role check for audit
    console.log(`🔍 ROLE CHECK: ${email} checked their own role - ${user.role}`);

    return new Response(JSON.stringify({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'user',
        isAdmin: user.role === 'admin' || user.role === 'super_admin',
        isSuperAdmin: user.role === 'super_admin',
        is_active: user.is_active,
        full_name: user.full_name,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Check role error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 