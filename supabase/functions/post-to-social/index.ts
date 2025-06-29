
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SocialPostRequest {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin';
  caption: string;
  imageUrl?: string;
  userId: string;
  posterId?: string;
  eventId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { platform, caption, imageUrl, userId, posterId, eventId }: SocialPostRequest = await req.json();

    console.log('Posting to social media:', { platform, userId });

    let postResult;

    switch (platform) {
      case 'facebook':
        postResult = await postToFacebook(caption, imageUrl);
        break;
      case 'instagram':
        postResult = await postToInstagram(caption, imageUrl);
        break;
      case 'twitter':
        postResult = await postToTwitter(caption, imageUrl);
        break;
      case 'linkedin':
        postResult = await postToLinkedIn(caption, imageUrl);
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // Log the successful post
    await supabaseClient.from('social_posts').insert({
      user_id: userId,
      platform,
      caption,
      image_url: imageUrl,
      poster_id: posterId,
      event_id: eventId,
      external_post_id: postResult.id,
      status: 'posted',
      posted_at: new Date().toISOString()
    });

    return new Response(JSON.stringify({ 
      success: true, 
      postId: postResult.id,
      platform 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error posting to social media:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function postToFacebook(caption: string, imageUrl?: string) {
  const accessToken = Deno.env.get('META_ACCESS_TOKEN');
  const pageId = Deno.env.get('FACEBOOK_PAGE_ID');
  
  if (!accessToken || !pageId) {
    throw new Error('Facebook credentials not configured');
  }

  const url = `https://graph.facebook.com/v18.0/${pageId}/photos`;
  
  const body: any = {
    caption,
    access_token: accessToken
  };

  if (imageUrl) {
    body.url = imageUrl;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Facebook API error: ${error.error?.message || 'Unknown error'}`);
  }

  return await response.json();
}

async function postToInstagram(caption: string, imageUrl?: string) {
  const accessToken = Deno.env.get('META_ACCESS_TOKEN');
  const instagramAccountId = Deno.env.get('INSTAGRAM_ACCOUNT_ID');
  
  if (!accessToken || !instagramAccountId) {
    throw new Error('Instagram credentials not configured');
  }

  if (!imageUrl) {
    throw new Error('Instagram posts require an image');
  }

  // Step 1: Create media container
  const containerResponse = await fetch(`https://graph.facebook.com/v18.0/${instagramAccountId}/media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      caption,
      access_token: accessToken
    })
  });

  if (!containerResponse.ok) {
    const error = await containerResponse.json();
    throw new Error(`Instagram container error: ${error.error?.message || 'Unknown error'}`);
  }

  const containerData = await containerResponse.json();
  
  // Step 2: Publish the media
  const publishResponse = await fetch(`https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creation_id: containerData.id,
      access_token: accessToken
    })
  });

  if (!publishResponse.ok) {
    const error = await publishResponse.json();
    throw new Error(`Instagram publish error: ${error.error?.message || 'Unknown error'}`);
  }

  return await publishResponse.json();
}

async function postToTwitter(caption: string, imageUrl?: string) {
  // Twitter implementation would go here
  // For now, return a mock response
  console.log('Twitter posting not yet implemented');
  return { id: 'twitter_mock_' + Date.now() };
}

async function postToLinkedIn(caption: string, imageUrl?: string) {
  // LinkedIn implementation would go here
  // For now, return a mock response
  console.log('LinkedIn posting not yet implemented');
  return { id: 'linkedin_mock_' + Date.now() };
}
