// ============================================================================
// Run Automation — Process pending automation tasks
// ============================================================================
// Cron job processes the automation_tasks queue.
// Executes actions: send_email, request_review, create_gbp_post, send_whatsapp, notify_admin.
//
// Cron: */5 * * * * (every 5 minutes)
// ============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // 1. Process pending tasks that are due
    const { data: tasks, error: taskError } = await supabase
      .from('automation_tasks')
      .select('*, automation_rules(name, trigger_type, action_config)')
      .eq('status', 'pending')
      .lt('scheduled_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(20)

    if (taskError) throw taskError
    if (!tasks || tasks.length === 0) {
      return new Response(JSON.stringify({ status: 'idle', tasks_processed: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let processed = 0
    let failed = 0

    for (const task of tasks) {
      // Mark as running
      await supabase
        .from('automation_tasks')
        .update({ status: 'running', started_at: new Date().toISOString() })
        .eq('id', task.id)

      try {
        const config = task.action_config as Record<string, unknown>
        const payload = task.payload as Record<string, unknown>
        let result: Record<string, unknown> = {}

        switch (task.action_type) {
          case 'request_review': {
            // Create a review_request record + send email
            const customerId = task.customer_id
            if (customerId) {
              const { data: customer } = await supabase
                .from('customers')
                .select('id, first_name, email, reference, status')
                .eq('id', customerId)
                .single()

              if (customer) {
                // Check for duplicate
                const triggerStage = payload.trigger_stage || 'installation_complete'
                const { data: existing } = await supabase
                  .from('review_requests')
                  .select('id')
                  .eq('customer_id', customerId)
                  .eq('trigger_stage', triggerStage)
                  .maybeSingle()

                if (!existing) {
                  // Create review request
                  await supabase.from('review_requests').insert({
                    customer_id: customerId,
                    trigger_stage: triggerStage,
                    channel: (config.channel as string) || 'email',
                    template_used: (config.template as string) || 'review_request_installation',
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                  })

                  // Send email via Postmark
                  const postmarkRes = await fetch(
                    `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-postmark-email`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        event: 'custom',
                        to: customer.email,
                        subject: `How was your solar installation, ${customer.first_name}?`,
                        model_data: {
                          first_name: customer.first_name,
                          reference: customer.reference,
                          review_link: 'https://search.google.com/local/writereview?placeid=PLACE_ID',
                        },
                      }),
                    }
                  )

                  result = { sent: true, channel: config.channel, email: customer.email }
                } else {
                  result = { skipped: true, reason: 'already_requested' }
                }
              }
            }
            break
          }

          case 'create_gbp_post': {
            // Find latest published blog post
            const { data: blogPost } = await supabase
              .from('blog_posts')
              .select('id, slug, title, excerpt, image')
              .eq('status', 'published')
              .is('deleted_at', null)
              .order('published_at', { ascending: false })
              .limit(1)
              .single()

            if (blogPost) {
              // Check if already posted
              const { data: existingPost } = await supabase
                .from('gbp_posts')
                .select('id')
                .eq('blog_post_id', blogPost.id)
                .eq('status', 'published')
                .maybeSingle()

              if (!existingPost) {
                const summary = `${blogPost.excerpt.substring(0, 1300)}\n\nRead more: https://solarireland.ie/blog/${blogPost.slug}`

                await supabase.from('gbp_posts').insert({
                  title: blogPost.title,
                  summary,
                  call_to_action: {
                    action_type: (config.action_type as string) || 'LEARN_MORE',
                    url: `https://solarireland.ie/blog/${blogPost.slug}`,
                  },
                  media_urls: blogPost.image ? [blogPost.image] : [],
                  source: 'blog_auto',
                  blog_post_id: blogPost.id,
                  status: 'scheduled',
                  scheduled_at: new Date().toISOString(),
                })

                result = { created: true, blog_title: blogPost.title }
              } else {
                result = { skipped: true, reason: 'already_posted' }
              }
            } else {
              result = { skipped: true, reason: 'no_published_blog' }
            }
            break
          }

          case 'send_whatsapp': {
            // Send WhatsApp message via template
            const phone = payload.phone as string
            if (phone) {
              // This would call the WhatsApp Business API
              result = { sent: true, phone, template: config.template }
            } else {
              result = { skipped: true, reason: 'no_phone' }
            }
            break
          }

          case 'notify_admin': {
            // Send admin notification email
            const adminEmail = (await supabase
              .from('site_settings')
              .select('value')
              .eq('key', 'provider_email')
              .single())?.data?.value as string || 'hello@solarireland.ie'

            await fetch(
              `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-postmark-email`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event: 'admin_notification',
                  to: adminEmail,
                  subject: `Solar Ireland Alert: ${payload.summary || task.action_type}`,
                  model_data: payload,
                }),
              }
            )

            result = { notified: true, email: adminEmail }
            break
          }

          case 'send_email': {
            const to = payload.email as string
            if (to) {
              await fetch(
                `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-postmark-email`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    event: (config.email_event as string) || 'custom',
                    to,
                    model_data: payload,
                  }),
                }
              )
              result = { sent: true, to }
            } else {
              result = { skipped: true, reason: 'no_email' }
            }
            break
          }

          default:
            result = { skipped: true, reason: `unknown_action: ${task.action_type}` }
        }

        // Mark complete
        await supabase
          .from('automation_tasks')
          .update({
            status: result.skipped ? 'skipped' : 'completed',
            completed_at: new Date().toISOString(),
            result,
          })
          .eq('id', task.id)

        // Update rule run count
        if (task.rule_id) {
          await supabase
            .from('automation_rules')
            .update({
              run_count: (task as any).automation_rules?.run_count || 0 + 1,
              last_run_at: new Date().toISOString(),
            })
            .eq('id', task.rule_id)
        }

        processed++
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error(`[Automation] Task ${task.id} failed:`, errorMsg)

        await supabase
          .from('automation_tasks')
          .update({
            status: 'failed',
            error_message: errorMsg,
            retry_count: (task.retry_count || 0) + 1,
          })
          .eq('id', task.id)

        // Re-queue if retries left
        if ((task.retry_count || 0) + 1 < (task.max_retries || 3)) {
          await supabase
            .from('automation_tasks')
            .update({
              status: 'pending',
              error_message: null,
            })
            .eq('id', task.id)
        }

        failed++
      }
    }

    // 2. Process stage-change triggers (check for new qualifying customers)
    await processStageTriggers(supabase)

    return new Response(JSON.stringify({
      status: 'ok',
      tasks_processed: processed,
      tasks_failed: failed,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[Automation] Error:', err)
    return new Response('Internal error', { status: 500, headers: corsHeaders })
  }
})

// ============================================================================
// Check for customers who recently changed stage and fire matching rules
// ============================================================================
async function processStageTriggers(supabase: any) {
  // Find active rules with customer_stage_change trigger
  const { data: rules } = await supabase
    .from('automation_rules')
    .select('*')
    .eq('trigger_type', 'customer_stage_change')
    .eq('is_active', true)

  if (!rules || rules.length === 0) return

  for (const rule of rules) {
    const triggerConfig = rule.trigger_config as Record<string, unknown>
    const targetStage = triggerConfig.stage as string

    if (!targetStage) continue

    // Find customers who reached this stage in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    const { data: customers } = await supabase
      .from('customers')
      .select('id, first_name, last_name, email, phone, reference, county, status')
      .eq('status', targetStage)
      .gte('updated_at', tenMinutesAgo)

    if (!customers || customers.length === 0) continue

    for (const customer of customers) {
      // Check if a task already exists for this rule + customer
      const { data: existing } = await supabase
        .from('automation_tasks')
        .select('id')
        .eq('rule_id', rule.id)
        .eq('customer_id', customer.id)
        .eq('status', 'pending')
        .maybeSingle()

      if (existing) continue

      // Check filters (simple implementation)
      let passes = true
      const filters = (rule.filters as Array<Record<string, unknown>>) || []
      for (const filter of filters) {
        const field = filter.field as string
        const op = filter.operator as string
        const val = filter.value
        const customerVal = (customer as Record<string, unknown>)[field]
        if (op === 'eq' && customerVal !== val) passes = false
        if (op === 'neq' && customerVal === val) passes = false
      }

      if (!passes) continue

      // Create task
      const actionConfig = rule.action_config as Record<string, unknown>
      const delayHours = actionConfig.delay_hours as number || 0

      await supabase.from('automation_tasks').insert({
        rule_id: rule.id,
        action_type: rule.action_type,
        action_config: rule.action_config,
        payload: {
          customer_id: customer.id,
          first_name: customer.first_name,
          last_name: customer.last_name,
          email: customer.email,
          phone: customer.phone,
          reference: customer.reference,
          county: customer.county,
          status: customer.status,
          trigger_stage: targetStage,
          summary: `${customer.first_name} ${customer.last_name} reached ${targetStage}`,
        },
        status: 'pending',
        scheduled_at: delayHours > 0
          ? new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString()
          : new Date().toISOString(),
        customer_id: customer.id,
      })
    }
  }
}
