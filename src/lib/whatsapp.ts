import { SOLAR_DATA } from './solar-data';

export function buildWhatsAppUrl(context: {
  source?: string;
  customMessage?: string;
  annualSaving?: number;
  paybackYears?: number;
  total25yrSaving?: number;
  monthlyBill?: number;
  annualUsage?: number;
  homeType?: string;
  recommendedSystem?: number;
  provider?: string;
  eligible?: boolean;
  quickAction?: string;
}) {
  const phone = SOLAR_DATA.provider.whatsapp;
  let text = '';

  if (context.customMessage) {
    text = context.customMessage;
  } else if (context.source === 'bill-analyser' && context.annualSaving) {
    text = `Hi Solar Ireland! I just used your Bill Analyser. Here are my results:\n\n💰 Monthly bill: €${context.monthlyBill}/mo\n🏠 Home: ${context.homeType}\n⚡ Provider: ${context.provider}\n\n📊 Your recommendation:\n• ${context.recommendedSystem}kWp system\n• €${context.annualSaving.toLocaleString()}/yr annual saving\n• ${context.paybackYears} year payback\n• €${context.total25yrSaving?.toLocaleString()} total 25-year savings\n\nI'd love to get a free survey — when's a good time?`;
  } else if (context.source === 'grant-checker') {
    if (context.eligible) {
      text = `Hi! I just used your grant eligibility checker and I appear to qualify for the ${SOLAR_DATA.grant.label} SEAI grant. I'd like to book a free survey.`;
    } else {
      text = `Hi! I checked the grant eligibility tool and I may not qualify for the grant. Can I still get solar panels?`;
    }
  } else if (context.source === 'hero') {
    text = `Hi Solar Ireland! I'd like to learn more about solar panels for my home. When can I get a free survey?`;
  } else if (context.quickAction) {
    text = context.quickAction;
  } else {
    text = `Hi Solar Ireland! I'm interested in solar panels for my home. Can you help?`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
