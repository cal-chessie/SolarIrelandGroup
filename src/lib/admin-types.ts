// ============================================================
// Admin Dashboard Types
// ============================================================

export interface DashboardMeta {
  generated_at: string;
  source?: string;
}

export interface LeadFunnel {
  new_contacts_today: number;
  contacts_this_week: number;
  contacts_this_month: number;
  pending_surveys_today: number;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  county: string;
  message: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "lost";
  created_at: string;
}

export interface SurveyBooking {
  id: string;
  reference: string;
  contact_name: string;
  email: string;
  phone: string;
  county: string;
  preferred_date: string;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  created_at: string;
}

export interface WhatsAppConversation {
  id: string;
  contact_name: string;
  phone: string;
  stage: "greeting" | "qualified" | "survey_booked" | "not_interested";
  qualification_score: number;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  messages?: WhatsAppMessage[];
}

export interface WhatsAppMessage {
  id: string;
  from: "customer" | "bot";
  text: string;
  timestamp: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  source: string;
  date: string;
  verified: boolean;
}

export interface AutomationTask {
  id: string;
  name: string;
  type: "email" | "whatsapp" | "notification" | "survey";
  status: "pending" | "running" | "completed" | "failed";
  triggered_at: string;
  target: string;
  error?: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  is_active: boolean;
  last_run: string;
  run_count: number;
  description: string;
}

export interface ScheduledPost {
  id: string;
  platform: "facebook" | "instagram" | "tiktok" | "linkedin";
  content: string;
  scheduled_at: string;
  status: "draft" | "scheduled" | "published" | "failed";
  image_url?: string;
}

export interface ActivityItem {
  id: string;
  type: "contact" | "survey" | "whatsapp" | "review" | "automation";
  title: string;
  description: string;
  timestamp: string;
}

export interface RecentLeads {
  contacts: Contact[];
  surveys: SurveyBooking[];
  whatsapp: WhatsAppConversation[];
}

export interface ReviewsData {
  average_rating: string;
  total_reviews: number;
  new_reviews_this_month: number;
  latest: Review[];
  recent_five_star: Review[];
}

export interface SurveysData {
  upcoming: SurveyBooking[];
  recent_bookings: SurveyBooking[];
}

export interface WhatsAppData {
  conversations: WhatsAppConversation[];
  qualified: number;
  active: number;
}

export interface AutomationData {
  pending_tasks: number;
  failed_tasks: number;
  tasks_this_week: number;
  tasks: AutomationTask[];
  rules: AutomationRule[];
}

export interface SocialData {
  scheduled_posts: ScheduledPost[];
}

export interface ActivityData {
  contacts: ActivityItem[];
  surveys: ActivityItem[];
  whatsapp: ActivityItem[];
}

export interface AdminDashboardData {
  meta: DashboardMeta;
  lead_funnel: LeadFunnel;
  recent_leads: RecentLeads;
  reviews: ReviewsData;
  surveys: SurveysData;
  whatsapp: WhatsAppData;
  automation: AutomationData;
  social: SocialData;
  activity: ActivityData;
}

export type DashboardView =
  | "overview"
  | "leads"
  | "whatsapp"
  | "surveys"
  | "reviews"
  | "automation"
  | "social";
