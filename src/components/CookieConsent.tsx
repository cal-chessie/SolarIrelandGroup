'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { Cookie, X, ChevronRight, Shield, BarChart3, Megaphone, Check } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

type CookieCategory = 'necessary' | 'analytics' | 'marketing';

interface ConsentState {
  accepted: boolean;
  timestamp: number;
  categories: Record<CookieCategory, boolean>;
}

interface CookieCategoryConfig {
  id: CookieCategory;
  label: string;
  description: string;
  icon: ReactNode;
  required: boolean;
  examples: string[];
}

const STORAGE_KEY = 'solar-ireland-cookie-consent';
const CONSENT_EXPIRY_DAYS = 365;

const CATEGORIES: CookieCategoryConfig[] = [
  {
    id: 'necessary',
    label: 'Necessary',
    description: 'These cookies are essential for the website to function properly. They cannot be disabled.',
    icon: <Shield className="w-5 h-5" />,
    required: true,
    examples: ['Session cookies', 'Security tokens', 'Consent preferences'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Help us understand how visitors interact with our website so we can improve the experience.',
    icon: <BarChart3 className="w-5 h-5" />,
    required: false,
    examples: ['Google Analytics', 'Page view tracking', 'Anonymous usage data'],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Used to track visitors across websites to display relevant advertisements.',
    icon: <Megaphone className="w-5 h-5" />,
    required: false,
    examples: ['Facebook Pixel', 'Google Ads', 'Retargeting'],
  },
];

/* ═══════════════════════════════════════════════════════════════
   LOCAL STORAGE HELPERS
   ═══════════════════════════════════════════════════════════════ */

function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ConsentState;
    // Check if consent has expired
    const ageMs = Date.now() - data.timestamp;
    const maxAgeMs = CONSENT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    if (ageMs > maxAgeMs) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveConsent(consent: ConsentState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // localStorage might be blocked
  }
}

function dispatchConsentEvent(consent: ConsentState): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('cookie-consent-update', { detail: consent })
  );
}

/* ═══════════════════════════════════════════════════════════════
   CUSTOM HOOK — useCookieConsent
   Can be used by other components to check consent status
   ═══════════════════════════════════════════════════════════════ */

export function useCookieConsent(): {
  hasConsented: boolean;
  isCategoryEnabled: (cat: CookieCategory) => boolean;
  openSettings: () => void;
  refreshConsent: () => void;
} {
  const [consent, setConsent] = useState<ConsentState | null>(null);

  const refreshConsent = useCallback(() => {
    setConsent(getStoredConsent());
  }, []);

  useEffect(() => {
    refreshConsent();
    const handler = () => refreshConsent();
    window.addEventListener('cookie-consent-update', handler);
    return () => window.removeEventListener('cookie-consent-update', handler);
  }, [refreshConsent]);

  return {
    hasConsented: consent?.accepted ?? false,
    isCategoryEnabled: (cat: CookieCategory) => consent?.categories?.[cat] ?? false,
    openSettings: () => {
      window.dispatchEvent(new CustomEvent('cookie-consent-open-settings'));
    },
    refreshConsent,
  };
}

/* ═══════════════════════════════════════════════════════════════
   TOGGLE SWITCH COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function ToggleSwitch({
  enabled,
  disabled,
  onChange,
}: {
  enabled: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-colors duration-300 ease-out
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400/50
        ${enabled
          ? 'bg-amber-500'
          : disabled
            ? 'bg-white/10 cursor-not-allowed'
            : 'bg-white/15 hover:bg-white/20'
        }
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 rounded-full
          shadow-sm transition-all duration-300 ease-out
          ${enabled
            ? 'translate-x-5 bg-white'
            : 'translate-x-0 bg-white/50'
          }
        `}
      />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CATEGORY ROW COMPONENT
   ═══════════════════════════════════════════════════════════════ */

function CategoryRow({
  category,
  enabled,
  onToggle,
}: {
  category: CookieCategoryConfig;
  enabled: boolean;
  onToggle: (val: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`
        rounded-xl border transition-all duration-300
        ${expanded
          ? 'border-white/10 bg-white/[0.04]'
          : 'border-transparent bg-white/[0.02] hover:bg-white/[0.03]'
        }
      `}
    >
      {/* Category header row */}
      <div className="flex items-center gap-3 p-3 sm:p-4">
        <div
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
            ${category.required
              ? 'bg-amber-500/10 text-amber-400'
              : enabled
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-white/5 text-white/30'
            }
          `}
        >
          {category.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-white/90">{category.label}</h4>
            {category.required && (
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Always On
              </span>
            )}
          </div>
          <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{category.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <ToggleSwitch enabled={enabled} disabled={category.required} onChange={onToggle} />
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={`
              p-1 rounded-md transition-transform duration-300
              text-white/30 hover:text-white/60
              ${expanded ? 'rotate-90' : 'rotate-0'}
            `}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable details */}
      <div
        className={`
          grid transition-all duration-500 ease-out
          ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
        `}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-0">
            <div className="border-t border-white/5 pt-3">
              <p className="text-xs text-white/40 leading-relaxed mb-2">{category.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {category.examples.map((ex) => (
                  <span
                    key={ex}
                    className="inline-flex items-center rounded-md bg-white/[0.04] px-2 py-1 text-[11px] text-white/30"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLOATING COOKIE SETTINGS BUTTON
   Shown after consent is given — lets users change preferences
   ═══════════════════════════════════════════════════════════════ */

function FloatingCookieButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        cookie-settings-fab
        fixed bottom-24 right-6 z-[45]
        flex h-11 w-11 items-center justify-center
        rounded-full
        bg-white/[0.06] border border-white/[0.08]
        text-white/40 hover:text-amber-400 hover:bg-white/[0.08] hover:border-white/[0.12]
        transition-all duration-300 ease-out
        cursor-pointer
        group
      "
      aria-label="Cookie settings"
    >
      <Cookie className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110" />
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COOKIE CONSENT BANNER
   ═══════════════════════════════════════════════════════════════ */

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsOnly, setShowSettingsOnly] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Category toggle states (default: necessary ON, others OFF — GDPR opt-in)
  const [categories, setCategories] = useState<Record<CookieCategory, boolean>>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  // Check for existing consent on mount
  useEffect(() => {
    const existing = getStoredConsent();
    setIsHydrated(true);

    if (existing?.accepted) {
      // Already consented — show floating button only
      setCategories(existing.categories);
      setIsDismissed(true);
      setVisible(false);
    } else {
      // No consent yet — show banner (slight delay for smooth page load)
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for open-settings event from floating button
  useEffect(() => {
    const handler = () => {
      setShowSettingsOnly(true);
      setShowSettings(true);
    };
    window.addEventListener('cookie-consent-open-settings', handler);
    return () => window.removeEventListener('cookie-consent-open-settings', handler);
  }, []);

  const handleToggle = useCallback((cat: CookieCategory, val: boolean) => {
    setCategories((prev) => ({ ...prev, [cat]: val }));
  }, []);

  const handleAcceptAll = useCallback(() => {
    const allEnabled: Record<CookieCategory, boolean> = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    const consent: ConsentState = {
      accepted: true,
      timestamp: Date.now(),
      categories: allEnabled,
    };
    saveConsent(consent);
    dispatchConsentEvent(consent);
    setCategories(allEnabled);
    setIsDismissed(true);
    // Animate out
    setTimeout(() => setVisible(false), 300);
  }, []);

  const handleRejectAll = useCallback(() => {
    const necessaryOnly: Record<CookieCategory, boolean> = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    const consent: ConsentState = {
      accepted: true,
      timestamp: Date.now(),
      categories: necessaryOnly,
    };
    saveConsent(consent);
    dispatchConsentEvent(consent);
    setCategories(necessaryOnly);
    setIsDismissed(true);
    setTimeout(() => setVisible(false), 300);
  }, []);

  const handleSavePreferences = useCallback(() => {
    const consent: ConsentState = {
      accepted: true,
      timestamp: Date.now(),
      categories,
    };
    saveConsent(consent);
    dispatchConsentEvent(consent);
    setIsDismissed(true);
    setShowSettingsOnly(false);
    setTimeout(() => setVisible(false), 300);
  }, [categories]);

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleCloseSettingsOnly = useCallback(() => {
    setShowSettingsOnly(false);
    setShowSettings(false);
  }, []);

  // Don't render during SSR — wait for hydration
  if (!isHydrated) return null;

  return (
    <>
      {/* ─── MAIN CONSENT BANNER ─── */}
      {!isDismissed && visible && (
        <div
          className={`
            fixed bottom-0 left-0 right-0 z-[60]
            transition-all duration-500 ease-out
            ${isDismissed ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
          `}
          role="dialog"
          aria-label="Cookie consent"
          aria-modal="false"
        >
          {/* Gradient fade at top */}
          <div className="pointer-events-none h-12 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Backdrop — pointer-events-none so it doesn't block page interaction */}
          <div className="pointer-events-none absolute inset-0 -top-12 bg-black/40" />

          {/* Banner content */}
          <div className="relative mx-auto max-w-2xl px-4 pb-6">
            <div
              className={`
                cookie-banner-card
                rounded-2xl border border-white/[0.08]
                bg-[#111111]/95 p-5 sm:p-6
                shadow-[0_8px_60px_-15px_rgba(0,0,0,0.8)]
                transition-all duration-500 ease-out
              `}
            >
              {/* Header row */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 mt-0.5">
                  <Cookie className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white/90 flex items-center gap-2">
                    We value your privacy
                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-400">
                      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                      GDPR
                    </span>
                  </h3>
                  <p className="text-sm text-white/45 mt-1 leading-relaxed">
                    We use cookies to enhance your experience, analyse site traffic, and personalise content.
                    You can choose which cookies to allow.{' '}
                    <span className="text-amber-400/70">Necessary cookies</span> keep the site working.
                  </p>
                </div>
                {/* Close on settings-only mode */}
                {showSettingsOnly && (
                  <button
                    onClick={handleCloseSettingsOnly}
                    className="shrink-0 p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* ─── COMPACT VIEW (before settings expanded) ─── */}
              {!showSettings && !showSettingsOnly && (
                <div
                  className="
                    cookie-buttons-compact
                    mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3
                  "
                >
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="
                      cookie-btn-accept
                      flex-1 flex items-center justify-center gap-2
                      rounded-xl bg-amber-500 px-5 py-3
                      text-sm font-semibold text-black
                      hover:bg-amber-400 active:scale-[0.98]
                      transition-all duration-200 ease-out cursor-pointer
                    "
                  >
                    <Check className="w-4 h-4" />
                    Accept All Cookies
                  </button>

                  <button
                    type="button"
                    onClick={handleRejectAll}
                    className="
                      cookie-btn-reject
                      flex-1 flex items-center justify-center gap-2
                      rounded-xl border border-white/10 bg-white/[0.03]
                      px-5 py-3 text-sm font-medium text-white/60
                      hover:bg-white/[0.06] hover:text-white/80 active:scale-[0.98]
                      transition-all duration-200 ease-out cursor-pointer
                    "
                  >
                    Reject All
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenSettings}
                    className="
                      cookie-btn-manage
                      flex items-center justify-center gap-2
                      rounded-xl border border-white/[0.06] bg-transparent
                      px-5 py-3 text-sm font-medium text-white/40
                      hover:text-amber-400 hover:border-amber-500/20 active:scale-[0.98]
                      transition-all duration-200 ease-out cursor-pointer
                    "
                  >
                    <Cookie className="w-4 h-4" />
                    <span className="hidden sm:inline">Manage</span>
                  </button>
                </div>
              )}

              {/* ─── EXPANDED SETTINGS VIEW ─── */}
              {(showSettings || showSettingsOnly) && (
                <div
                  className="
                    cookie-settings-panel
                    mt-5 space-y-2.5
                  "
                >
                  {/* Category toggles */}
                  {CATEGORIES.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      enabled={categories[cat.id]}
                      onToggle={(val) => handleToggle(cat.id, val)}
                    />
                  ))}

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSavePreferences}
                      className="
                        cookie-btn-save
                        flex-1 flex items-center justify-center gap-2
                        rounded-xl bg-amber-500 px-5 py-3
                        text-sm font-semibold text-black
                        hover:bg-amber-400 active:scale-[0.98]
                        transition-all duration-200 ease-out cursor-pointer
                      "
                    >
                      <Check className="w-4 h-4" />
                      Save Preferences
                    </button>

                    <button
                      type="button"
                      onClick={handleAcceptAll}
                      className="
                        cookie-btn-accept-all
                        flex-1 flex items-center justify-center gap-2
                        rounded-xl border border-amber-500/20 bg-amber-500/5
                        px-5 py-3 text-sm font-medium text-amber-400
                        hover:bg-amber-500/10 active:scale-[0.98]
                        transition-all duration-200 ease-out cursor-pointer
                      "
                    >
                      Accept All
                    </button>

                    {!showSettingsOnly && (
                      <button
                        type="button"
                        onClick={handleRejectAll}
                        className="
                          cookie-btn-reject-sm
                          flex items-center justify-center gap-2
                          rounded-xl border border-white/[0.06] bg-transparent
                          px-5 py-3 text-sm font-medium text-white/30
                          hover:text-white/50 active:scale-[0.98]
                          transition-all duration-200 ease-out cursor-pointer
                        "
                      >
                        Reject All
                      </button>
                    )}
                  </div>

                  {/* Policy links */}
                  <p className="text-center text-[11px] text-white/20 pt-1">
                    By consenting, you agree to our{' '}
                    <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href="#" className="underline underline-offset-2 hover:text-white/40 transition-colors">
                      Cookie Policy
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── FLOATING SETTINGS BUTTON (shown after consent) ─── */}
      {isHydrated && isDismissed && !showSettingsOnly && (
        <FloatingCookieButton
          onClick={() => {
            setShowSettingsOnly(true);
            setVisible(true);
            setIsDismissed(false);
            setShowSettings(true);
          }}
        />
      )}
    </>
  );
}
