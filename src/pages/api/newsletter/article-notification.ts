import type { APIRoute } from 'astro';
import { validateAuth, createAuthResponse, createAuthError } from '../../../lib/auth-middleware';

export const prerender = false;

interface ArticleNotificationRequest {
  articleTitle: string;
  articleUrl: string;
  category: string;
  description: string;
  author?: string;
  customMessage?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // 🛡️ SECURITY: Require admin authentication
    const auth = await validateAuth(request);
    if (!auth || !auth.isAdmin) {
      return createAuthResponse('Admin authentication required for article notifications');
    }

    const body: ArticleNotificationRequest = await request.json();
    const { articleTitle, articleUrl, category, description, author, customMessage } = body;

    // Validate required fields
    if (!articleTitle || !articleUrl || !category || !description) {
      return new Response(JSON.stringify({ 
        error: 'Article title, URL, category, and description are required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Brevo API credentials
    const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
    const BREVO_LIST_ID = import.meta.env.BREVO_LIST_ID;

    if (!BREVO_API_KEY || !BREVO_LIST_ID) {
      return new Response(JSON.stringify({ 
        error: 'Brevo configuration not complete' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate automatic newsletter content
    const categoryEmoji = {
      'Al-Quran & Tajwid': '📖',
      'Hadits & Sunnah': '📜',
      'Akidah': '💡',
      'Ibadah & Fiqh': '🕌',
      'Akhlak & Tasawuf': '✨',
      'Sejarah Islam': '📚'
    };

    const emoji = categoryEmoji[category as keyof typeof categoryEmoji] || '📚';
    const subject = `${emoji} Artikel Baru: ${articleTitle}`;
    const title = `Artikel Baru di ${category}`;

    const newsletterContent = customMessage || `Assalamu'alaikum warahmatullahi wabarakatuh,

Alhamdulillahi rabbil alamiin, kami dengan senang hati mengumumkan bahwa artikel baru telah ditambahkan ke Islamic Roadmap!

📝 **${articleTitle}**

${description}

Artikel ini telah dikurasi dengan teliti untuk membantu perjalanan pembelajaran Islam Anda. Kami berharap konten ini dapat memberikan manfaat dan memperdalam pemahaman Anda.

${author ? `✍️ **Penulis/Sumber**: ${author}\n` : ''}

Jangan lupa untuk:
- Membaca artikel dengan penuh konsentrasi
- Mencatat poin-poin penting
- Memberikan rating dan feedback setelah membaca
- Membagikan ilmu yang bermanfaat kepada orang lain

Barakallahu feekum wa jazakumullahu khairan.

Tim Islamic Roadmap 🤲`;

    // Create newsletter HTML template
    const newsletterHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${articleTitle}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; margin-top: 20px;">
          
          <!-- Header -->
          <div style="text-align: center; padding: 20px 0; background: linear-gradient(135deg, #16a085, #2c3e50); border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🕌 Islamic Roadmap</h1>
            <p style="color: #ecf0f1; margin: 10px 0 0 0; font-size: 14px;">${emoji} ${category}</p>
          </div>

          <!-- Main Content -->
          <div style="padding: 0 20px;">
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a085; text-align: center;">
              <p style="color: #16a085; font-size: 18px; font-weight: bold; margin: 0;">
                📝 Artikel Baru Tersedia!
              </p>
            </div>

            <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 28px;">${articleTitle}</h2>
            
            <div style="color: #555; font-size: 16px; margin-bottom: 30px;">
              ${newsletterContent.replace(/\n/g, '<br>')}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${articleUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a085, #2c3e50); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold; font-size: 16px;">
                📖 Baca Artikel Sekarang
              </a>
            </div>

            ${author ? `
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #555; margin: 0; text-align: center;">
                  <strong>✍️ Penulis/Sumber:</strong> ${author}
                </p>
              </div>
            ` : ''}

            <!-- Learning Reminder -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">🎯 Tips Membaca:</h3>
              <ul style="color: #555; padding-left: 20px; margin-bottom: 0;">
                <li>Baca dengan penuh konsentrasi dan khusyuk</li>
                <li>Catat poin-poin penting untuk referensi</li>
                <li>Berikan rating dan feedback setelah membaca</li>
                <li>Amalkan ilmu yang telah dipelajari</li>
                <li>Bagikan kepada orang lain jika bermanfaat</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://islamicroadmap.com" style="color: #16a085; text-decoration: none; font-weight: bold;">
                🌐 Jelajahi Lebih Banyak Konten
              </a>
            </div>

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
    `;

    // Create text version
    const newsletterText = `
      ${title}
      
      ${newsletterContent}
      
      Baca artikel: ${articleUrl}
      
      ${author ? `Penulis/Sumber: ${author}\n` : ''}
      
      Tips Membaca:
      - Baca dengan penuh konsentrasi dan khusyuk
      - Catat poin-poin penting untuk referensi
      - Berikan rating dan feedback setelah membaca
      - Amalkan ilmu yang telah dipelajari
      - Bagikan kepada orang lain jika bermanfaat
      
      Jelajahi lebih banyak: https://islamicroadmap.com
      
      Barakallahu feekum wa jazakumullahu khairan
      Tim Islamic Roadmap
    `;

    // Send newsletter to all subscribers using Brevo email campaigns
    const campaignData = {
      name: `Artikel Baru: ${articleTitle} - ${new Date().toISOString().split('T')[0]}`,
      subject: subject,
      type: 'classic',
      htmlContent: newsletterHTML,
      textContent: newsletterText,
      sender: {
        name: "Islamic Roadmap",
        email: "noreply@islamicroadmap.com" // Ganti dengan email sender Anda
      },
      recipients: {
        listIds: [parseInt(BREVO_LIST_ID)]
      },
      scheduledAt: new Date().toISOString() // Send immediately
    };

    const campaignResponse = await fetch('https://api.brevo.com/v3/emailCampaigns', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify(campaignData)
    });

    const campaignResult = await campaignResponse.json();

    if (!campaignResponse.ok) {
      console.error('❌ Failed to create article notification campaign:', campaignResult);
      return new Response(JSON.stringify({ 
        error: 'Failed to create article notification campaign',
        details: campaignResult 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send the campaign immediately
    const sendResponse = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaignResult.id}/sendNow`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'api-key': BREVO_API_KEY,
      }
    });

    const sendResult = await sendResponse.json();

    if (!sendResponse.ok) {
      console.error('❌ Failed to send article notification:', sendResult);
      return new Response(JSON.stringify({ 
        error: 'Campaign created but failed to send',
        campaign_id: campaignResult.id,
        details: sendResult 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 🛡️ SECURITY: Log article notification for audit
    console.log(`📧 ARTICLE NOTIFICATION: ${auth.user.email} sent notification for "${articleTitle}" to list ${BREVO_LIST_ID}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Notifikasi artikel "${articleTitle}" berhasil dikirim ke semua subscriber!`,
      campaign_id: campaignResult.id,
      article_url: articleUrl,
      subscribers_notified: 'all_active'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Article notification error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'Gagal mengirim notifikasi artikel'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 