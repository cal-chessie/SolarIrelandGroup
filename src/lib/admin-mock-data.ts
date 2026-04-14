import type { AdminDashboardData } from "./admin-types";

// ============================================================
// Comprehensive Mock Data for Solar Ireland Admin Dashboard
// ============================================================

const NOW = new Date();
const ISO_NOW = NOW.toISOString();

function daysAgo(n: number) {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function futureDate(n: number) {
  const d = new Date(NOW);
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

export const MOCK_DASHBOARD_DATA: AdminDashboardData = {
  meta: {
    generated_at: ISO_NOW,
  },

  lead_funnel: {
    new_contacts_today: 5,
    contacts_this_week: 23,
    contacts_this_month: 87,
    pending_surveys_today: 3,
  },

  recent_leads: {
    contacts: [
      { id: "c1", name: "O'Brien, Sean", email: "sean.obrien@email.com", phone: "+353 87 123 4567", county: "Dublin", message: "Interested in a 6kW system for my 4-bed semi in Rathfarnham.", source: "Website", status: "new", created_at: hoursAgo(2) },
      { id: "c2", name: "Murphy, Aoife", email: "aoife.murphy@email.com", phone: "+353 86 234 5678", county: "Cork", message: "Would like a quote for solar panels and battery storage.", source: "Facebook", status: "new", created_at: hoursAgo(5) },
      { id: "c3", name: "Kelly, Patrick", email: "pat.kelly@email.com", phone: "+353 85 345 6789", county: "Galway", message: "Just moved into a new build. Looking for SEAI grant info.", source: "Google Ads", status: "contacted", created_at: daysAgo(1) },
      { id: "c4", name: "Byrne, Sarah", email: "sarah.b@email.com", phone: "+353 87 456 7890", county: "Wicklow", message: "Got a referral from a neighbour who had panels installed last month.", source: "Referral", status: "qualified", created_at: daysAgo(2) },
      { id: "c5", name: "Walsh, Michael", email: "mick.walsh@email.com", phone: "+353 83 567 8901", county: "Kildare", message: "Want to know about the SEAI grant amount and eligibility.", source: "Website", status: "new", created_at: hoursAgo(8) },
      { id: "c6", name: "Doyle, Eileen", email: "eileen.doyle@email.com", phone: "+353 86 678 9012", county: "Limerick", message: "Already got a quote from another company but want to compare.", source: "Instagram", status: "contacted", created_at: daysAgo(1) },
      { id: "c7", name: "Fitzgerald, James", email: "j.fitz@email.com", phone: "+353 85 789 0123", county: "Meath", message: "Interested in a full solar + battery + EV charger setup.", source: "Website", status: "new", created_at: daysAgo(1) },
      { id: "c8", name: "O'Connor, Niamh", email: "niamh.oc@email.com", phone: "+353 87 890 1234", county: "Dublin", message: "Have a flat roof on extension – is that suitable for panels?", source: "WhatsApp", status: "contacted", created_at: daysAgo(2) },
      { id: "c9", name: "Lynch, David", email: "d.lynch@email.com", phone: "+353 83 901 2345", county: "Donegal", message: "Bungalow in Letterkenny, south-facing roof.", source: "Google Ads", status: "new", created_at: daysAgo(3) },
      { id: "c10", name: "Ryan, Claire", email: "claire.ryan@email.com", phone: "+353 86 012 3456", county: "Waterford", message: "Wanted to ask about the Clean Export Guarantee.", source: "TikTok", status: "lost", created_at: daysAgo(5) },
    ],
    surveys: [
      { id: "s1", reference: "SUR-2026-0421", contact_name: "O'Brien, Sean", email: "sean.obrien@email.com", phone: "+353 87 123 4567", county: "Dublin", preferred_date: futureDate(3), status: "confirmed", created_at: daysAgo(1) },
      { id: "s2", reference: "SUR-2026-0420", contact_name: "Byrne, Sarah", email: "sarah.b@email.com", phone: "+353 87 456 7890", county: "Wicklow", preferred_date: futureDate(2), status: "confirmed", created_at: daysAgo(2) },
      { id: "s3", reference: "SUR-2026-0419", contact_name: "Kelly, Patrick", email: "pat.kelly@email.com", phone: "+353 85 345 6789", county: "Galway", preferred_date: futureDate(5), status: "pending", created_at: daysAgo(1) },
      { id: "s4", reference: "SUR-2026-0418", contact_name: "Doyle, Eileen", email: "eileen.doyle@email.com", phone: "+353 86 678 9012", county: "Limerick", preferred_date: futureDate(1), status: "confirmed", created_at: daysAgo(3) },
      { id: "s5", reference: "SUR-2026-0417", contact_name: "Fitzgerald, James", email: "j.fitz@email.com", phone: "+353 85 789 0123", county: "Meath", preferred_date: futureDate(7), status: "pending", created_at: daysAgo(1) },
      { id: "s6", reference: "SUR-2026-0416", contact_name: "Murphy, Aoife", email: "aoife.murphy@email.com", phone: "+353 86 234 5678", county: "Cork", preferred_date: futureDate(4), status: "pending", created_at: daysAgo(1) },
      { id: "s7", reference: "SUR-2026-0415", contact_name: "McCarthy, Tom", email: "tom.mcc@email.com", phone: "+353 87 111 2233", county: "Kerry", preferred_date: daysAgo(1), status: "completed", created_at: daysAgo(7) },
      { id: "s8", reference: "SUR-2026-0414", contact_name: "Hayes, Lisa", email: "lisa.hayes@email.com", phone: "+353 86 444 5566", county: "Tipperary", preferred_date: daysAgo(3), status: "completed", created_at: daysAgo(10) },
    ],
    whatsapp: [
      {
        id: "w1", contact_name: "Walsh, Michael", phone: "+353 83 567 8901", stage: "greeting", qualification_score: 20,
        last_message: "Hi there! I'm interested in solar panels for my home.", last_message_at: hoursAgo(1), unread_count: 1,
        messages: [
          { id: "wm1", from: "customer", text: "Hi there! I'm interested in solar panels for my home.", timestamp: hoursAgo(1) },
          { id: "wm2", from: "bot", text: "Hello Michael! 👋 Welcome to Solar Ireland. We'd love to help you go solar. Can I ask which county you're in?", timestamp: hoursAgo(1) },
          { id: "wm3", from: "customer", text: "I'm in Kildare, near Naas.", timestamp: minutesAgo(30) },
        ],
      },
      {
        id: "w2", contact_name: "Byrne, Sarah", phone: "+353 87 456 7890", stage: "qualified", qualification_score: 85,
        last_message: "Great, I've booked a survey for Thursday.", last_message_at: hoursAgo(3), unread_count: 0,
        messages: [
          { id: "wm4", from: "customer", text: "My neighbour got panels from you and is very happy.", timestamp: daysAgo(2) },
          { id: "wm5", from: "bot", text: "That's wonderful to hear! We love getting referrals. Would you like to book a free survey?", timestamp: daysAgo(2) },
          { id: "wm6", from: "customer", text: "Yes please! I'm in Wicklow.", timestamp: daysAgo(1) },
          { id: "wm7", from: "bot", text: "Great! We have availability Thursday or Friday next week. Which works better?", timestamp: daysAgo(1) },
          { id: "wm8", from: "customer", text: "Great, I've booked a survey for Thursday.", timestamp: hoursAgo(3) },
        ],
      },
      {
        id: "w3", contact_name: "Lynch, David", phone: "+353 83 901 2345", stage: "survey_booked", qualification_score: 90,
        last_message: "Looking forward to the survey tomorrow!", last_message_at: hoursAgo(6), unread_count: 0,
        messages: [
          { id: "wm9", from: "customer", text: "Hi, I have a bungalow in Donegal.", timestamp: daysAgo(3) },
          { id: "wm10", from: "bot", text: "Hi David! Bungalows are perfect for solar – usually great roof access. What's your Eircode?", timestamp: daysAgo(3) },
          { id: "wm11", from: "customer", text: "F92 XY45", timestamp: daysAgo(3) },
          { id: "wm12", from: "bot", text: "Great, I can see you'd get excellent south-facing exposure. Let me book a survey for you.", timestamp: daysAgo(2) },
          { id: "wm13", from: "customer", text: "Looking forward to the survey tomorrow!", timestamp: hoursAgo(6) },
        ],
      },
      {
        id: "w4", contact_name: "Ryan, Claire", phone: "+353 86 012 3456", stage: "not_interested", qualification_score: 5,
        last_message: "Thanks but I've decided against it for now.", last_message_at: daysAgo(2), unread_count: 0,
        messages: [
          { id: "wm14", from: "customer", text: "Hi, what's the cost roughly?", timestamp: daysAgo(4) },
          { id: "wm15", from: "bot", text: "Hi Claire! A typical 4kW system is around €6,500 before the €1,800 SEAI grant. Want a personalised quote?", timestamp: daysAgo(4) },
          { id: "wm16", from: "customer", text: "Thanks but I've decided against it for now.", timestamp: daysAgo(2) },
        ],
      },
      {
        id: "w5", contact_name: "O'Connor, Niamh", phone: "+353 87 890 1234", stage: "qualified", qualification_score: 75,
        last_message: "Yes I'd like to proceed. Can you book a survey?", last_message_at: daysAgo(1), unread_count: 2,
        messages: [
          { id: "wm17", from: "customer", text: "Hi, I have a flat roof extension – can you install on that?", timestamp: daysAgo(2) },
          { id: "wm18", from: "bot", text: "Hi Niamh! Yes, flat roofs are no problem – we use special mounting frames. Would you like a free survey?", timestamp: daysAgo(2) },
          { id: "wm19", from: "customer", text: "Yes I'd like to proceed. Can you book a survey?", timestamp: daysAgo(1) },
        ],
      },
      {
        id: "w6", contact_name: "Hughes, Brian", phone: "+353 85 222 3344", stage: "greeting", qualification_score: 15,
        last_message: "Hi, I want to know about solar panel prices.", last_message_at: hoursAgo(4), unread_count: 1,
        messages: [
          { id: "wm20", from: "customer", text: "Hi, I want to know about solar panel prices.", timestamp: hoursAgo(4) },
          { id: "wm21", from: "bot", text: "Hi Brian! 🌞 Great choice considering solar. Our systems start from €4,700 after the SEAI grant. Which county are you in?", timestamp: hoursAgo(4) },
        ],
      },
    ],
  },

  reviews: {
    average_rating: "4.9",
    total_reviews: 42,
    new_reviews_this_month: 8,
    latest: [
      { id: "r1", name: "McCarthy, Tom", rating: 5, text: "Absolutely brilliant service from start to finish. The team arrived on time, were very professional, and the system is performing above expectations. Already seeing savings on my bills!", source: "Google", date: daysAgo(2), verified: true },
      { id: "r2", name: "Hayes, Lisa", rating: 5, text: "Solar Ireland made the whole process seamless. From the initial survey to installation, everything was handled efficiently. The SEAI grant application was sorted by them too!", source: "Google", date: daysAgo(4), verified: true },
      { id: "r3", name: "O'Sullivan, Mark", rating: 5, text: "Had panels installed 3 months ago and already saved €380 on electricity. The monitoring app is great – I can see exactly what I'm generating.", source: "Facebook", date: daysAgo(7), verified: true },
      { id: "r4", name: "Dunne, Fiona", rating: 4, text: "Very happy with the installation. Only small issue was a slight delay in scheduling the survey, but once booked everything was perfect.", source: "Google", date: daysAgo(10), verified: true },
      { id: "r5", name: "Kavanagh, Aidan", rating: 5, text: "Best investment I've made for my home. The team was incredibly knowledgeable and answered all my questions. Highly recommend!", source: "Trustpilot", date: daysAgo(14), verified: true },
      { id: "r6", name: "Connolly, Ruth", rating: 5, text: "We went with solar + battery and it's been fantastic. During the day we're basically off the grid. The battery stores excess for the evening.", source: "Google", date: daysAgo(18), verified: true },
    ],
    recent_five_star: [
      { id: "r1", name: "McCarthy, Tom", rating: 5, text: "Absolutely brilliant service from start to finish. The team arrived on time, were very professional, and the system is performing above expectations. Already seeing savings on my bills!", source: "Google", date: daysAgo(2), verified: true },
      { id: "r2", name: "Hayes, Lisa", rating: 5, text: "Solar Ireland made the whole process seamless. From the initial survey to installation, everything was handled efficiently. The SEAI grant application was sorted by them too!", source: "Google", date: daysAgo(4), verified: true },
      { id: "r3", name: "O'Sullivan, Mark", rating: 5, text: "Had panels installed 3 months ago and already saved €380 on electricity. The monitoring app is great – I can see exactly what I'm generating.", source: "Facebook", date: daysAgo(7), verified: true },
    ],
  },

  surveys: {
    upcoming: [
      { id: "s4", reference: "SUR-2026-0418", contact_name: "Doyle, Eileen", email: "eileen.doyle@email.com", phone: "+353 86 678 9012", county: "Limerick", preferred_date: futureDate(1), status: "confirmed", created_at: daysAgo(3) },
      { id: "s2", reference: "SUR-2026-0420", contact_name: "Byrne, Sarah", email: "sarah.b@email.com", phone: "+353 87 456 7890", county: "Wicklow", preferred_date: futureDate(2), status: "confirmed", created_at: daysAgo(2) },
      { id: "s1", reference: "SUR-2026-0421", contact_name: "O'Brien, Sean", email: "sean.obrien@email.com", phone: "+353 87 123 4567", county: "Dublin", preferred_date: futureDate(3), status: "confirmed", created_at: daysAgo(1) },
      { id: "s6", reference: "SUR-2026-0419", contact_name: "Murphy, Aoife", email: "aoife.murphy@email.com", phone: "+353 86 234 5678", county: "Cork", preferred_date: futureDate(4), status: "pending", created_at: daysAgo(1) },
      { id: "s3", reference: "SUR-2026-0419", contact_name: "Kelly, Patrick", email: "pat.kelly@email.com", phone: "+353 85 345 6789", county: "Galway", preferred_date: futureDate(5), status: "pending", created_at: daysAgo(1) },
      { id: "s5", reference: "SUR-2026-0417", contact_name: "Fitzgerald, James", email: "j.fitz@email.com", phone: "+353 85 789 0123", county: "Meath", preferred_date: futureDate(7), status: "pending", created_at: daysAgo(1) },
    ],
    recent_bookings: [
      { id: "s7", reference: "SUR-2026-0415", contact_name: "McCarthy, Tom", email: "tom.mcc@email.com", phone: "+353 87 111 2233", county: "Kerry", preferred_date: daysAgo(1), status: "completed", created_at: daysAgo(7) },
      { id: "s8", reference: "SUR-2026-0414", contact_name: "Hayes, Lisa", email: "lisa.hayes@email.com", phone: "+353 86 444 5566", county: "Tipperary", preferred_date: daysAgo(3), status: "completed", created_at: daysAgo(10) },
    ],
  },

  whatsapp: {
    conversations: [
      {
        id: "w1", contact_name: "Walsh, Michael", phone: "+353 83 567 8901", stage: "greeting", qualification_score: 20,
        last_message: "Hi there! I'm interested in solar panels for my home.", last_message_at: hoursAgo(1), unread_count: 1,
      },
      {
        id: "w2", contact_name: "Byrne, Sarah", phone: "+353 87 456 7890", stage: "qualified", qualification_score: 85,
        last_message: "Great, I've booked a survey for Thursday.", last_message_at: hoursAgo(3), unread_count: 0,
      },
      {
        id: "w3", contact_name: "Lynch, David", phone: "+353 83 901 2345", stage: "survey_booked", qualification_score: 90,
        last_message: "Looking forward to the survey tomorrow!", last_message_at: hoursAgo(6), unread_count: 0,
      },
      {
        id: "w4", contact_name: "Ryan, Claire", phone: "+353 86 012 3456", stage: "not_interested", qualification_score: 5,
        last_message: "Thanks but I've decided against it for now.", last_message_at: daysAgo(2), unread_count: 0,
      },
      {
        id: "w5", contact_name: "O'Connor, Niamh", phone: "+353 87 890 1234", stage: "qualified", qualification_score: 75,
        last_message: "Yes I'd like to proceed. Can you book a survey?", last_message_at: daysAgo(1), unread_count: 2,
      },
      {
        id: "w6", contact_name: "Hughes, Brian", phone: "+353 85 222 3344", stage: "greeting", qualification_score: 15,
        last_message: "Hi, I want to know about solar panel prices.", last_message_at: hoursAgo(4), unread_count: 1,
      },
    ],
    qualified: 5,
    active: 12,
  },

  automation: {
    pending_tasks: 3,
    failed_tasks: 1,
    tasks_this_week: 18,
    tasks: [
      { id: "t1", name: "Welcome Email", type: "email", status: "pending", triggered_at: hoursAgo(1), target: "sean.obrien@email.com" },
      { id: "t2", name: "Survey Reminder", type: "whatsapp", status: "pending", triggered_at: hoursAgo(2), target: "+353 86 678 9012" },
      { id: "t3", name: "Review Request", type: "email", status: "pending", triggered_at: hoursAgo(5), target: "tom.mcc@email.com" },
      { id: "t4", name: "WhatsApp Follow-up", type: "whatsapp", status: "failed", triggered_at: hoursAgo(8), target: "+353 83 567 8901", error: "Rate limit exceeded" },
      { id: "t5", name: "Survey Confirmation", type: "email", status: "completed", triggered_at: daysAgo(1), target: "sarah.b@email.com" },
      { id: "t6", name: "Welcome WhatsApp", type: "whatsapp", status: "completed", triggered_at: daysAgo(1), target: "+353 86 234 5678" },
      { id: "t7", name: "SEAI Info Email", type: "email", status: "completed", triggered_at: daysAgo(2), target: "pat.kelly@email.com" },
      { id: "t8", name: "Bill Analysis Result", type: "email", status: "completed", triggered_at: daysAgo(2), target: "aoife.murphy@email.com" },
      { id: "t9", name: "Survey Follow-up", type: "whatsapp", status: "completed", triggered_at: daysAgo(3), target: "+353 85 345 6789" },
      { id: "t10", name: "Slack Notification", type: "notification", status: "completed", triggered_at: daysAgo(1), target: "#sales-team" },
    ],
    rules: [
      { id: "rule1", name: "New Contact Welcome", trigger: "New contact form submission", action: "Send welcome email + WhatsApp after 5 min", is_active: true, last_run: hoursAgo(2), run_count: 87, description: "Sends a welcome message to new leads via email and WhatsApp" },
      { id: "rule2", name: "Survey Reminder", trigger: "Survey booked for tomorrow", action: "Send WhatsApp reminder at 6pm", is_active: true, last_run: daysAgo(1), run_count: 34, description: "Reminds customers about upcoming surveys" },
      { id: "rule3", name: "Post-Survey Review Request", trigger: "Survey marked as completed", action: "Send review request email after 48 hours", is_active: true, last_run: daysAgo(2), run_count: 28, description: "Requests Google/Facebook review after survey completion" },
      { id: "rule4", name: "Inactive Lead Follow-up", trigger: "No response for 7 days", action: "Send follow-up WhatsApp message", is_active: true, last_run: daysAgo(1), run_count: 15, description: "Follows up with leads who haven't responded in a week" },
      { id: "rule5", name: "Qualification Auto-Update", trigger: "WhatsApp conversation reaches 5 messages", action: "Auto-update qualification score", is_active: true, last_run: hoursAgo(4), run_count: 52, description: "Automatically scores conversations based on engagement" },
      { id: "rule6", name: "New Review Slack Alert", trigger: "New 5-star review received", action: "Post to #celebrations Slack channel", is_active: false, last_run: daysAgo(10), run_count: 8, description: "Alerts the team about new positive reviews" },
      { id: "rule7", name: "Failed Payment Retry", trigger: "Payment fails 3 times", action: "Send manual follow-up email to admin", is_active: false, last_run: daysAgo(30), run_count: 2, description: "Notifies admin when payment retries fail" },
    ],
  },

  social: {
    scheduled_posts: [
      { id: "sp1", platform: "facebook", content: "☀️ Did you know? Ireland gets an average of 1,300 sunshine hours per year – that's plenty for solar panels to generate significant savings! 🇮🇪 #SolarIreland #GoSolar", scheduled_at: futureDate(1) + "T10:00:00Z", status: "scheduled" },
      { id: "sp2", platform: "instagram", content: "Swipe to see another stunning installation in Co. Wicklow 🏡✨ 6kW system generating 5,200 kWh/year!", scheduled_at: futureDate(2) + "T14:00:00Z", status: "scheduled" },
      { id: "sp3", platform: "tiktok", content: "POV: You just got your first solar panel bill and it's €0 💡☀️ #SolarPanels #Ireland #EnergySavings #SEAI", scheduled_at: futureDate(3) + "T19:00:00Z", status: "draft" },
      { id: "sp4", platform: "linkedin", content: "Proud to announce Solar Ireland has now completed 200+ residential installations across 26 counties. Thank you to our amazing team and customers! 🌞", scheduled_at: futureDate(5) + "T09:00:00Z", status: "scheduled" },
      { id: "sp5", platform: "facebook", content: "📊 Customer spotlight: Tom from Kerry saved €420 in his first quarter with solar + battery. Here's what he had to say... 👇", scheduled_at: daysAgo(1) + "T11:00:00Z", status: "published" },
    ],
  },

  activity: {
    contacts: [
      { id: "a1", type: "contact", title: "New lead: Sean O'Brien", description: "Submitted via website contact form", timestamp: hoursAgo(2) },
      { id: "a2", type: "contact", title: "New lead: Aoife Murphy", description: "Referred from Facebook campaign", timestamp: hoursAgo(5) },
      { id: "a3", type: "contact", title: "New lead: Michael Walsh", description: "Submitted via website", timestamp: hoursAgo(8) },
      { id: "a4", type: "contact", title: "Lead contacted: Patrick Kelly", description: "Follow-up call completed", timestamp: daysAgo(1) },
    ],
    surveys: [
      { id: "a5", type: "survey", title: "Survey booked: Sean O'Brien", description: "Dublin – confirmed for next Thursday", timestamp: daysAgo(1) },
      { id: "a6", type: "survey", title: "Survey completed: Tom McCarthy", description: "Kerry – 6kW system recommended", timestamp: daysAgo(1) },
      { id: "a7", type: "survey", title: "Survey completed: Lisa Hayes", description: "Tipperary – 4kW + 5kWh battery", timestamp: daysAgo(3) },
    ],
    whatsapp: [
      { id: "a8", type: "whatsapp", title: "Conversation started: Brian Hughes", description: "Asking about pricing", timestamp: hoursAgo(4) },
      { id: "a9", type: "whatsapp", title: "Lead qualified: Niamh O'Connor", description: "Score: 75 – ready for survey booking", timestamp: daysAgo(1) },
      { id: "a10", type: "whatsapp", title: "Survey booked: Sarah Byrne", description: "Via WhatsApp conversation", timestamp: daysAgo(1) },
    ],
  },
};

// ============================================================
// Helper functions for mock data generation
// ============================================================

function hoursAgo(n: number): string {
  const d = new Date(NOW);
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function minutesAgo(n: number): string {
  const d = new Date(NOW);
  d.setMinutes(d.getMinutes() - n);
  return d.toISOString();
}
