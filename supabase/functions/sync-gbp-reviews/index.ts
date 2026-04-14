// ============================================================================
// GBP Sync Reviews — Pull Google Reviews via Business Profile API
// ============================================================================
// Cron job calls this daily to sync new Google reviews.
// Also used to reply to reviews from admin dashboard.
//
// Cron: 0 6 * * * (daily at 6am)
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GBP_API_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1'

interface GoogleReview {
  name: string           // accounts/*/locations/*/reviews/*
  reviewId: string
  reviewer: { displayName: string; profilePhotoUrl?: string }
  starRating: number
  comment: string
  createTime: string
  updateReply?: { comment: string; updateTime: string }
  reviewReply?: { comment: string; updateTime: string }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const accountId = Deno.env.get('GBP_ACCOUNT_ID') // e.g. "accounts/1234567890"
  const accessToken = Deno.env.get('GBP_ACCESS_TOKEN')

  if (!accountId || !accessToken) {
    return new Response('Missing GBP_ACCOUNT_ID or GBP_ACCESS_TOKEN', {
      status: 500, headers: corsHeaders,
    })
  }

  try {
    // Fetch reviews from GBP API
    const res = await fetch(
      `${GBP_API_BASE}/${accountId}/reviews?pageSize=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[GBP] API error:', err)
      return new Response(`GBP API error: ${res.status}`, {
        status: 502, headers: corsHeaders,
      })
    }

    const data = await res.json()
    const reviews: GoogleReview[] = data.reviews || []

    let synced = 0
    let newReviews = 0

    for (const review of reviews) {
      const gbpReviewId = review.reviewId || review.name.split('/').pop()
      const existing = await supabase
        .from('gbp_reviews')
        .select('id')
        .eq('gbp_review_id', gbpReviewId)
        .maybeSingle()

      if (existing) {
        // Update reply if changed
        const replyText = review.updateReply?.comment || review.reviewReply?.comment
        if (replyText) {
          await supabase
            .from('gbp_reviews')
            .update({
              reply_text: replyText,
              replied_at: review.updateReply?.updateTime
                ? new Date(review.updateReply.updateTime).toISOString()
                : null,
              gbp_data: review as unknown as Record<string, unknown>,
            })
            .eq('gbp_review_id', gbpReviewId)
        }
        synced++
      } else {
        // Insert new review
        await supabase.from('gbp_reviews').insert({
          gbp_review_id: gbpReviewId,
          reviewer_name: review.reviewer?.displayName || 'Anonymous',
          reviewer_id: null,
          rating: review.starRating,
          text: review.comment,
          source: 'google',
          gbp_data: review as unknown as Record<string, unknown>,
        })
        newReviews++
        synced++
      }
    }

    // Update average rating in site_settings
    const { data: avgData } = await supabase
      .from('gbp_reviews')
      .select('rating')
      .eq('source', 'google')

    if (avgData && avgData.length > 0) {
      const avg = avgData.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / avgData.length
      await supabase
        .from('site_settings')
        .update({ value: avg.toFixed(1) })
        .eq('key', 'stat_rating')
    }

    return new Response(JSON.stringify({
      status: 'ok',
      total_reviews: reviews.length,
      synced,
      new_reviews: newReviews,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[GBP] Sync error:', err)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})
