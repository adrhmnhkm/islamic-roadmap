import type { APIRoute } from 'astro';

// Mark as server-rendered for API requests
export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
    const BREVO_LIST_ID = import.meta.env.BREVO_LIST_ID;

    if (!BREVO_API_KEY) {
      throw new Error('Brevo API key not configured');
    }

    // Get list statistics
    const listStatsResponse = await fetch(`https://api.brevo.com/v3/contacts/lists/${BREVO_LIST_ID}`, {
      headers: {
        'Accept': 'application/json',
        'api-key': BREVO_API_KEY,
      },
    });

    const listData = await listStatsResponse.json();

    // Get email campaigns stats (recent)
    const campaignsResponse = await fetch('https://api.brevo.com/v3/emailCampaigns?limit=10&offset=0', {
      headers: {
        'Accept': 'application/json',
        'api-key': BREVO_API_KEY,
      },
    });

    const campaignsData = await campaignsResponse.json();

    // Calculate stats
    const stats = {
      totalSubscribers: listData.totalSubscribers || 0,
      totalBlacklisted: listData.totalBlacklisted || 0,
      totalCampaigns: campaignsData.count || 0,
      recentCampaigns: campaignsData.campaigns?.slice(0, 5) || [],
      listInfo: {
        name: listData.name,
        createdAt: listData.createdAt,
        folderId: listData.folderId
      }
    };

    return new Response(JSON.stringify({
      success: true,
      data: stats
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Brevo stats error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch newsletter stats'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 