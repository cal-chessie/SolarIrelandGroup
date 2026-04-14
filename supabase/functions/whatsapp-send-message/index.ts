// ============================================================================
// WhatsApp AI Message Handler — Processes user messages and generates responses
// ============================================================================
// This is the brain of the WhatsApp bot. It:
// 1. Loads conversation history and bot config from DB
// 2. Loads quick replies for keyword matching
// 3. Uses AI (LLM) to determine intent and generate response
// 4. Advances the lead qualification stage when appropriate
// 5. Sends the response via WhatsApp Business API
// 6. Updates conversation in DB
//
// The AI is prompted with full context: conversation history, collected lead data,
// current qualification stage, and quick reply reference material.
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WHATSAPP_API_URL = 'https://graph.facebook.com/v19.0'

interface IncomingPayload {
  phone: string
  message: string
  conversation_id?: string
  wa_id?: string
  display_name?: string
}

interface QuickReply {
  trigger_keywords: string[]
  category: string
  response_text: string
  follow_up_buttons: Array<{ id: string; title: string }>
  priority: number
}

interface BotConfig {
  greeting_message: string
  qualification_prompt: string
  booking_confirmation: string
  handoff_message: string
  max_session_exchanges: number
  inactivity_timeout_minutes: number
  auto_qualify_score: number
}

interface Conversation {
  id: string
  wa_id: string
  phone_number: string
  status: string
  lead_stage: string
  collected_data: Record<string, unknown>
  messages: Array<{ role: string; content: string; timestamp?: string }>
  qualification_score: number | null
  session_count: number
}

function buildSystemPrompt(
  botConfig: BotConfig,
  conversation: Conversation,
  quickReplies: QuickReply[]
): string {
  const referenceMaterial = quickReplies.map(qr =>
    `[${qr.category.toUpperCase()}] Keywords: ${qr.trigger_keywords.join(', ')}\nResponse: ${qr.response_text}`
  ).join('\n\n')

  return `You are the Solar Ireland WhatsApp assistant. You help Irish homeowners with solar panel enquiries, qualify them as leads, and book free site surveys.

## YOUR BEHAVIOUR
- Be friendly, concise, and helpful. Use Irish context (EUR, SEAI grants, Irish counties).
- Keep messages short — WhatsApp has a 4096 character limit. Aim for 3-5 lines per message.
- Use line breaks and simple formatting for readability.
- Never make up pricing or technical specs. Use the reference material below.
- If asked something outside your knowledge, offer to connect with a human expert.

## QUALIFICATION FLOW
Current stage: ${conversation.lead_stage}
Collected data so far: ${JSON.stringify(conversation.collected_data)}

Stages (advance when you have enough info):
1. greeting → First message, send the greeting
2. interest_check → Determine what they want (solar PV, battery, EV charger)
3. property_type → Ask what type of property (Detached, Semi-D, Terraced, Apartment, Bungalow)
4. roof_type → Ask about roof (Pitched Tile, Pitched Slate, Flat, Other)
5. county → Ask which county they're in
6. contact_details → Ask for email and full address
7. survey_booking → Propose booking a free survey with their collected data
8. qualified → They completed the flow (celebrate!)

## BOOKING A SURVEY
When you have: property_type, roof_type, county, email, address, and phone — propose a survey booking.
Use this format for the booking data JSON:
{"first_name":"...","last_name":"...","email":"...","phone":"...","address":"...","county":"...","property_type":"...","roof_type":"...","interests":["Solar PV"],"preferred_date":"YYYY-MM-DD","preferred_time":"Morning (9-12)"}

Send booking confirmation: "${botConfig.booking_confirmation}"

## REFERENCE MATERIAL (pricing, grants, process, warranty)
${referenceMaterial}

## IMPORTANT
- Extract structured data from natural language and store it in collected_data
- If the user seems not interested, set lead_stage to "not_interested"
- If the user asks to speak to someone, set lead_stage to "callback_requested"
- Calculate a qualification_score (0-100) based on data completeness and interest level
- Return your response as plain text suitable for WhatsApp`
}

function extractBookingData(
  collectedData: Record<string, unknown>,
  phone: string,
  displayName?: string
): Record<string, unknown> | null {
  const cd = collectedData

  // Need at minimum: county, email, address, property_type, roof_type
  if (!cd.county || !cd.email || !cd.address || !cd.property_type || !cd.roof_type) {
    return null
  }

  // Parse name from display name or collected data
  const nameParts = (cd.full_name as string || displayName || '').split(' ')
  const firstName = cd.first_name as string || nameParts[0] || 'Customer'
  const lastName = cd.last_name as string || nameParts.slice(1).join(' ') || ''

  return {
    first_name: firstName,
    last_name: lastName,
    email: cd.email,
    phone: phone,
    address: cd.address,
    county: cd.county,
    property_type: cd.property_type,
    roof_type: cd.roof_type,
    interests: cd.interests || ['Solar PV'],
    preferred_date: cd.preferred_date || getDefaultDate(),
    preferred_time: cd.preferred_time || 'Morning (9-12)',
    household_size: cd.household_size || null,
    current_bill: cd.current_bill || null,
  }
}

function getDefaultDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 7) // Default to 1 week out
  return d.toISOString().split('T')[0]
}

async function sendWhatsAppMessage(
  phoneNumber: string,
  messageText: string,
  buttons?: Array<{ id: string; title: string }>
): Promise<boolean> {
  const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')

  if (!accessToken || !phoneNumberId) {
    console.error('[WhatsApp] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID')
    return false
  }

  // If buttons are provided, send interactive message
  if (buttons && buttons.length > 0) {
    const body = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: messageText.substring(0, 3000) }, // Leave room for buttons
        action: {
          buttons: buttons.slice(0, 3).map(btn => ({
            type: 'reply',
            reply: { id: btn.id, title: btn.title.substring(0, 20) },
          })),
        },
      },
    }

    const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    return res.ok
  }

  // Plain text message
  const body = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    type: 'text',
    text: { body: messageText.substring(0, 4096) },
  }

  const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  return res.ok
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const payload: IncomingPayload = await req.json()
    const { phone, message, wa_id, display_name } = payload

    if (!phone || !message) {
      return new Response('Missing phone or message', { status: 400, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Load or create conversation
    let conversation: Conversation | null = null

    if (payload.conversation_id) {
      const { data } = await supabase
        .from('whatsapp_conversations')
        .select()
        .eq('id', payload.conversation_id)
        .single()
      conversation = data as Conversation | null
    }

    if (!conversation && wa_id) {
      const { data } = await supabase
        .from('whatsapp_conversations')
        .select()
        .eq('wa_id', wa_id)
        .single()
      conversation = data as Conversation | null
    }

    if (!conversation) {
      // Look up by phone number
      const { data } = await supabase
        .from('whatsapp_conversations')
        .select()
        .eq('phone_number', phone)
        .order('last_message_at', { ascending: false })
        .limit(1)
        .single()
      conversation = data as Conversation | null
    }

    // Create new conversation if needed
    if (!conversation) {
      const { data: newConv } = await supabase
        .from('whatsapp_conversations')
        .insert({
          wa_id: wa_id || `wa_${phone}_${Date.now()}`,
          phone_number: phone,
          display_name: display_name,
          messages: [{ role: 'user', content: message, timestamp: new Date().toISOString() }],
        })
        .select()
        .single()
      conversation = newConv as Conversation
    } else {
      // Append user message to conversation
      const updatedMessages = [
        ...(conversation.messages || []),
        { role: 'user', content: message, timestamp: new Date().toISOString() },
      ]
      await supabase
        .from('whatsapp_conversations')
        .update({
          messages: updatedMessages,
          last_message_at: new Date().toISOString(),
          session_count: conversation.session_count + 1,
          display_name: display_name || conversation.display_name,
        })
        .eq('id', conversation.id)
      conversation.messages = updatedMessages
    }

    // Load bot config
    const { data: configRows } = await supabase
      .from('whatsapp_bot_config')
      .select()
      .eq('active', true)
      .limit(1)
    const botConfig = (configRows?.[0] as BotConfig) || {
      greeting_message: 'Hi! Welcome to Solar Ireland. How can I help you today?',
      qualification_prompt: 'I\'d love to give you a personalised quote! What type of property do you have?',
      booking_confirmation: 'I\'ve booked your free solar survey!',
      handoff_message: 'Connecting you with our team...',
      max_session_exchanges: 30,
      inactivity_timeout_minutes: 1440,
      auto_qualify_score: 60,
    }

    // Check if conversation has expired
    const lastMsg = new Date(conversation.last_message_at)
    const now = new Date()
    const minutesSinceLastMsg = (now.getTime() - lastMsg.getTime()) / 60000
    if (conversation.status === 'expired' ||
        (minutesSinceLastMsg > botConfig.inactivity_timeout_minutes && conversation.session_count > 1)) {
      // Restart with greeting
      await supabase
        .from('whatsapp_conversations')
        .update({
          status: 'active',
          lead_stage: 'greeting',
          collected_data: {},
          session_count: 1,
        })
        .eq('id', conversation.id)
      conversation.lead_stage = 'greeting'
      conversation.collected_data = {}
    }

    // Load quick replies
    const { data: quickReplies } = await supabase
      .from('whatsapp_quick_replies')
      .select()
      .eq('active', true)
      .order('priority', { ascending: false }) as { data: QuickReply[] }

    // Build AI prompt
    const systemPrompt = buildSystemPrompt(botConfig, conversation, quickReplies || [])

    // Build conversation history for AI
    const conversationHistory = (conversation.messages || []).slice(-20).map(m => ({
      role: m.role === 'bot' ? 'assistant' : 'user',
      content: m.content,
    }))

    // Call LLM via z-ai-web-dev-sdk equivalent (use OpenAI-compatible API)
    const aiApiKey = Deno.env.get('OPENAI_API_KEY') || Deno.env.get('AI_API_KEY')

    let aiResponseText: string
    let extractedData: Record<string, unknown> = {}
    let newStage = conversation.lead_stage
    let newScore = conversation.qualification_score || 0

    if (aiApiKey) {
      // Use AI to process message
      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory,
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      if (aiRes.ok) {
        const aiData = await aiRes.json()
        aiResponseText = aiData.choices[0]?.message?.content || botConfig.greeting_message
      } else {
        // Fallback to keyword matching
        aiResponseText = fallbackResponse(message, quickReplies || [], botConfig)
      }
    } else {
      // No AI key — use keyword matching fallback
      aiResponseText = fallbackResponse(message, quickReplies || [], botConfig)
    }

    // Extract data from AI response (simple heuristic)
    extractedData = { ...conversation.collected_data }
    const lowerMsg = message.toLowerCase()

    // Property type extraction
    if (newStage === 'property_type' || (newStage === 'greeting' && lowerMsg.includes('detached'))) {
      const propertyMatch = lowerMsg.match(/\b(detached|semi.?detached|terraced|apartment|flat|bungalow)\b/)
      if (propertyMatch) {
        extractedData.property_type = propertyMatch[1].charAt(0).toUpperCase() + propertyMatch[1].slice(1).replace(/-/g, '-')
        if (newStage === 'property_type') newStage = 'roof_type'
      }
    }

    // Roof type extraction
    if (newStage === 'roof_type') {
      const roofMatch = lowerMsg.match(/\b(pitched tile|pitched slate|flat|slate|tile)\b/)
      if (roofMatch) {
        extractedData.roof_type = roofMatch[1].charAt(0).toUpperCase() + roofMatch[1].slice(1)
        newStage = 'county'
      }
    }

    // County extraction
    if (newStage === 'county') {
      // Simple county detection (most common ones)
      const counties = ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kildare', 'Meath', 'Wicklow',
        'Kilkenny', 'Wexford', 'Tipperary', 'Clare', 'Louth', 'Donegal', 'Mayo', 'Sligo', 'Roscommon',
        'Offaly', 'Longford', 'Westmeath', 'Carlow', 'Kerry', 'Laois', 'Cavan', 'Monaghan',
        'Leitrim', 'Athlone', 'Antrim', 'Armagh', 'Derry', 'Down', 'Fermanagh', 'Tyrone']
      const countyMatch = counties.find(c => lowerMsg.includes(c.toLowerCase()))
      if (countyMatch) {
        extractedData.county = countyMatch
        newStage = 'contact_details'
      }
    }

    // Email extraction
    if (newStage === 'contact_details') {
      const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
      if (emailMatch) {
        extractedData.email = emailMatch[0]
      }
      // Address extraction (heuristic — any text that looks like an address)
      if (!extractedData.address && message.length > 10 && !emailMatch) {
        extractedData.address = message.trim()
      }
      if (extractedData.email && extractedData.address) {
        newStage = 'survey_booking'
        newScore = Math.min(100, (newScore || 0) + 30)
      }
    }

    // Interest extraction (any stage)
    if (lowerMsg.includes('battery') || lowerMsg.includes('storage')) {
      extractedData.interests = ['Solar PV', 'Battery']
    }
    if (lowerMsg.includes('ev') || lowerMsg.includes('electric car') || lowerMsg.includes('charger')) {
      const interests = new Set(extractedData.interests as string[] || ['Solar PV'])
      interests.add('EV Charger')
      extractedData.interests = [...interests]
    }

    // Qualification score
    newScore = calculateQualificationScore(extractedData, conversation.session_count + 1)

    // Check if we should try to book
    const bookingData = extractBookingData(extractedData, phone, display_name)
    let bookingId: string | null = null

    if (bookingData && newStage === 'survey_booking') {
      // Auto-create survey booking
      const reference = await supabase.rpc('gen_reference_number').then(r => r.data)
      const { data: booking } = await supabase
        .from('survey_bookings')
        .insert({
          reference,
          ...bookingData,
          status: 'pending',
          source_page: 'whatsapp-bot',
        })
        .select()
        .single()

      if (booking) {
        bookingId = booking.id
        newStage = 'qualified'
        newScore = 100
        aiResponseText = botConfig.booking_confirmation

        // Trigger email notification
        await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-postmark-email`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'whatsapp_lead_qualified',
              to: bookingData.email,
              model_data: {
                display_name,
                phone_number: phone,
                county: bookingData.county,
                property_type: bookingData.property_type,
                interests: bookingData.interests,
                qualification_score: 100,
                conversation_summary: `WhatsApp lead converted. Ref: ${reference}`,
              },
            }),
          }
        )

        console.log(`[WhatsApp] Lead qualified! Ref: ${reference}, Phone: ${phone}`)
      }
    }

    // Send WhatsApp response
    const sent = await sendWhatsAppMessage(phone, aiResponseText)

    // Update conversation in DB
    const updatedMessages = [
      ...(conversation.messages || []),
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      ...(sent ? [{ role: 'bot', content: aiResponseText, timestamp: new Date().toISOString() }] : []),
    ]

    await supabase
      .from('whatsapp_conversations')
      .update({
        status: newStage === 'qualified' ? 'completed' : 'active',
        lead_stage: newStage,
        collected_data: extractedData,
        messages: updatedMessages,
        qualification_score: newScore,
        survey_booking_id: bookingId,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation.id)

    // Record lead source
    if (newStage === 'qualified' || newScore >= 70) {
      await supabase
        .from('lead_sources')
        .insert({
          source_type: 'whatsapp',
          source_page: 'whatsapp-bot',
          related_id: bookingId,
          converted: newStage === 'qualified',
        })
    }

    return new Response(JSON.stringify({
      status: 'ok',
      lead_stage: newStage,
      qualification_score: newScore,
      booking_created: !!bookingId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[WhatsApp] Handler error:', err)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})

// ============================================================================
// Fallback response when no AI key is configured
// ============================================================================
function fallbackResponse(
  message: string,
  quickReplies: QuickReply[],
  botConfig: BotConfig
): string {
  const lower = message.toLowerCase()

  // Check quick reply keyword matches
  let bestMatch: QuickReply | null = null
  let bestScore = 0

  for (const qr of quickReplies) {
    let score = 0
    for (const keyword of qr.trigger_keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length * qr.priority
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = qr
    }
  }

  if (bestMatch) {
    return bestMatch.response_text
  }

  // Default response
  if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey')) {
    return botConfig.greeting_message
  }

  return 'Thanks for your message! I can help you with:\n\n☀️ Solar panel pricing\n💰 SEAI grants\n📍 Availability in your area\n📅 Book a free survey\n\nWhat would you like to know?'
}

// ============================================================================
// Qualification Score Calculator
// ============================================================================
function calculateQualificationScore(
  collectedData: Record<string, unknown>,
  sessionCount: number
): number {
  let score = 0

  // Data completeness (max 70 points)
  if (collectedData.property_type) score += 15
  if (collectedData.roof_type) score += 10
  if (collectedData.county) score += 10
  if (collectedData.email) score += 15
  if (collectedData.address) score += 10
  if (collectedData.interests) score += 10

  // Engagement (max 30 points)
  score += Math.min(20, sessionCount * 2)
  if (sessionCount > 5) score += 5
  if (sessionCount > 10) score += 5

  return Math.min(100, score)
}
