import type { APIRoute } from 'astro';
import { validateAuth, createAuthResponse, createAuthError } from '../../../lib/auth-middleware';

export const prerender = false;

interface BroadcastRequest {
  subject: string;
  title: string;
  content: string;
  articleUrl?: string;
  previewText?: string;
  category?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // 🛡️ SECURITY: Require admin authentication
    const auth = await validateAuth(request);
    if (!auth || !auth.isAdmin) {
      return createAuthResponse('Admin authentication required for broadcasting');
    }

    const body: BroadcastRequest = await request.json();
    const { subject, title, content, articleUrl, previewText, category } = body;

    // Validate required fields
    if (!subject || !title || !content) {
      return new Response(JSON.stringify({ 
        error: 'Subject, title, and content are required' 
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

    // Create newsletter HTML template (simplified for better compatibility)
    const newsletterHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px;">
    
    <!-- Header -->
    <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #16a085, #2c3e50); border-radius: 8px; margin-bottom: 30px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🕌 Islamic Roadmap Newsletter</h1>
      ${category ? `<p style="color: #ecf0f1; margin: 10px 0 0 0; font-size: 14px;">📚 ${category}</p>` : ''}
    </div>

    <!-- Main Content -->
    <h2 style="color: #2c3e50; margin-bottom: 20px;">${title}</h2>
    
    ${previewText ? `<div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a085;"><p style="color: #555; margin: 0; font-style: italic;">${previewText}</p></div>` : ''}

    <div style="color: #555; font-size: 16px; margin-bottom: 30px;">
      ${content.replace(/\n/g, '<br>')}
    </div>

    ${articleUrl ? `<div style="text-align: center; margin: 30px 0;"><a href="${articleUrl}" style="display: inline-block; background: #16a085; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-weight: bold;">📖 Baca Selengkapnya</a></div>` : ''}

    <!-- Learning Reminder -->
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="color: #2c3e50; margin-top: 0;">🎯 Jangan Lupa:</h3>
      <ul style="color: #555; padding-left: 20px;">
        <li>Update progress learning Anda di website</li>
        <li>Berikan rating dan review untuk resource yang sudah dipelajari</li>
        <li>Bagikan insight dengan komunitas learner</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://islamicroadmap.com" style="color: #16a085; text-decoration: none; font-weight: bold;">🌐 Kunjungi Islamic Roadmap</a>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p style="color: #777; font-size: 14px;">
        Barakallahu feekum wa jazakumullahu khairan<br>
        Tim Islamic Roadmap 🤲
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 12px; margin: 0;">
        © 2024 Islamic Roadmap. Email ini dikirim karena Anda telah subscribe newsletter kami.<br>
        <a href="{{unsubscribe}}" style="color: #16a085;">Unsubscribe</a> jika tidak ingin menerima email lagi.
      </p>
    </div>
  </div>
</body>
</html>`;

    // Create text version
    const newsletterText = `
      ${title}
      
      ${previewText ? `${previewText}\n\n` : ''}
      
      ${content}
      
      ${articleUrl ? `\nBaca selengkapnya: ${articleUrl}\n` : ''}
      
      Jangan lupa:
      - Update progress learning Anda di website
      - Berikan rating dan review untuk resource yang sudah dipelajari
      - Bagikan insight dengan komunitas learner
      
      Kunjungi Islamic Roadmap: https://islamicroadmap.com
      
      Barakallahu feekum wa jazakumullahu khairan
      Tim Islamic Roadmap
    `;

    // Send newsletter to all subscribers using Brevo email campaigns
    const campaignData = {
      name: `Newsletter: ${title} - ${new Date().toISOString().split('T')[0]}`,
      subject: subject,
      type: 'classic',
      htmlContent: newsletterHTML,
      textContent: newsletterText,
      sender: {
        name: "Islamic Roadmap",
        email: "diar@islamicroadmap.cloud" // Use the correct verified sender email
      },
      recipients: {
        listIds: [parseInt(BREVO_LIST_ID)]
      }
      // Remove scheduledAt to send immediately
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
      console.error('Failed to create campaign:', campaignResult);
      return new Response(JSON.stringify({ 
        error: 'Failed to create newsletter campaign',
        details: campaignResult 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Send the campaign immediately
    try {
      const sendResponse = await fetch(`https://api.brevo.com/v3/emailCampaigns/${campaignResult.id}/sendNow`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'api-key': BREVO_API_KEY,
        }
      });

      const sendResult = await sendResponse.json();
      
      if (sendResponse.ok) {
        // 🛡️ SECURITY: Log newsletter broadcast for audit
        console.log(`📧 NEWSLETTER BROADCAST: ${auth.user.email} sent "${title}" to list ${BREVO_LIST_ID}`);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Newsletter berhasil dikirim ke semua subscriber!',
          campaign_id: campaignResult.id,
          sent_at: new Date().toISOString(),
          list_id: BREVO_LIST_ID
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        return new Response(JSON.stringify({ 
          success: true,
          warning: true,
          message: 'Campaign berhasil dibuat tapi belum terkirim otomatis. Silakan kirim manual dari Brevo dashboard.',
          campaign_id: campaignResult.id,
          campaign_url: `https://app.brevo.com/campaigns/classic/edit/${campaignResult.id}`,
          list_id: BREVO_LIST_ID,
          send_error: sendResult
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
    } catch (sendError) {
      return new Response(JSON.stringify({ 
        success: true,
        warning: true,
        message: 'Campaign berhasil dibuat tapi belum terkirim otomatis. Silakan kirim manual dari Brevo dashboard.',
        campaign_id: campaignResult.id,
        campaign_url: `https://app.brevo.com/campaigns/classic/edit/${campaignResult.id}`,
        list_id: BREVO_LIST_ID,
        send_error: sendError.message
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Newsletter broadcast error:', error.message);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: 'Gagal mengirim newsletter'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 