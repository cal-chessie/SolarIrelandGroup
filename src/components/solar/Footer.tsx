'use client';

import { MessageCircle, Mail, MapPin } from 'lucide-react';
import BumblebeeMascot from './BumblebeeMascot';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#070707]">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BumblebeeMascot size="sm" animate={false} />
              <span className="font-bold text-lg">Solar Ireland</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              SEAI-registered solar panel installers. Honest advice, quality
              installations, no pressure.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li>Solar PV Installation</li>
              <li>Battery Storage</li>
              <li>Free Home Surveys</li>
              <li>SEAI Grant Assistance</li>
              <li>BER Assessment Coordination</li>
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">
              Service Areas
            </h4>
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-amber-400/60" />
              <ul className="space-y-2.5">
                <li>Connacht</li>
                <li>Leinster</li>
                <li>Munster</li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:cal@solarireland.com"
                  className="flex items-center gap-2 text-gray-500 hover:text-amber-400 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  cal@solarireland.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/353873958424?text=Hi%2C%20I%20have%20a%20question%20about%20solar%20panels."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-500 hover:text-amber-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
              <li className="text-gray-600 text-xs">
                Call: +353 87 395 8424
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Solar Ireland. All rights
            reserved.
          </p>
          <p className="text-xs text-gray-600">
            SEAI Registered Installer
          </p>
        </div>
      </div>
    </footer>
  );
}
