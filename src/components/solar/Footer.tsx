'use client';

import { MessageCircle, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05]">
      {/* Amber divider */}
      <div className="amber-line" />

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Company */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <img src="/logo-sm.png" alt="Solar Ireland" className="h-9 w-auto" />
              <span className="font-bold text-lg text-white">Solar Ireland</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              SEAI-registered solar panel installers. Honest advice, quality
              installations, no pressure.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 mb-5">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li className="hover:text-gray-400 transition-colors cursor-default">Solar PV Installation</li>
              <li className="hover:text-gray-400 transition-colors cursor-default">Battery Storage</li>
              <li className="hover:text-gray-400 transition-colors cursor-default">Free Home Surveys</li>
              <li className="hover:text-gray-400 transition-colors cursor-default">SEAI Grant Assistance</li>
              <li className="hover:text-gray-400 transition-colors cursor-default">BER Assessment</li>
            </ul>
          </div>

          {/* Areas */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 mb-5">
              Service Areas
            </h4>
            <div className="flex items-start gap-2.5 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-amber-400/40" />
              <ul className="space-y-2.5">
                <li>Connacht</li>
                <li>Leinster</li>
                <li>Munster</li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500 mb-5">
              Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:cal@solarireland.com"
                  className="flex items-center gap-2.5 text-gray-600 hover:text-amber-400 transition-colors"
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
                  className="flex items-center gap-2.5 text-gray-600 hover:text-amber-400 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
              <li className="text-gray-700 text-xs pt-1">
                +353 87 395 8424
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-700">
            &copy; {new Date().getFullYear()} Solar Ireland. All rights reserved.
          </p>
          <p className="text-[11px] text-gray-700">
            SEAI Registered Installer
          </p>
        </div>
      </div>
    </footer>
  );
}
