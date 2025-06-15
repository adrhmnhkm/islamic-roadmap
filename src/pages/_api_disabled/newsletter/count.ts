import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // This endpoint provides read-only newsletter stats and is safe for public access
    // Admin authentication not required for simple subscriber count display
    
    // Check if we have Brevo API configured (simpler approach)
    const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
    const BREVO_LIST_ID = import.meta.env.BREVO_LIST_ID;

    if (BREVO_API_KEY && BREVO_LIST_ID) {
      try {
        // Get subscriber count from Brevo directly
        const response = await fetch(`https://api.brevo.com/v3/contacts/lists/${BREVO_LIST_ID}`, {
          headers: {
            'Accept': 'application/json',
            'api-key': BREVO_API_KEY,
          }
        });

        if (response.ok) {
          const data = await response.json();
          const subscriberCount = data.totalSubscribers || 0;
          
          console.log(`📊 Newsletter subscriber count from Brevo: ${subscriberCount}`);
          
          return new Response(JSON.stringify({ 
            success: true, 
            count: subscriberCount,
            source: 'brevo'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          console.error('Brevo API error:', response.status, await response.text());
        }
      } catch (brevoError) {
        console.error('Error fetching from Brevo:', brevoError);
      }
    }

    // Fallback: Return default count if Brevo fails
    console.log('📊 Using fallback subscriber count');
    
    return new Response(JSON.stringify({ 
      success: true, 
      count: 0,
      source: 'fallback',
      message: 'Using fallback count - check Brevo configuration'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Newsletter count error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error',
      count: 0
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 