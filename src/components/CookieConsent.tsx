'use client';

import { useState, useEffect, useCallback, useId, type ReactNode } from 'react';
import { X, ChevronRight, Shield, BarChart3, Megaphone, Check } from 'lucide-react';
import { trackConsentDecision } from '@/lib/analytics';
import { setCookieBannerVisible } from '@/lib/bottomLayer';


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


function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as ConsentState;
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
  }
}

function dispatchConsentEvent(consent: ConsentState): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('cookie-consent-update', { detail: consent })
  );
  // Track consent decision in analytics (fires unconditionally for GA4 via gtag)
  trackConsentDecision(consent.categories.analytics, consent.categories.marketing);
  // Persist consent to Supabase for GDPR audit trail
  persistConsentToSupabase(consent);
}

async function persistConsentToSupabase(consent: ConsentState): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        consent_state: consent.categories,
        source_page: window.location.pathname,
        user_agent: navigator.userAgent,
      }),
    });
  } catch {
    // Silent - consent is already saved to localStorage
  }
}

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


function ToggleSwitch({
  enabled,
  disabled,
  onChange,
  label,
}: {
  enabled: boolean;
  disabled?: boolean;
  onChange: (val: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
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
  const detailsId = useId();

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
          <p className="text-xs text-white/70 mt-0.5 line-clamp-1">{category.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <ToggleSwitch enabled={enabled} disabled={category.required} onChange={onToggle} label={category.label} />
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className={`
              p-1 rounded-md transition-transform duration-300
              text-white/70 hover:text-white
              ${expanded ? 'rotate-90' : 'rotate-0'}
            `}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        id={detailsId}
        className={`
          grid transition-all duration-500 ease-out
          ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}
        `}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-0">
            <div className="border-t border-white/5 pt-3">
              <p className="text-xs text-white/70 leading-relaxed mb-2">{category.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {category.examples.map((ex) => (
                  <span
                    key={ex}
                    className="inline-flex items-center rounded-md bg-white/[0.04] px-2 py-1 text-[11px] text-white/70"
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


// The floating round cookie button is gone (Cal, 11 Nov): on phones it sat
// over CTAs. "Cookie settings" in the footer reopens the choice.


export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSettingsOnly, setShowSettingsOnly] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const [categories, setCategories] = useState<Record<CookieCategory, boolean>>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  // Tell the sticky CTA and the chat bubble to stand down while this sheet is
  // up, so it does not bury them in the same corner.
  useEffect(() => {
    setCookieBannerVisible(visible && !isDismissed);
    return () => setCookieBannerVisible(false);
  }, [visible, isDismissed]);

  useEffect(() => {
    const existing = getStoredConsent();
    setIsHydrated(true);

    if (existing?.accepted) {
      setCategories(existing.categories);
      setIsDismissed(true);
      setVisible(false);
    } else {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // "Cookie settings" (footer, intake) reopens the choice after one was made.
    // It used to set the settings flags only, which drew nothing once the
    // banner was dismissed; the floating cookie button did the reopening.
    const handler = () => {
      setShowSettingsOnly(true);
      setShowSettings(true);
      setIsDismissed(false);
      setVisible(true);
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

  // The intake's own cookie line (IntakeApp, shown while the intake owns the
  // screen) sends its Accept / Essential only here. Nothing listened before.
  useEffect(() => {
    const onAction = (e: Event) => {
      const what = (e as CustomEvent).detail;
      if (what === 'accept') handleAcceptAll();
      else if (what === 'reject') handleRejectAll();
    };
    window.addEventListener('sig:cookie-action', onAction);
    return () => window.removeEventListener('sig:cookie-action', onAction);
  }, [handleAcceptAll, handleRejectAll]);

  if (!isHydrated) return null;

  return (
    <>
      {!isDismissed && visible && (
        /* A slim bar on phones, a small bottom-left card from sm up (Cal, 11 Nov).
           No backdrop and no modal: the page scrolls and stays tappable behind
           it. Reject and Accept are the same size and weight, side by side
           (Irish DPC guidance), nothing pre-ticked. intake.css hides it while
           the intake or the analyser owns the bottom of a phone screen. */
        <div
          className="cookie-banner-root pointer-events-none fixed inset-x-0 bottom-0 z-[60] sm:inset-x-auto sm:left-4 sm:bottom-4 sm:w-[22rem]"
          role="region"
          aria-label="Cookie consent"
        >
          <div
            className="cookie-banner-card pointer-events-auto max-h-[85vh] overflow-y-auto border-t border-white/[0.08] bg-[#111111]/95 backdrop-blur-md px-4 pt-3 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.7)] sm:rounded-2xl sm:border sm:p-4"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
          >
              <div className="flex items-start gap-3">
                <p className="flex-1 min-w-0 text-[13px] sm:text-sm text-white/80 leading-snug">
                  We use cookies to see which pages help. Your choice.{' '}
                  {!showSettings && !showSettingsOnly && (
                    <button
                      type="button"
                      onClick={handleOpenSettings}
                      className="text-amber-400 underline underline-offset-2 hover:text-amber-300"
                    >
                      Settings
                    </button>
                  )}
                </p>
                {showSettingsOnly && (
                  <button
                    onClick={handleCloseSettingsOnly}
                    className="shrink-0 -m-1.5 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {!showSettings && !showSettingsOnly && (
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleRejectAll}
                    className="cookie-btn-reject min-h-11 rounded-xl border border-white/15 bg-white/[0.03] px-3 text-sm font-semibold text-white hover:bg-white/[0.06] hover:border-white/25 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="cookie-btn-accept min-h-11 rounded-xl bg-amber-400 px-3 text-sm font-semibold text-black hover:bg-amber-300 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  >
                    Accept
                  </button>
                </div>
              )}

              {(showSettings || showSettingsOnly) && (
                <div
                  className="
                    cookie-settings-panel
                    mt-5 space-y-2.5
                  "
                >
                  {CATEGORIES.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      enabled={categories[cat.id]}
                      onToggle={(val) => handleToggle(cat.id, val)}
                    />
                  ))}

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
                          px-5 py-3 text-sm font-medium text-white/70
                          hover:text-white active:scale-[0.98]
                          transition-all duration-200 ease-out cursor-pointer
                        "
                      >
                        Reject All
                      </button>
                    )}
                  </div>

                  <p className="text-center text-[11px] text-white/70 pt-1">
                    By consenting, you agree to our{' '}
                    <a href="/privacy" className="text-amber-400/90 underline underline-offset-2 hover:text-amber-400 transition-colors">
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href="/cookies" className="text-amber-400/90 underline underline-offset-2 hover:text-amber-400 transition-colors">
                      Cookie Policy
                    </a>
                    .
                  </p>
                </div>
              )}
          </div>
        </div>
      )}

    </>
  );
}
