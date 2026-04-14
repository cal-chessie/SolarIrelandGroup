// ============================================================================
// WhatsApp Webhook — Receives incoming messages from Meta WhatsApp Business API
// ============================================================================
// This is the entry point for ALL WhatsApp messages.
// It verifies the webhook (GET), receives messages (POST),
// and dispatches to the AI message handler.
//
// Setup: Meta Developer Dashboard > WhatsApp > Webhook
//   Verify Token: configure in env (WHATSAPP_VERIFY_TOKEN)
//   Callback URL: https://your-project.supabase.co/functions/v1/whatsapp-webhook
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  from: string          // Phone number: "353861234567"
  id: string            // Message ID
  text?: { body: string }
  type: string          // 'text', 'interactive', etc
  timestamp: string
}

interface WhatsAppEntry {
  id: string            // Conversation ID
  changes: Array<{
    value: {
      messages?: WhatsAppMessage[]
      contacts?: Array<{ wa_id: string; profile?: { name?: string } }>
      statuses?: Array<{
        id: string
        status: string  // 'sent', 'delivered', 'read', 'failed'
        recipient_id: string
      }>
    }
  }>
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // ============================================================================
  // GET: Webhook Verification (Meta requires this)
  // ============================================================================
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN')

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('[WhatsApp] Webhook verified')
      return new Response(challenge, {
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
      })
    }

    return new Response('Forbidden', { status: 403 })
  }

  // ============================================================================
  // POST: Incoming Message
  // ============================================================================
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const body: { entry: WhatsAppEntry[] } = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        const { messages, contacts, statuses } = change.value

        // Handle message status updates (delivered, read, etc.) — just log them
        if (statuses && statuses.length > 0) {
          for (const status of statuses) {
            console.log(`[WhatsApp] Message ${status.id} status: ${status.status} to ${status.recipient_id}`)
          }
          continue
        }

        // Handle incoming messages
        if (!messages || messages.length === 0) continue

        const message = messages[0]
        const contact = contacts?.[0]
        const phone = message.from
        const text = message.text?.body?.trim() ?? ''

        if (!text) continue  // Ignore non-text messages (images, audio, etc.)

        const displayName = contact?.profile?.name ?? null

        console.log(`[WhatsApp] Message from ${phone} (${displayName}): "${text.substring(0, 100)}..."`)

        // Upsert conversation
        const { data: conversation, error: convError } = await supabase
          .from('whatsapp_conversations')
          .upsert({
            wa_id: entry.id,
            phone_number: phone,
            display_name: displayName,
            status: 'active',
            last_message_at: new Date().toISOString(),
            messages: await supabase.rpc('append_whatsapp_message', {
              p_existing: [],
              p_role: 'user',
              p_content: text,
            }).then(() => []),  // Will be handled by the AI handler
          }, { onConflict: 'wa_id' })
          .select()
          .single()

        if (convError && !convError.message.includes('duplicate')) {
          console.error('[WhatsApp] DB error:', convError)
          continue
        }

        // Dispatch to AI handler
        const aiResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/whatsapp-send-message`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },
            body: JSON.stringify({
              phone,
              message: text,
              conversation_id: conversation?.id,
              wa_id: entry.id,
              display_name: displayName,
            }),
          }
        )

        if (!aiResponse.ok) {
          const errText = await aiResponse.text()
          console.error('[WhatsApp] AI handler error:', errText)
        }
      }
    }

    return new Response(JSON.stringify({ status: 'received' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[WhatsApp] Webhook error:', err)
    return new Response('Internal server error', { status: 500, headers: corsHeaders })
  }
})
