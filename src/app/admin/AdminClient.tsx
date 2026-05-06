"use client";

import { useState, useMemo } from "react";
import {
  LayoutDashboard, Users, MessageSquare, Calendar, Star, Zap,
  Settings, TrendingUp, Phone, Mail, Clock, ChevronRight,
  AlertTriangle, CheckCircle2, XCircle, RefreshCw, Sun,
  Globe, FileText, BarChart3, ArrowUpRight, ArrowDownRight,
  Activity, Bot, Send, ExternalLink,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";

// ============================================================================
// MOCK DATA — used when Supabase is not available
// ============================================================================
const MOCK = {
  lead_funnel: { new_contacts_today: 7, contacts_this_week: 34, contacts_this_month: 112, pending_surveys_today: 4 },
  reviews: { average_rating: "4.9", total_reviews: 42, new_reviews_this_month: 8 },
  whatsapp: { conversations: [], qualified: 5, active: 12 },
  recent_leads: {
    contacts: [
      { id: "1", name: "Sean Murphy", email: "sean@email.com", county: "Dublin", status: "new", created_at: "2026-04-11T09:30:00Z", source_page: "/contact" },
      { id: "2", name: "Aoife Kelly", email: "aoife@email.com", county: "Cork", status: "new", created_at: "2026-04-11T10:15:00Z", source_page: "/book-survey" },
      { id: "3", name: "Paddy O'Brien", email: "paddy@email.com", county: "Galway", status: "contacted", created_at: "2026-04-11T08:45:00Z", source_page: "/contact" },
      { id: "4", name: "Siobhan Walsh", email: "siobhan@email.com", county: "Limerick", status: "new", created_at: "2026-04-11T07:20:00Z", source_page: "/solar-calculator" },
      { id: "5", name: "Conor Byrne", email: "conor@email.com", county: "Kildare", status: "qualified", created_at: "2026-04-10T14:30:00Z", source_page: "/book-survey" },
    ],
    surveys: [
      { id: "1", reference: "SI-2026-0087", first_name: "Sean", last_name: "Murphy", email: "sean@email.com", phone: "0871234567", county: "Dublin", preferred_date: "2026-04-18", preferred_time: "Morning (9-12)", status: "pending", created_at: "2026-04-11T09:30:00Z" },
      { id: "2", reference: "SI-2026-0088", first_name: "Aoife", last_name: "Kelly", email: "aoife@email.com", phone: "0879876543", county: "Cork", preferred_date: "2026-04-19", preferred_time: "Afternoon (12-3)", status: "confirmed", created_at: "2026-04-11T10:15:00Z" },
      { id: "3", reference: "SI-2026-0089", first_name: "Paddy", last_name: "O'Brien", email: "paddy@email.com", phone: "0877654321", county: "Galway", preferred_date: "2026-04-20", preferred_time: "Evening (3-5)", status: "pending", created_at: "2026-04-11T08:45:00Z" },
    ],
    whatsapp: [
      { id: "1", phone_number: "353871234567", display_name: "Mary", lead_stage: "qualified", qualification_score: 95, status: "completed", last_message_at: "2026-04-11T11:00:00Z", session_count: 12 },
      { id: "2", phone_number: "353859876543", display_name: "John D", lead_stage: "county", qualification_score: 45, status: "active", last_message_at: "2026-04-11T10:45:00Z", session_count: 5 },
      { id: "3", phone_number: "353862345678", display_name: "Fiona", lead_stage: "contact_details", qualification_score: 70, status: "active", last_message_at: "2026-04-11T10:30:00Z", session_count: 8 },
      { id: "4", phone_number: "353831234567", display_name: null, lead_stage: "greeting", qualification_score: 10, status: "active", last_message_at: "2026-04-11T10:15:00Z", session_count: 1 },
    ],
  },
  surveys: {
    upcoming: [
      { id: "1", reference: "SI-2026-0087", first_name: "Sean", last_name: "Murphy", county: "Dublin", preferred_date: "2026-04-18", preferred_time: "Morning (9-12)", status: "pending" },
      { id: "3", reference: "SI-2026-0089", first_name: "Paddy", last_name: "O'Brien", county: "Galway", preferred_date: "2026-04-20", preferred_time: "Evening (3-5)", status: "pending" },
    ],
    recent_bookings: [],
  },
  recent_reviews: [
    { id: "1", reviewer_name: "Eamonn D.", rating: 5, text: "Absolutely brilliant service from start to finish. The team was professional, the installation was clean, and we're already seeing savings on our electricity bill. Highly recommend!", created_at: "2026-04-10T14:00:00Z", source: "google" },
    { id: "2", reviewer_name: "Rachel M.", rating: 5, text: "From initial survey to installation took 3 weeks. The GivEnergy system is fantastic and the monitoring app is brilliant. 5 stars all around.", created_at: "2026-04-09T09:00:00Z", source: "google" },
    { id: "3", reviewer_name: "David K.", rating: 4, text: "Great quality panels and professional installers. Only minor issue was scheduling the survey took longer than expected, but overall very happy with the result.", created_at: "2026-04-08T11:00:00Z", source: "google" },
    { id: "4", reviewer_name: "Aine B.", rating: 5, text: "We got solar + battery and it's been transformative. Our bill went from EUR 220/month to EUR 40. The SEAI grant process was handled entirely by Solar Ireland.", created_at: "2026-04-07T16:00:00Z", source: "google" },
    { id: "5", reviewer_name: "Thomas O.", rating: 5, text: "Best investment we've made for our home. Clean, efficient, and the team was a pleasure to deal with. Would recommend to anyone considering solar.", created_at: "2026-04-06T13:00:00Z", source: "google" },
  ],
  automation: {
    pending_tasks: 3,
    failed_tasks: 1,
    tasks_this_week: 23,
    tasks: [
      { id: "1", action_type: "request_review", status: "pending", scheduled_at: "2026-04-11T12:00:00Z", customer_name: "Sean Murphy", created_at: "2026-04-11T09:30:00Z" },
      { id: "2", action_type: "send_whatsapp", status: "pending", scheduled_at: "2026-04-11T10:00:00Z", customer_name: "Aoife Kelly", created_at: "2026-04-11T10:15:00Z" },
      { id: "3", action_type: "create_gbp_post", status: "failed", scheduled_at: "2026-04-11T09:00:00Z", error_message: "GBP API rate limit", created_at: "2026-04-11T08:00:00Z" },
    ],
    rules: [
      { id: "1", name: "Request review after installation", trigger_type: "customer_stage_change", action_type: "request_review", is_active: true, run_count: 23, last_run_at: "2026-04-10T16:00:00Z" },
      { id: "2", name: "Request review after grant approval", trigger_type: "customer_stage_change", action_type: "request_review", is_active: true, run_count: 15, last_run_at: "2026-04-09T14:00:00Z" },
      { id: "3", name: "Promote new blog to GBP", trigger_type: "schedule", action_type: "create_gbp_post", is_active: true, run_count: 4, last_run_at: "2026-04-07T10:00:00Z" },
      { id: "4", name: "Notify admin of WhatsApp lead", trigger_type: "customer_stage_change", action_type: "notify_admin", is_active: true, run_count: 8, last_run_at: "2026-04-11T09:00:00Z" },
      { id: "5", name: "Send survey reminder", trigger_type: "schedule", action_type: "send_whatsapp", is_active: true, run_count: 31, last_run_at: "2026-04-11T08:00:00Z" },
      { id: "6", name: "Follow-up unreviewed installs", trigger_type: "schedule", action_type: "request_review", is_active: true, run_count: 12, last_run_at: "2026-04-11T09:00:00Z" },
    ],
  },
  social: { scheduled_posts: [
    { id: "1", content: "Thinking about solar panels? Our latest blog breaks down the real costs, grants, and savings for Irish homeowners in 2026.", platforms: ["facebook", "instagram", "linkedin"], scheduled_at: "2026-04-12T10:00:00Z", status: "scheduled", source: "blog_auto" },
    { id: "2", content: "Another happy customer generating clean energy! Our 200th installation is now live. Thank you for trusting Solar Ireland.", platforms: ["facebook", "instagram"], scheduled_at: "2026-04-14T14:00:00Z", status: "draft", source: "manual" },
  ]},
  weekly_trends: [
    { day: "Mon", leads: 3, surveys: 1 },
    { day: "Tue", leads: 5, surveys: 2 },
    { day: "Wed", leads: 4, surveys: 1 },
    { day: "Thu", leads: 7, surveys: 3 },
    { day: "Fri", leads: 6, surveys: 2 },
    { day: "Sat", leads: 5, surveys: 2 },
    { day: "Sun", leads: 4, surveys: 1 },
  ],
  rating_distribution: [
    { name: "5 Stars", value: 35, color: "#f59e0b" },
    { name: "4 Stars", value: 5, color: "#3b82f6" },
    { name: "3 Stars", value: 2, color: "#6b7280" },
  ],
};

// ============================================================================
// Types
// ============================================================================
interface DashboardData {
  lead_funnel: { new_contacts_today: number; contacts_this_week: number; contacts_this_month: number; pending_surveys_today: number };
  reviews: { average_rating: string; total_reviews: number; new_reviews_this_month: number };
  whatsapp: { conversations: any[]; qualified: number; active: number };
  automation: { pending_tasks: number; failed_tasks: number; tasks_this_week: number; tasks: any[]; rules: any[] };
  recent_leads: { contacts: any[]; surveys: any[]; whatsapp: any[] };
  surveys: { upcoming: any[]; recent_bookings: any[] };
  recent_reviews: any[];
  social: { scheduled_posts: any[] };
}

type Tab = "overview" | "leads" | "whatsapp" | "surveys" | "reviews" | "automation" | "social";

// ============================================================================
// Stage color helper
// ============================================================================
function stageColor(stage: string): string {
  const colors: Record<string, string> = {
    greeting: "bg-gray-100 text-gray-600",
    interest_check: "bg-blue-50 text-blue-700",
    property_type: "bg-cyan-50 text-cyan-700",
    roof_type: "bg-indigo-50 text-indigo-700",
    county: "bg-violet-50 text-violet-700",
    contact_details: "bg-purple-50 text-purple-700",
    survey_booking: "bg-amber-50 text-amber-700",
    qualified: "bg-emerald-100 text-emerald-700",
    not_interested: "bg-red-50 text-red-600",
    callback_requested: "bg-orange-50 text-orange-700",
    new: "bg-blue-50 text-blue-700",
    contacted: "bg-yellow-50 text-yellow-700",
    converted: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    confirmed: "bg-green-50 text-green-700",
  };
  return colors[stage] || "bg-gray-100 text-gray-600";
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    running: "bg-blue-50 text-blue-700 ring-blue-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    failed: "bg-red-50 text-red-600 ring-red-200",
    skipped: "bg-gray-50 text-gray-500 ring-gray-200",
    draft: "bg-gray-50 text-gray-500 ring-gray-200",
    scheduled: "bg-blue-50 text-blue-700 ring-blue-200",
    published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };
  return map[status] || "bg-gray-100 text-gray-600";
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AdminClient() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data] = useState<DashboardData>(MOCK);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: "leads", label: "Leads", icon: <Users className="w-5 h-5" />, badge: data.lead_funnel.new_contacts_today },
    { id: "whatsapp", label: "WhatsApp", icon: <MessageSquare className="w-5 h-5" />, badge: data.whatsapp.active },
    { id: "surveys", label: "Surveys", icon: <Calendar className="w-5 h-5" />, badge: data.lead_funnel.pending_surveys_today },
    { id: "reviews", label: "Reviews", icon: <Star className="w-5 h-5" /> },
    { id: "automation", label: "Automation", icon: <Zap className="w-5 h-5" />, badge: data.automation.pending_tasks },
    { id: "social", label: "Social", icon: <Globe className="w-5 h-5" /> },
  ];

  const allRecent = useMemo(() => {
    const items: any[] = [
      ...data.recent_leads.contacts.map((c: any) => ({ ...c, _type: "contact" })),
      ...data.recent_leads.surveys.map((s: any) => ({ ...s, _type: "survey" })),
      ...data.recent_leads.whatsapp.map((w: any) => ({ ...w, name: w.display_name || w.phone_number, _type: "whatsapp" })),
    ];
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return items;
  }, [data]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-gray-900 text-white flex flex-col transition-all duration-200`}>
        <div className="p-4 flex items-center gap-3 border-b border-gray-800">
          <Sun className="w-8 h-8 text-amber-400 flex-shrink-0" />
          {sidebarOpen && <span className="font-bold text-lg">Solar Admin</span>}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {t.icon}
              {sidebarOpen && <span>{t.label}</span>}
              {sidebarOpen && t.badge !== undefined && t.badge > 0 && (
                <span className="ml-auto bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">{t.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span>Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {tabs.find(t => t.id === tab)?.label}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString("en-IE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {tab === "overview" && <OverviewTab data={data} allRecent={allRecent} />}
          {tab === "leads" && <LeadsTab data={data} />}
          {tab === "whatsapp" && <WhatsAppTab data={data} />}
          {tab === "surveys" && <SurveysTab data={data} />}
          {tab === "reviews" && <ReviewsTab data={data} />}
          {tab === "automation" && <AutomationTab data={data} />}
          {tab === "social" && <SocialTab data={data} />}
        </div>
      </main>
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB
// ============================================================================
function OverviewTab({ data, allRecent }: { data: DashboardData; allRecent: any[] }) {
  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users />} label="New Leads Today" value={data.lead_funnel.new_contacts_today} change="+3 vs yesterday" trend="up" color="blue" />
        <StatCard icon={<Calendar />} label="Pending Surveys" value={data.lead_funnel.pending_surveys_today} change="2 this week" trend="up" color="amber" />
        <StatCard icon={<MessageSquare />} label="WhatsApp Active" value={data.whatsapp.active} change={`${data.whatsapp.qualified} qualified`} trend="up" color="green" />
        <StatCard icon={<Star />} label="Avg Rating" value={data.reviews.average_rating} change={`${data.reviews.total_reviews} total reviews`} trend="up" color="amber" />
      </div>

      {/* Lead funnel + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead funnel chart */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Lead Funnel — This Month
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { stage: "Contact Forms", value: data.lead_funnel.contacts_this_month },
              { stage: "Survey Booked", value: Math.round(data.lead_funnel.contacts_this_month * 0.65) },
              { stage: "Qualified", value: Math.round(data.lead_funnel.contacts_this_month * 0.35) },
              { stage: "Converted", value: Math.round(data.lead_funnel.contacts_this_month * 0.18) },
            ]} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="stage" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }}
                formatter={(value: any) => [value, "Leads"] as const}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                <Cell fill="#3b82f6" />
                <Cell fill="#6366f1" />
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-2">Conversion rate: 18% of all contacts → installed customer</p>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" /> Recent Activity
          </h2>
          <div className="space-y-3">
            {allRecent.slice(0, 8).map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stageColor(item.status || item._type)} text-xs font-bold`}>
                  {item._type === "contact" ? "📧" : item._type === "survey" ? "📅" : "💬"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name || "Unknown"}</p>
                  <p className="text-xs text-gray-500 truncate">{item.email || item.phone_number || item._type}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${stageColor(item.status || item._type)}`}>
                    {item.status || item._type}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming surveys + Recent reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Upcoming Surveys
          </h2>
          {data.surveys.upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No upcoming surveys</p>
          ) : (
            <div className="space-y-2">
              {data.surveys.upcoming.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.reference}</p>
                    <p className="text-xs text-gray-500">{s.first_name} {s.last_name} — {s.county}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{s.preferred_date}</p>
                    <p className="text-xs text-gray-500">{s.preferred_time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5" /> Latest Reviews
          </h2>
          <div className="space-y-3">
            {data.recent_reviews.slice(0, 3).map((r: any) => (
              <div key={r.id} className="py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">{r.reviewer_name}</p>
                  <Stars rating={r.rating} />
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.text}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(r.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leads This Week trend */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Leads This Week
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={MOCK.weekly_trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }}
            />
            <Line type="monotone" dataKey="leads" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", r: 5 }} activeDot={{ r: 7 }} name="Leads" />
            <Line type="monotone" dataKey="surveys" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} activeDot={{ r: 7 }} name="Surveys Booked" />
            <Legend iconType="circle" wrapperStyle={{ fontSize: "13px" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Automation status */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" /> Automation Status
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-700">{data.automation.tasks_this_week}</p>
            <p className="text-xs text-gray-600">Tasks this week</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <p className="text-2xl font-bold text-amber-700">{data.automation.pending_tasks}</p>
            <p className="text-xs text-gray-600">Pending tasks</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">{data.automation.failed_tasks}</p>
            <p className="text-xs text-gray-600">Failed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LEADS TAB
// ============================================================================
function LeadsTab({ data }: { data: DashboardData }) {
  const [subTab, setSubTab] = useState<"contacts" | "surveys">("contacts");
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setSubTab("contacts")} className={`px-4 py-2 text-sm font-medium rounded-lg ${subTab === "contacts" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border"}`}>Contact Forms ({data.recent_leads.contacts.length})</button>
        <button onClick={() => setSubTab("surveys")} className={`px-4 py-2 text-sm font-medium rounded-lg ${subTab === "surveys" ? "bg-gray-900 text-white" : "bg-white text-gray-600 border"}`}>Survey Bookings ({data.recent_leads.surveys.length})</button>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {subTab === "contacts" ? (
                <>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">County</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                </>
              ) : (
                <>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">County</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Survey Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(subTab === "contacts" ? data.recent_leads.contacts : data.recent_leads.surveys).map((row: any) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {subTab === "contacts" ? (
                  <>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.email}</td>
                    <td className="px-4 py-3 text-gray-600">{row.county}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stageColor(row.status)}`}>{row.status}</span></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{row.source_page}</td>
                    <td className="px-4 py-3 text-gray-500">{timeAgo(row.created_at)}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-mono font-medium text-amber-700">{row.reference}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.first_name} {row.last_name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.county}</td>
                    <td className="px-4 py-3 text-gray-600">{row.preferred_date} · {row.preferred_time}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stageColor(row.status)}`}>{row.status}</span></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// WHATSAPP TAB
// ============================================================================
function WhatsAppTab({ data }: { data: DashboardData }) {
  const scoreData = useMemo(() =>
    data.recent_leads.whatsapp
      .map((c: any) => ({
        name: c.display_name || c.phone_number.replace(/\d{4}$/, "****"),
        score: c.qualification_score,
        fill: c.qualification_score >= 70 ? "#10b981" : c.qualification_score >= 40 ? "#f59e0b" : "#9ca3af",
      }))
      .sort((a: any, b: any) => b.score - a.score),
    [data]
  );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Active Conversations</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{data.whatsapp.active}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Qualified Leads</p>
          <p className="text-3xl font-bold text-emerald-600 mt-1">{data.whatsapp.qualified}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Conversion Rate</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{data.whatsapp.active > 0 ? Math.round((data.whatsapp.qualified / data.whatsapp.active) * 100) : 0}%</p>
        </div>
      </div>

      {/* Qualification scores chart */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" /> Qualification Scores
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={scoreData} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }} formatter={(value: any) => [`${value}/100`, "Score"] as const} />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {scoreData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Score</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Exchanges</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.recent_leads.whatsapp.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm text-gray-700">{c.phone_number}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{c.display_name || "—"}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stageColor(c.lead_stage)}`}>{c.lead_stage.replace(/_/g, " ")}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${c.qualification_score >= 70 ? "bg-emerald-500" : c.qualification_score >= 40 ? "bg-amber-400" : "bg-gray-400"}`} style={{ width: `${c.qualification_score}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{c.qualification_score}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{c.session_count}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{timeAgo(c.last_message_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// SURVEYS TAB
// ============================================================================
function SurveysTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">County</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Preferred Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Time</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[...data.surveys.upcoming, ...data.recent_leads.surveys].filter((s: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === s.id) === i).map((s: any) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium text-amber-700">{s.reference}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{s.first_name} {s.last_name}</td>
                <td className="px-4 py-3 text-gray-600">{s.county}</td>
                <td className="px-4 py-3 text-gray-700">{s.preferred_date}</td>
                <td className="px-4 py-3 text-gray-600">{s.preferred_time}</td>
                <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stageColor(s.status)}`}>{s.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// REVIEWS TAB
// ============================================================================
function ReviewsTab({ data }: { data: DashboardData }) {
  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Average Rating</p>
          <p className="text-4xl font-bold text-amber-500 mt-1">{data.reviews.average_rating}</p>
          <div className="flex justify-center mt-2"><Stars rating={Math.round(Number(data.reviews.average_rating))} /></div>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Reviews</p>
          <p className="text-4xl font-bold text-gray-900 mt-1">{data.reviews.total_reviews}</p>
        </div>
        <div className="bg-white rounded-xl border p-5 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">New This Month</p>
          <p className="text-4xl font-bold text-emerald-600 mt-1">{data.reviews.new_reviews_this_month}</p>
          <p className="text-xs text-gray-400 mt-1">+{Math.round((data.reviews.new_reviews_this_month / Math.max(data.reviews.total_reviews, 1)) * 100)}% growth</p>
        </div>
      </div>

      {/* Rating distribution donut */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Rating Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={MOCK.rating_distribution}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={3}
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
            >
              {MOCK.rating_distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "13px" }} formatter={(value: any) => [`${value} reviews`, "Count"] as const} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: "13px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">All Reviews</h2>
        <div className="space-y-4">
          {data.recent_reviews.map((r: any) => (
            <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                    {r.reviewer_name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{r.reviewer_name}</p>
                    <p className="text-xs text-gray-400">{timeAgo(r.created_at)} · {r.source}</p>
                  </div>
                </div>
                <Stars rating={r.rating} />
              </div>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AUTOMATION TAB
// ============================================================================
function AutomationTab({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" /> Automation Rules
          </h2>
          <div className="space-y-2">
            {data.automation.rules.map((rule: any) => (
              <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${rule.is_active ? "bg-emerald-500" : "bg-gray-300"}`} />
                    <p className="text-sm font-medium text-gray-900">{rule.name}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {rule.trigger_type} → {rule.action_type} · Run {rule.run_count}x
                  </p>
                </div>
                <span className="text-xs text-gray-400">{rule.last_run_at ? timeAgo(rule.last_run_at) : "Never"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task queue */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" /> Task Queue
          </h2>
          <div className="space-y-2">
            {data.automation.tasks.map((task: any) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  {task.status === "failed" ? <XCircle className="w-5 h-5 text-red-500" /> :
                   task.status === "completed" ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                   <Clock className="w-5 h-5 text-amber-500" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.action_type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-gray-500">{task.customer_name} · {timeAgo(task.scheduled_at)}</p>
                    {task.error_message && <p className="text-xs text-red-500 mt-0.5">{task.error_message}</p>}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SOCIAL TAB
// ============================================================================
function SocialTab({ data }: { data: DashboardData }) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5" /> Scheduled Posts
      </h2>
      {data.social.scheduled_posts.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No scheduled posts</p>
      ) : (
        <div className="space-y-3">
          {data.social.scheduled_posts.map((post: any) => (
            <div key={post.id} className="p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {post.platforms.map((p: string) => (
                    <span key={p} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{p}</span>
                  ))}
                  <span className={`text-xs px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(post.status)}`}>{post.status}</span>
                </div>
                <span className="text-xs text-gray-400">{timeAgo(post.scheduled_at)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{post.content}</p>
              <p className="text-xs text-gray-400 mt-2">Source: {post.source}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================
function StatCard({ icon, label, value, change, trend, color }: { icon: React.ReactNode; label: string; value: string | number; change: string; trend: "up" | "down"; color: string }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color === "blue" ? "bg-blue-50 text-blue-600" : color === "amber" ? "bg-amber-50 text-amber-600" : color === "green" ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
        <p className="text-xs text-gray-500">{change}</p>
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-sm text-gray-500">{value}</p>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
