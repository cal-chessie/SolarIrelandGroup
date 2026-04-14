// ============================================================================
// Admin Dashboard API — Single endpoint for all admin operations
// ============================================================================
// GET /dashboard — Returns all data needed for the admin dashboard in one call:
//   - Lead funnel stats (new, qualified, converted today/week/month)
//   - Recent leads (contacts, surveys, WhatsApp, bill analyses)
//   - Active WhatsApp conversations with qualification scores
//   - Upcoming surveys
//   - Pending automation tasks
//   - GBP review stats + latest reviews
//   - Social post schedule
//   - Automation rule status
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return new Response('Invalid token', { status: 401, headers: corsHeaders })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
    const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString()

    // Run all queries in parallel
    const [
      contactStats,
      surveyStats,
      whatsappConvs,
      upcomingSurveys,
      pendingTasks,
      gbpReviews,
      gbpReviewStats,
      recentReviews,
      socialPosts,
      automationRules,
      automationStats,
      recentActivity,
    ] = await Promise.all([
      // Contact form stats
      Promise.all([
        supabase.from('contact_submissions').select('id', { count: 'exact' }).eq('status', 'new').gte('created_at', today),
        supabase.from('contact_submissions').select('id', { count: 'exact' }).gte('created_at', weekAgo),
        supabase.from('contact_submissions').select('id', { count: 'exact' }).gte('created_at', monthAgo),
      ]),
      // Survey booking stats
      Promise.all([
        supabase.from('survey_bookings').select('id', { count: 'exact' }).eq('status', 'pending').gte('created_at', today),
        supabase.from('survey_bookings').select('id, reference, first_name, last_name, email, phone, preferred_date, status, created_at').order('created_at', { ascending: false }).limit(10),
      ]),
      // WhatsApp conversations
      supabase.from('whatsapp_conversations').select('id, phone_number, display_name, lead_stage, qualification_score, collected_data, status, last_message_at, session_count, survey_booking_id').order('last_message_at', { ascending: false }).limit(20),
      // Upcoming surveys
      supabase.from('survey_bookings').select('id, reference, first_name, last_name, email, phone, address, county, preferred_date, preferred_time, status').eq('status', 'pending').gte('preferred_date', today).order('preferred_date', { ascending: true }).limit(10),
      // Pending automation tasks
      supabase.from('automation_tasks').select('id, action_type, status, scheduled_at, created_at, error_message, payload, automation_rules(name)').is('status', 'in', ['pending', 'failed']).order('created_at', { ascending: false }).limit(15),
      // GBP reviews
      supabase.from('gbp_reviews').select('*').order('created_at', { ascending: false }).limit(20),
      // GBP review stats
      Promise.all([
        supabase.from('gbp_reviews').select('rating'),
        supabase.from('gbp_reviews').select('id', { count: 'exact' }).gte('created_at', monthAgo),
      ]),
      // Recent 5-star reviews (for testimonials)
      supabase.from('gbp_reviews').select('reviewer_name, rating, text, customer_ref, created_at').eq('rating', 5).order('created_at', { ascending: false }).limit(5),
      // Social post schedule
      supabase.from('social_posts').select('id, content, platforms, scheduled_at, status, source, created_at').is('status', 'in', ['draft', 'scheduled']).order('scheduled_at', { ascending: true }).limit(10),
      // Automation rules
      supabase.from('automation_rules').select('id, name, trigger_type, action_type, is_active, run_count, last_run_at').order('is_active', { ascending: false }).order('run_count', { ascending: false }),
      // Automation task stats
      Promise.all([
        supabase.from('automation_tasks').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('automation_tasks').select('id', { count: 'exact' }).eq('status', 'failed'),
        supabase.from('automation_tasks').select('id', { count: 'exact' }).gte('created_at', weekAgo),
      ]),
      // Recent activity (all leads combined)
      Promise.all([
        supabase.from('contact_submissions').select('id, name, email, county, status, created_at, source_page').order('created_at', { ascending: false }).limit(5),
        supabase.from('survey_bookings').select('id, reference, first_name, last_name, county, status, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('whatsapp_conversations').select('id, phone_number, display_name, lead_stage, qualification_score, created_at').order('created_at', { ascending: false }).limit(5),
      ]),
    ])

    // Calculate averages
    const allReviews = gbpReviewStats[0]?.data || []
    const avgRating = allReviews.length > 0
      ? (allReviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / allReviews.length).toFixed(1)
      : '0.0'

    const dashboard = {
      meta: { generated_at: now.toISOString(), version: '1.0' },

      lead_funnel: {
        new_contacts_today: contactStats[0].count,
        contacts_this_week: contactStats[1].count,
        contacts_this_month: contactStats[2].count,
        pending_surveys_today: surveyStats[0].count,
      },

      recent_leads: {
        contacts: contactStats[1].data,
        surveys: surveyStats[1].data,
        whatsapp: whatsappConvs.data,
      },

      reviews: {
        average_rating: avgRating,
        total_reviews: allReviews.length,
        new_reviews_this_month: gbpReviewStats[1].count,
        latest: gbpReviews.data,
        recent_five_star: recentReviews.data,
      },

      surveys: {
        upcoming: upcomingSurveys.data,
        recent_bookings: surveyStats[1].data,
      },

      whatsapp: {
        conversations: whatsappConvs.data,
        qualified: (whatsappConvs.data || []).filter((c: any) =>
          c.qualification_score >= 70 || c.lead_stage === 'qualified'
        ).length,
        active: (whatsappConvs.data || []).filter((c: any) =>
          c.status === 'active'
        ).length,
      },

      automation: {
        pending_tasks: automationStats[0].count,
        failed_tasks: automationStats[1].count,
        tasks_this_week: automationStats[2].count,
        tasks: pendingTasks.data,
        rules: automationRules.data,
      },

      social: {
        scheduled_posts: socialPosts.data,
      },

      activity: {
        contacts: recentActivity[0].data,
        surveys: recentActivity[1].data,
        whatsapp: recentActivity[2].data,
      },
    }

    return new Response(JSON.stringify(dashboard), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[Dashboard] Error:', err)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})
