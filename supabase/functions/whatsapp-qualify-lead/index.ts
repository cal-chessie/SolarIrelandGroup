// ============================================================================
// WhatsApp Qualify Lead — Admin endpoint to manually qualify/review WhatsApp leads
// ============================================================================
// GET: List all WhatsApp conversations with filtering
// PATCH: Update conversation status, stage, or trigger manual actions
// POST: Trigger a manual booking from collected WhatsApp data
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify admin access
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin role
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return new Response('Invalid token', { status: 401, headers: corsHeaders })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    // ============================================================================
    // GET: List WhatsApp conversations
    // ============================================================================
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const status = url.searchParams.get('status')
      const stage = url.searchParams.get('stage')
      const minScore = url.searchParams.get('min_score')
      const limit = parseInt(url.searchParams.get('limit') || '50')

      let query = supabase
        .from('whatsapp_conversations')
        .select(`
          *,
          survey_bookings:survey_booking_id (
            id, reference, status, first_name, last_name, preferred_date
          ),
          customer:customer_id (
            id, reference, first_name, last_name, status
          )
        `)
        .order('last_message_at', { ascending: false })
        .limit(limit)

      if (status) query = query.eq('status', status)
      if (stage) query = query.eq('lead_stage', stage)
      if (minScore) query = query.gte('qualification_score', parseInt(minScore))

      const { data, error } = await query

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ data, count: data?.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ============================================================================
    // PATCH: Update conversation
    // ============================================================================
    if (req.method === 'PATCH') {
      const body = await req.json()
      const { id, status, lead_stage, handoff_to, handoff_reason } = body

      if (!id) {
        return new Response('Missing conversation id', {
          status: 400, headers: corsHeaders,
        })
      }

      const updateData: Record<string, unknown> = {}
      if (status) updateData.status = status
      if (lead_stage) updateData.lead_stage = lead_stage
      if (handoff_to) {
        updateData.handoff_to = handoff_to
        updateData.status = 'handed_off'
      }
      if (handoff_reason) updateData.handoff_reason = handoff_reason

      const { data, error } = await supabase
        .from('whatsapp_conversations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ============================================================================
    // POST: Create booking from WhatsApp lead data
    // ============================================================================
    if (req.method === 'POST') {
      const body = await req.json()
      const { conversation_id } = body

      if (!conversation_id) {
        return new Response('Missing conversation_id', {
          status: 400, headers: corsHeaders,
        })
      }

      // Load conversation
      const { data: conversation, error: convError } = await supabase
        .from('whatsapp_conversations')
        .select()
        .eq('id', conversation_id)
        .single()

      if (convError || !conversation) {
        return new Response('Conversation not found', {
          status: 404, headers: corsHeaders,
        })
      }

      const cd = conversation.collected_data as Record<string, unknown>
      if (!cd.county || !cd.email || !cd.address || !cd.property_type || !cd.roof_type) {
        return new Response(
          'Insufficient data for booking. Need: county, email, address, property_type, roof_type',
          { status: 400, headers: corsHeaders }
        )
      }

      // Generate reference and create booking
      const reference = await supabase.rpc('gen_reference_number').then(r => r.data)

      const nameParts = ((cd.full_name as string) || '').split(' ')

      const { data: booking, error: bookingError } = await supabase
        .from('survey_bookings')
        .insert({
          reference,
          first_name: (cd.first_name as string) || nameParts[0] || 'Unknown',
          last_name: (cd.last_name as string) || nameParts.slice(1).join(' ') || '',
          email: cd.email,
          phone: conversation.phone_number,
          address: cd.address,
          county: cd.county,
          property_type: cd.property_type,
          roof_type: cd.roof_type,
          interests: cd.interests || ['Solar PV'],
          preferred_date: cd.preferred_date || getDefaultDate(),
          preferred_time: cd.preferred_time || 'Morning (9-12)',
          household_size: cd.household_size || null,
          current_bill: cd.current_bill || null,
          status: 'pending',
          source_page: 'whatsapp-bot-admin',
        })
        .select()
        .single()

      if (bookingError) {
        return new Response(JSON.stringify({ error: bookingError.message }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Update conversation
      await supabase
        .from('whatsapp_conversations')
        .update({
          survey_booking_id: booking.id,
          lead_stage: 'qualified',
          status: 'completed',
          qualification_score: 100,
        })
        .eq('id', conversation_id)

      return new Response(JSON.stringify({ data: booking }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  } catch (err) {
    console.error('[WhatsApp Admin] Error:', err)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})

function getDefaultDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().split('T')[0]
}
