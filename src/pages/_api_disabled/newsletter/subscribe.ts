import type { APIRoute } from 'astro';

// Mark as server-rendered for POST requests
export const prerender = false;

// 🛡️ SECURITY: Simple in-memory rate limiter (for production, use Redis)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; // Max 3 requests per 5 minutes per IP
const RATE_WINDOW = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;
  
  if (!rateLimiter.has(key)) {
    rateLimiter.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  const limit = rateLimiter.get(key)!;
  
  if (now > limit.resetTime) {
    // Reset the limit
    rateLimiter.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT) {
    return false;
  }
  
  limit.count++;
  return true;
}

// 📧 Helper function to send welcome email
async function sendWelcomeEmail(email: string, firstName: string = ''): Promise<boolean> {
  try {
    const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
    
    if (!BREVO_API_KEY) {
      console.error('❌ Brevo API key not found for welcome email');
      return false;
    }

    const welcomeEmailData = {
      sender: {
        name: "Islamic Roadmap",
        email: "noreply@islamicroadmap.com" // Ganti dengan email sender Anda
      },
      to: [
        {
          email: email,
          name: firstName || email.split('@')[0]
        }
      ],
      subject: "🕌 Selamat Datang di Islamic Roadmap Newsletter!",
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Selamat Datang di Islamic Roadmap</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; margin-top: 20px;">
            
            <!-- Header -->
            <div style="text-align: center; padding: 20px 0; background: linear-gradient(135deg, #16a085, #2c3e50); border-radius: 10px; margin-bottom: 30px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🕌 Islamic Roadmap</h1>
              <p style="color: #ecf0f1; margin: 10px 0 0 0; font-size: 16px;">Panduan Belajar Islam Terarah</p>
            </div>

            <!-- Welcome Message -->
            <div style="padding: 0 20px;">
              <h2 style="color: #2c3e50; margin-bottom: 20px;">Assalamu'alaikum ${firstName ? firstName : 'Akhi/Ukhti'}! 👋</h2>
              
              <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
                Barakallahu feeki telah bergabung dengan <strong>Islamic Roadmap Newsletter</strong>! 
                Kami sangat senang Anda menjadi bagian dari komunitas pembelajaran Islam yang terstruktur.
              </p>

              <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a085;">
                <h3 style="color: #16a085; margin-top: 0;">✨ Apa yang akan Anda dapatkan?</h3>
                <ul style="color: #555; padding-left: 20px;">
                  <li>📚 Update artikel terbaru tentang pembelajaran Islam</li>
                  <li>🎯 Tips belajar yang efektif dan terarah</li>
                  <li>📖 Rekomendasi resource berkualitas</li>
                  <li>🔔 Notifikasi progress tracking dan fitur baru</li>
                  <li>💬 Insight dari komunitas learner</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://islamicroadmap.com" style="display: inline-block; background: linear-gradient(135deg, #16a085, #2c3e50); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; font-size: 16px;">
                  🚀 Mulai Belajar Sekarang
                </a>
              </div>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c3e50; margin-top: 0;">🎯 Recommended Learning Path:</h3>
                <ol style="color: #555; padding-left: 20px;">
                  <li><strong>Al-Quran & Tajwid</strong> - Fondasi utama</li>
                  <li><strong>Hadits & Sunnah</strong> - Pelengkap Al-Quran</li>
                  <li><strong>Akidah</strong> - Keimanan yang kuat</li>
                  <li><strong>Ibadah & Fiqh</strong> - Praktik sehari-hari</li>
                  <li><strong>Akhlak & Tasawuf</strong> - Penyempurnaan diri</li>
                </ol>
              </div>

              <p style="color: #555; font-size: 16px; margin-bottom: 30px;">
                Jangan lupa untuk mengecek progress tracking Anda dan memberikan feedback pada setiap resource yang telah dipelajari. 
                Hal ini akan membantu komunitas dan memperbaiki pengalaman belajar bersama.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #777; font-size: 14px; margin: 0;">
                  Barakallahu feekum wa jazakumullahu khairan<br>
                  Tim Islamic Roadmap 🤲
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="text-align: center; padding-top: 30px; border-top: 1px solid #eee; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 Islamic Roadmap. Semua hak cipta dilindungi.<br>
                Email ini dikirim karena Anda telah subscribe newsletter kami.<br>
                <a href="{{unsubscribe}}" style="color: #16a085;">Unsubscribe</a> jika tidak ingin menerima email lagi.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Assalamu'alaikum ${firstName ? firstName : 'Akhi/Ukhti'}!

        Barakallahu feeki telah bergabung dengan Islamic Roadmap Newsletter!

        Apa yang akan Anda dapatkan:
        - Update artikel terbaru tentang pembelajaran Islam
        - Tips belajar yang efektif dan terarah  
        - Rekomendasi resource berkualitas
        - Notifikasi progress tracking dan fitur baru
        - Insight dari komunitas learner

        Mulai belajar sekarang: https://islamicroadmap.com

        Barakallahu feekum wa jazakumullahu khairan
        Tim Islamic Roadmap
      `
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(welcomeEmailData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Welcome email sent successfully:', result);
      return true;
    } else {
      console.error('❌ Failed to send welcome email:', result);
      return false;
    }

  } catch (error) {
    console.error('❌ Welcome email error:', error);
    return false;
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 🛡️ SECURITY: Rate limiting
    const clientIP = clientAddress || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Terlalu banyak permintaan. Coba lagi dalam 5 menit.',
        code: 'RATE_LIMITED'
      }), {
        status: 429,
        headers: { 
          'Content-Type': 'application/json',
          'Retry-After': '300' // 5 minutes
        }
      });
    }

    // Check if request has body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('❌ Invalid content-type:', contentType);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Content-Type harus application/json' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse JSON with better error handling
    let body;
    try {
      const text = await request.text();
      console.log('📝 Raw request text:', text);
      
      if (!text || text.trim() === '') {
        throw new Error('Empty request body');
      }
      
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Format data tidak valid' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { email, source, firstName } = body;

    // 🛡️ SECURITY: Enhanced email validation
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Email tidak valid' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Format email tidak valid' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 🛡️ SECURITY: Sanitize inputs
    const sanitizedSource = source && typeof source === 'string' ? source.slice(0, 50) : 'website';
    const sanitizedFirstName = firstName && typeof firstName === 'string' ? firstName.slice(0, 50) : '';

    // Brevo API credentials from environment (using import.meta.env for static builds)
    const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
    const BREVO_LIST_ID = import.meta.env.BREVO_LIST_ID;

    console.log('🔑 Environment check:', {
      hasApiKey: !!BREVO_API_KEY,
      hasListId: !!BREVO_LIST_ID,
      listId: BREVO_LIST_ID
    });

    if (!BREVO_API_KEY) {
      console.error('❌ Brevo API key not found in environment');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Konfigurasi server tidak lengkap' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create contact using Brevo v3 API (latest version)
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        email: email,
        attributes: {
          FIRSTNAME: sanitizedFirstName,
          LASTNAME: '',
          SOURCE: sanitizedSource,
          SIGNUP_DATE: new Date().toISOString().split('T')[0],
          LANGUAGE: 'id'
        },
        listIds: BREVO_LIST_ID ? [parseInt(BREVO_LIST_ID)] : [],
        updateEnabled: true, // Update if contact already exists
        emailBlacklisted: false,
        smsBlacklisted: false
      }),
    });

    const brevoData = await brevoResponse.json();

    console.log('📊 Brevo response status:', brevoResponse.status);
    console.log('📊 Brevo response data:', brevoData);

    // Handle different response codes based on Brevo API documentation
    if (brevoResponse.status === 201) {
      // Contact created successfully - NEW SUBSCRIBER
      console.log('✅ New contact created:', brevoData);
      
      // 📧 Send welcome email to new subscriber
      const welcomeEmailSent = await sendWelcomeEmail(email, sanitizedFirstName);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Berhasil berlangganan newsletter! Cek email untuk pesan selamat datang.',
        contact_id: brevoData.id,
        welcome_email_sent: welcomeEmailSent
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else if (brevoResponse.status === 400 && brevoData.code === 'duplicate_parameter') {
      // Contact already exists - this is fine, but no welcome email
      console.log('✅ Contact already exists:', brevoData);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Email sudah terdaftar di newsletter',
        contact_id: null,
        welcome_email_sent: false
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else if (brevoResponse.status === 429) {
      // Rate limit exceeded
      console.error('⚠️ Rate limit exceeded:', brevoData);
      
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Terlalu banyak permintaan. Coba lagi dalam beberapa menit.' 
      }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else if (brevoResponse.status === 401) {
      // Unauthorized - API key issue
      console.error('❌ Unauthorized - API key issue:', brevoData);
      
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Konfigurasi server tidak valid' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } else {
      // Other errors
      console.error('❌ Brevo API error:', brevoResponse.status, brevoData);
      throw new Error(brevoData.message || `Brevo API error: ${brevoResponse.status}`);
    }
    
  } catch (error) {
    console.error('❌ Newsletter subscription error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Terjadi kesalahan sistem. Silakan coba lagi.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 