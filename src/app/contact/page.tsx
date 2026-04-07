import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Solar Ireland | Free Survey, WhatsApp, Phone & Email',
  description: 'Get in touch with Solar Ireland. WhatsApp, phone, email, or fill in our contact form. Free no-obligation solar survey across all 32 counties.',
  alternates: {
    canonical: 'https://solarireland.com/contact',
  },
  openGraph: {
    title: 'Contact Solar Ireland | Free Survey, WhatsApp, Phone & Email',
    description: 'Get in touch with Solar Ireland. WhatsApp, phone, email, or contact form. Free no-obligation solar survey.',
    url: 'https://solarireland.com/contact',
    type: 'website',
    siteName: 'Solar Ireland',
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Solar Ireland | Free Solar Survey',
    description: 'WhatsApp, phone, email, or contact form. Free solar survey.',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
