'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  MessageCircle,
  X,
  Send,
  Minus,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Zap,
  Euro,
  ArrowDown,
  Volume2,
  VolumeX,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  User,
  Bot,
} from 'lucide-react';
import BumblebeeMascot from './BumblebeeMascot';
import { SOLAR_DATA } from '@/lib/solar-data';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { submitLead } from '@/lib/submitLead';
import { useCookieBannerVisible } from '@/lib/bottomLayer';


interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
  rated?: 'up' | 'down' | null;
}

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Solar costs', icon: Euro, message: 'How much does a full solar panel system cost in Ireland including installation?' },
  { label: 'SEAI grant', icon: Sparkles, message: `What is the ${SOLAR_DATA.grant.label} SEAI grant and how do I get it?` },
  { label: 'My savings', icon: Zap, message: `How much could I save with a ${SOLAR_DATA.system.avgSizeKwp}kWp system in Ireland?` },
  { label: 'Installation', icon: Clock, message: 'How long does a solar panel installation take from start to finish?' },
];

const CONTEXTUAL_GREETINGS: Record<string, string> = {
  '#calculator': "👋 Just finished checking your savings? I can explain any of the results, savings projections, system sizing, or grant eligibility. What would you like to know?",
  '#quick-calculator': "👋 Just finished checking your savings? I can explain any of the results, savings projections, system sizing, or grant eligibility. What would you like to know?",
  '#how-it-works': "👋 Curious about how it works? I can walk you through the full process, from survey to installation. What would you like to know?",
  '#why-solar': "👋 Great, you're exploring the benefits! I can tell you about savings, the SEAI grant, or how solar works with the Irish grid. What interests you?",
  '#faq': "👋 Got a specific question? I might have a quicker answer than scrolling through the FAQs. Fire away!",
  '#grant-info': "👋 Looking into the SEAI grant? I can check your eligibility and explain how the process works.",
};

const DEFAULT_GREETING = "👋 Hi there! I'm the Solar Ireland assistant. I can help with grants, costs, installation, savings, anything solar. What would you like to know?";

const FOLLOW_UP_MAP = [
  { keywords: ['cost', 'price', 'expensive', 'how much', 'cheap', 'afford'], suggestions: [
    'What about the SEAI grant?',
    'Battery storage cost?',
    'What is the payback period?',
  ]},
  { keywords: ['grant', 'seai', '€1,800', 'eligib'], suggestions: [
    'Am I eligible for the grant?',
    'How long does the grant take?',
    'How do I apply for the grant?',
  ]},
  { keywords: ['install', 'roof', 'scaffold', 'how long'], suggestions: [
    'Do I need planning permission?',
    'What happens on installation day?',
    'How long until panels start saving?',
  ]},
  { keywords: ['saving', 'save', 'bill', 'money', 'worth'], suggestions: [
    'How much could I save specifically?',
    'What is the export tariff?',
    'Try the savings calculator',
  ]},
  { keywords: ['battery', 'storage', 'tesla', 'store'], suggestions: [
    'Is a battery worth it?',
    'How much does a battery cost?',
    'What size battery do I need?',
  ]},
  { keywords: ['ev', 'electric car', 'charger'], suggestions: [
    'What system size for an EV?',
    'Can I charge my EV with solar?',
    'EV charger installation?',
  ]},
  { keywords: ['warranty', 'guarantee', 'maintenance', 'clean'], suggestions: [
    'How long do panels last?',
    'Do panels need cleaning?',
    'What does the warranty cover?',
  ]},
  { keywords: ['cloud', 'shade', 'north', 'orient'], suggestions: [
    'Do solar panels work in Irish weather?',
    'My roof faces east/west?',
    'What if my roof is shaded?',
  ]},
];

const DEFAULT_SUGGESTIONS = [
  'How much does a system cost?',
  'Am I eligible for the grant?',
  'Do I need planning permission?',
];

const LS_KEY = 'solar-ireland-chat';

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' });
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function renderMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  const remaining = text;
  let key = 0;
  const regex = /(\*\*(.+?)\*\*)|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{remaining.slice(lastIndex, match.index)}</span>);
    }
    if (match[2]) {
      parts.push(<strong key={key++} className="font-semibold text-white">{match[2]}</strong>);
    } else if (match[3] && match[4]) {
      parts.push(
        <a key={key++} href={match[4]} target="_blank" rel="noopener noreferrer"
          className="text-yellow-400 underline underline-offset-2 hover:text-yellow-300 transition-colors">
          {match[3]}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < remaining.length) {
    parts.push(<span key={key++}>{remaining.slice(lastIndex)}</span>);
  }
  return parts.length > 0 ? parts : text;
}

function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch { /* silent */ }
}

function getFollowUpSuggestions(messages: Message[]): string[] {
  const recentText = messages.slice(-6).map(m => m.content.toLowerCase()).join(' ');

  for (const entry of FOLLOW_UP_MAP) {
    if (entry.keywords.some(kw => recentText.includes(kw))) {
      return entry.suggestions;
    }
  }

  return DEFAULT_SUGGESTIONS;
}

function loadFromStorage(): { messages: Message[]; hasGreeted: boolean } | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.messages)) return null;
    const messages = data.messages.map((m: Message & { timestamp: string }) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
    return { messages, hasGreeted: !!data.hasGreeted };
  } catch {
    return null;
  }
}

function saveToStorage(messages: Message[], hasGreeted: boolean) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LS_KEY, JSON.stringify({ messages, hasGreeted }));
  } catch { /* silent - quota exceeded etc */ }
}

function clearStorage() {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(LS_KEY);
  } catch { /* silent */ }
}

export default function WhatsAppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState<string | null>(null);
  // Dismissal has to outlive the page. This was useState(false), so every
  // navigation remounted the widget, reset the flag, and popped the toast again
  // ten seconds later. On a six page visit that is six interruptions, each one
  // asking a question the visitor has already declined to answer.
  const [notifDismissed, setNotifDismissed] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem('sig-chat-notif-dismissed') === '1') setNotifDismissed(true);
    } catch { /* private mode: fall back to per-page behaviour */ }
  }, []);
  const dismissNotification = useCallback(() => {
    setNotifDismissed(true);
    setNotification(null);
    try { sessionStorage.setItem('sig-chat-notif-dismissed', '1'); } catch { /* no-op */ }
  }, []);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prevMsgCount, setPrevMsgCount] = useState(0);
  const [fabHovered, setFabHovered] = useState(false);
  // The floating bee never hides itself as the page scrolls. It used to step
  // aside while marked elements (data-chat-clear) were on screen; unmounting
  // and remounting it mid-scroll made the smooth scroll stutter, which Cal
  // judged far worse than the bee staying put (11 Nov).
  const [showPreChat, setShowPreChat] = useState(true);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatRestored, setChatRestored] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  // Email-first capture on the pre-chat screen - feeds the AISolar lead door.
  const [prechatEmail, setPrechatEmail] = useState('');
  const [prechatLeadStatus, setPrechatLeadStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [prechatFallback, setPrechatFallback] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasGreeted = useRef(false);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // The cookie sheet covers this corner; wait until the visitor has answered it.
  const cookieBanner = useCookieBannerVisible();

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored && stored.messages.length > 0) {
      setMessages(stored.messages);
      setHasGreeted(stored.hasGreeted);
      wasGreeted.current = stored.hasGreeted;
      setShowPreChat(false);
      setChatRestored(true);
      setTimeout(() => setChatRestored(false), 3000);
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0 && !hasGreeted) return;
    if (debounceSaveRef.current) clearTimeout(debounceSaveRef.current);
    debounceSaveRef.current = setTimeout(() => {
      saveToStorage(messages, hasGreeted);
    }, 300);
    return () => {
      if (debounceSaveRef.current) clearTimeout(debounceSaveRef.current);
    };
  }, [messages, hasGreeted]);

  const getGreeting = useCallback(() => {
    if (typeof window === 'undefined') return DEFAULT_GREETING;
    const sections = ['#calculator', '#quick-calculator', '#how-it-works', '#why-solar', '#faq', '#our-work', '#grant-info'];
    for (const id of sections) {
      const el = document.querySelector(id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
          return CONTEXTUAL_GREETINGS[id] || DEFAULT_GREETING;
        }
      }
    }
    return DEFAULT_GREETING;
  }, []);

  const startConversation = useCallback(() => {
    setShowPreChat(false);
    if (!wasGreeted.current) {
      wasGreeted.current = true;
      const greeting = getGreeting();
      setMessages([{ role: 'assistant', content: greeting, timestamp: new Date(), id: genId() }]);
      setHasGreeted(true);
    }
    setTimeout(() => inputRef.current?.focus(), 400);
  }, [getGreeting]);

  useEffect(() => {
    if (isOpen && !showPreChat && !wasGreeted.current) {
      wasGreeted.current = true;
      const greeting = getGreeting();
      setMessages([{ role: 'assistant', content: greeting, timestamp: new Date(), id: genId() }]);
      setHasGreeted(true);
    }
  }, [isOpen, showPreChat, getGreeting]);

  useEffect(() => {
    if (hasGreeted || isOpen || notifDismissed) return;
    let hideTimer: ReturnType<typeof setTimeout>;
    notifTimerRef.current = setTimeout(() => {
      setNotification("Got a question about solar? \ud83d\udc4b");
      // The toast draws a 6s countdown bar, so it has to actually leave when
      // the bar empties. It sits over the cookie settings button otherwise.
      hideTimer = setTimeout(() => setNotification(null), 6000);
    }, 10000);
    return () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
      clearTimeout(hideTimer);
    };
  }, [hasGreeted, isOpen, notifDismissed]);

  useEffect(() => {
    if (messages.length > prevMsgCount && messages.length > 1) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant' && soundEnabled) playNotifSound();
    }
    setPrevMsgCount(messages.length);
  }, [messages.length, soundEnabled, prevMsgCount]);

  // Scroll the message list only. scrollIntoView also scrolls every scrollable
  // ancestor, the page and the visual viewport included, so on a phone each
  // new reply nudged the whole sheet about under the thumb.
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) scrollToBottom();
  }, [messages, isLoading, isStreaming, streamingText, isOpen, isMinimized, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }, []);

  // On a phone the chat is a full-screen sheet, and "full screen" has to mean
  // the part of the page the visitor can actually see: the VISUAL viewport.
  // The keyboard shrinks it; a pinch or double-tap zoom shrinks it AND shifts
  // it sideways. The sheet used to follow only its top and height, so on a
  // zoomed page it opened at full page width and hung off the right edge, with
  // the close and send buttons out of reach, and slid about under the finger
  // (Cal, 16 Oct: "sprawled off the screen and moves around on touch").
  // So: snap any zoom back to 100% while the chat is open, pin all four sides
  // to the visual viewport, and restore both on close.
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const vv = window.visualViewport;
    const el = panelRef.current;
    if (!vv || !el || !window.matchMedia('(max-width: 639px)').matches) return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
    const original = meta?.getAttribute('content') ?? null;
    if (meta && original !== null && !/maximum-scale/.test(original)) {
      meta.setAttribute('content', `${original}, maximum-scale=1`);
    }
    // A bottom sheet: the visible screen less a strip at the top (the status
    // bar's safe area, at least 12px) where the dimmed page shows through.
    const gap = 'max(12px, env(safe-area-inset-top, 0px))';
    const place = () => {
      el.style.top = `calc(${vv.offsetTop}px + ${gap})`;
      el.style.left = `${vv.offsetLeft}px`;
      el.style.width = `${vv.width}px`;
      el.style.height = `calc(${vv.height}px - ${gap})`;
      el.style.bottom = 'auto';
      el.style.right = 'auto';
    };
    // The keyboard and a pan fire these many times a frame; place once per frame.
    let frame = 0;
    const apply = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    place();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return () => {
      cancelAnimationFrame(frame);
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
      el.style.top = '';
      el.style.left = '';
      el.style.width = '';
      el.style.height = '';
      el.style.bottom = '';
      el.style.right = '';
      // Pinch-zoom comes back the moment the chat closes.
      if (meta && original !== null) meta.setAttribute('content', original);
    };
  }, [isOpen, isMinimized]);

  // While the chat is open: flag it so the exit-intent popup never fires over
  // an active conversation, and on mobile freeze the page behind the panel so
  // the background can't scroll underneath the conversation.
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const body = document.body;
    body.dataset.sigChatOpen = '1';
    if (!window.matchMedia('(max-width: 639px)').matches) {
      return () => { delete body.dataset.sigChatOpen; };
    }
    const scrollY = window.scrollY;
    const root = document.documentElement;
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    // A frozen body still lets iOS rubber-band the page itself, which drags
    // the sheet with it. Hold the root still too.
    root.style.overflow = 'hidden';
    root.style.overscrollBehavior = 'none';
    return () => {
      delete body.dataset.sigChatOpen;
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      root.style.overflow = '';
      root.style.overscrollBehavior = '';
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, isMinimized]);

  // Drag the sheet down by its handle or header to close it, as on iOS.
  // The sheet follows the finger with a transform only; let go past 110px
  // (or with a quick flick) and it closes, otherwise it springs back.
  const dragRef = useRef<{ y: number; t: number; dy: number } | null>(null);
  const onSheetPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-sheet-drag]') || target.closest('button, a, input, textarea')) return;
    if (!window.matchMedia('(max-width: 639px)').matches || isMinimized) return;
    dragRef.current = { y: e.clientY, t: performance.now(), dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.transition = 'none';
  };
  const onSheetPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    d.dy = Math.max(0, e.clientY - d.y);
    e.currentTarget.style.transform = `translate3d(0, ${d.dy}px, 0)`;
  };
  const onSheetPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    const el = e.currentTarget;
    el.style.transition = '';
    el.style.transform = '';
    const flick = d.dy / Math.max(1, performance.now() - d.t) > 0.6;
    if (d.dy > 110 || (flick && d.dy > 40)) handleClose();
  };

  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    const userMsg: Message = { role: 'user', content, timestamp: new Date(), id: genId() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingText('');
    setShowSuggestions(false);

    if (inputRef.current) inputRef.current.style.height = 'auto';
    setNotification(null);

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.slice(-12), stream: true }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        let serverMsg = '';
        try { serverMsg = (await res.json()).message || ''; } catch { /* body not json */ }
        throw new Error(serverMsg || 'Failed');
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') || contentType.includes('text/plain') || contentType.includes('ndjson')) {
        const reader = res.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let fullText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            try {
              const parsed = JSON.parse(trimmed);
              if (parsed.done) break;
              const chunk = parsed.content || parsed.delta || parsed.text || '';
              if (chunk) {
                fullText += chunk;
                setStreamingText(fullText);
              }
            } catch {
              if (trimmed && trimmed !== '[DONE]') {
                fullText += trimmed;
                setStreamingText(fullText);
              }
            }
          }
        }

        const assistantMsg: Message = {
          role: 'assistant',
          content: fullText || "Sorry, I couldn't process that. Try again or WhatsApp us directly.",
          timestamp: new Date(),
          id: genId(),
          rated: null,
        };
        setMessages(prev => [...prev, assistantMsg]);
        setShowSuggestions(true);
      } else {
        const data = await res.json();
        const assistantMsg: Message = {
          role: 'assistant',
          content: data.message || "Sorry, I couldn't process that. Try again or WhatsApp us directly.",
          timestamp: new Date(),
          id: genId(),
          rated: null,
        };
        setMessages(prev => [...prev, assistantMsg]);
        setShowSuggestions(true);
      }

      if (isMinimized) setUnreadCount(prev => prev + 1);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const friendly = err instanceof Error && err.message && err.message !== 'Failed'
        ? err.message
        : `I'm having trouble connecting right now. You can reach us directly on **WhatsApp** or email ${SOLAR_DATA.provider.email}.`;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: friendly,
        timestamp: new Date(),
        id: genId(),
        rated: null,
      }]);
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingText('');
    }
  };

  const rateMessage = (msgId: string, rating: 'up' | 'down') => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, rated: m.rated === rating ? null : rating } : m));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const handleQuickAction = (action: QuickAction) => sendMessage(action.message);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
    setNotification(null);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setUnreadCount(0);
    if (abortRef.current) abortRef.current.abort();
  };

  const clearChat = () => {
    wasGreeted.current = false;
    setMessages([]);
    setHasGreeted(false);
    setShowPreChat(false);
    setShowSuggestions(true);
    clearStorage();
    setTimeout(() => {
      const greeting = getGreeting();
      setMessages([{ role: 'assistant', content: greeting, timestamp: new Date(), id: genId() }]);
      wasGreeted.current = true;
      setHasGreeted(true);
    }, 100);
  };

  const dismissNotif = dismissNotification;

  const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
  const followUps = (showSuggestions && !isLoading && !isStreaming && lastMsg?.role === 'assistant' && messages.indexOf(lastMsg) > 0)
    ? getFollowUpSuggestions(messages)
    : [];

  return (
    <>
      {/* 
          NOTIFICATION TOAST
           */}
      <div
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        aria-label="Open chat"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); }}
        className={`fixed bottom-40 right-6 z-50 cursor-pointer max-w-[min(20rem,calc(100vw-3rem))] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          notification && !isOpen && !cookieBanner
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-5 scale-95 pointer-events-none'
        }`}
        aria-hidden={!notification || isOpen || cookieBanner}
        inert={!notification || isOpen || cookieBanner}
      >
        <div className="relative overflow-hidden flex items-center gap-3 px-5 py-4 rounded-2xl bg-zinc-800/95 border border-white/[0.08] shadow-2xl shadow-black/40">
          <div className="notif-progress absolute bottom-0 left-0 h-[2px] bg-yellow-400/60 rounded-full" />
          <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center shrink-0">
            <BumblebeeMascot size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">{notification}</p>
            <p className="text-xs text-gray-400 mt-0.5">Tap to chat</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); dismissNotif(); }}
            aria-label="Dismiss"
            className="w-11 h-11 -mr-2 rounded-full hover:bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 
          FLOATING ACTION BUTTON (Enhanced 2026)
           */}
      {!isOpen && !cookieBanner && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
          <div
            className={`whatsapp-fab-tooltip transition-all duration-300 pointer-events-none ${
              fabHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
            style={fabHovered ? { animation: 'fab-bounce 0.5s ease-out' } : undefined}
          >
            <div className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium shadow-lg whitespace-nowrap">
              Chat with us 💬
            </div>
          </div>
          {/* The bee floats free, at full size. It was briefly put inside a
              dark disc and shrunk to 44px to make it read more like a control;
              Cal's verdict was that it wrecked the mascot, and he is right that
              the bee IS the brand here. It gets a soft glow behind it instead,
              which lifts it off a photographic hero without caging it. */}
          <button
            onClick={handleOpen}
            onMouseEnter={() => setFabHovered(true)}
            onMouseLeave={() => setFabHovered(false)}
            className="whatsapp-fab relative flex items-center justify-center group transition-transform duration-300 hover:scale-[1.08] active:scale-95"
            aria-label="Open chat"
          >
            <span
              aria-hidden="true"
              className="absolute inset-[-8px] rounded-full bg-black/35 blur-md"
            />
            <Image
              src="/bumblebee-md.webp"
              alt=""
              width={96}
              height={96}
              className="bumblebee-float relative w-[72px] h-[72px] sm:w-20 sm:h-20 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)] group-hover:drop-shadow-[0_10px_24px_rgba(250,204,21,0.4)] transition-all duration-300"
            />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-[#0a0a0a]" />
          </button>
        </div>
      )}

      {/* 
          CHAT PANEL
           */}
      {/* Phone only: the page dims behind the sheet; a tap on it closes. */}
      <div
        className="wa-backdrop"
        data-open={isOpen && !isMinimized ? 'true' : 'false'}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        // Geometry and motion live in .wa-sheet (the style block below): a
        // bottom sheet on phones, a 400px floating panel from 640. Only
        // transform and opacity animate, so the sheet never trails the
        // keyboard or a pan.
        className="wa-sheet"
        data-open={isOpen ? 'true' : 'false'}
        data-min={isMinimized ? 'true' : 'false'}
        onPointerDown={onSheetPointerDown}
        onPointerMove={onSheetPointerMove}
        onPointerUp={onSheetPointerUp}
        onPointerCancel={onSheetPointerUp}
        role="dialog"
        aria-label="Chat with Solar Ireland"
        aria-hidden={!isOpen}
        // Closed, the panel still held its whole form in the tab order.
        inert={!isOpen}
      >
        {isMinimized ? (
          <div
            onClick={() => { setIsMinimized(false); setUnreadCount(0); }}
            role="button"
            tabIndex={0}
            aria-label="Expand chat"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setIsMinimized(false); setUnreadCount(0); } }}
            className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                <Image src="/logo-sm.webp" alt="Solar Ireland" className="w-10 h-10 object-contain" width={40} height={45} />
              </div>
              <span className="wa-online-dot absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0f0f0f]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Solar Ireland</p>
              <p className="text-xs text-gray-400 truncate">
                {unreadCount > 0
                  ? `${unreadCount} new message${unreadCount > 1 ? 's' : ''}`
                  : messages.length > 0 ? 'Tap to continue chatting' : 'Ask us anything about solar'}
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="wa-unread-badge w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        ) : (
          <>
            {showPreChat ? (
              <div className="flex flex-col h-full min-h-0">
                <div data-sheet-drag="" className="wa-sheet__head shrink-0 touch-none flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-[#0a0a0a]">
                  <span className="wa-grabber" aria-hidden="true" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center overflow-hidden">
                      <Image src="/bumblebee-md.webp" alt="" className="w-8 h-8 object-contain" width={32} height={32} />
                    </div>
                    <span className="wa-online-dot absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0a0a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white">Solar Ireland</p>
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-400 wa-pulse" />
                      <p className="text-xs text-green-400 whitespace-nowrap">Online now</p>
                    </div>
                  </div>
                  <button onClick={handleClose}
                    className="w-11 h-11 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                    aria-label="Close chat">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col items-center px-6 sm:px-8 py-10 text-center">
                  <div className="mt-auto mb-6">
                    <BumblebeeMascot size="lg" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    Hey there! 👋
                  </h3>
                  <p className="text-sm text-gray-400 mb-8 max-w-[260px] leading-relaxed">
                    Welcome to Solar Ireland. Ask me anything about solar panels, grants, savings, or installation.
                  </p>

                  <div className="flex items-center gap-4 mb-8">
                    {[
                      { icon: Sparkles, label: 'AI-Powered' },
                      { icon: Clock, label: 'Instant replies' },
                      { icon: Zap, label: 'Free advice' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="flex flex-col items-center gap-1.5">
                          <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                            <Icon className="w-4 h-4 text-yellow-400" />
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={startConversation}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-[15px] shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer mb-3"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Start Chat
                  </button>

                  {/* Email-first: a savings estimate straight to the inbox */}
                  {prechatLeadStatus === 'sent' ? (
                    <div className="w-full px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-[13px] text-green-400 mb-3" role="status">
                      {prechatFallback
                        ? 'Done. We have your details and a member of our team will be in touch.'
                        : 'Done. A member of our team will be in touch about your estimate.'}
                    </div>
                  ) : (
                    <form
                      className="w-full flex gap-2 mb-3"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const email = prechatEmail.trim();
                        if (prechatLeadStatus === 'sending') return;
                        // Say why nothing happened instead of silently doing
                        // nothing when the address does not look like one.
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                          setPrechatLeadStatus('error');
                          return;
                        }
                        setPrechatLeadStatus('sending');
                        const res = await submitLead({ source: 'website_chat', email, message: 'Requested a savings estimate from the chat pre-screen.' });
                        setPrechatFallback(!!res.fallback);
                        setPrechatLeadStatus(res.ok ? 'sent' : 'error');
                      }}
                    >
                      <input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        enterKeyHint="send"
                        value={prechatEmail}
                        onChange={(e) => { setPrechatEmail(e.target.value); if (prechatLeadStatus === 'error') setPrechatLeadStatus('idle'); }}
                        placeholder="Or get an estimate by email"
                        aria-label="Email address for a savings estimate"
                        className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-base text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 transition-all"
                      />
                      <button
                        type="submit"
                        disabled={prechatLeadStatus === 'sending' || !prechatEmail.trim()}
                        className="px-4 py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:bg-white/[0.06] disabled:text-gray-600 text-black font-bold text-sm transition-all shrink-0"
                      >
                        {prechatLeadStatus === 'sending' ? '…' : 'Send'}
                      </button>
                    </form>
                  )}
                  {prechatLeadStatus === 'error' && (
                    <p className="w-full text-[13px] text-red-400 mb-3 -mt-1" role="alert">That didn&apos;t go through. Check the email address and try again, or ring us on {SOLAR_DATA.provider.phone}.</p>
                  )}

                  <a
                    href={buildWhatsAppUrl({ source: 'chat-widget-prechat' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-green-500/25 bg-green-500/10 text-green-400 font-medium text-[15px] hover:bg-green-500/15 hover:text-green-300 transition-all duration-200"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp Us Instead
                  </a>

                  <div className="flex items-center gap-1.5 mt-6 mb-auto text-[10px] text-gray-400">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Your data stays private
                  </div>
                </div>

              </div>
            ) : (
              <>
                <div data-sheet-drag="" className="wa-sheet__head shrink-0 touch-none flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-[#0a0a0a]">
                  <span className="wa-grabber" aria-hidden="true" />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-yellow-400/10 flex items-center justify-center overflow-hidden">
                      <Image src="/bumblebee-md.webp" alt="" className="w-8 h-8 object-contain" width={32} height={32} />
                    </div>
                    <span className="wa-online-dot absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0a0a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white">Solar Ireland</p>
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-green-400 wa-pulse" />
                      <p className="text-xs text-green-400 whitespace-nowrap">
                        {isLoading || isStreaming ? 'Typing...' : 'Online now'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="w-11 h-11 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      aria-label={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={handleMinimize}
                      className="w-11 h-11 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                      aria-label="Minimize chat">
                      <Minus className="w-4 h-4" />
                    </button>
                    <button onClick={handleClose}
                      className="w-11 h-11 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                      aria-label="Close chat">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* The list and its scroll-to-latest button share a box, so
                    the button sits at the foot of the messages and never on
                    the composer, keyboard up or down. */}
                <div className="relative flex-1 min-h-0 flex flex-col">
                <div
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-5 py-4 space-y-3"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
                >
                  {chatRestored && (
                    <div className="flex justify-center py-1 wa-fade-in">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-[10px] text-yellow-400/80">
                        <RotateCcw className="w-2.5 h-2.5" />
                        Chat history restored
                      </span>
                    </div>
                  )}

                  {messages.length <= 1 && hasGreeted && !isStreaming && (
                    <div className="text-center py-2 wa-fade-in">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-[10px] text-gray-400">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Your data stays private &middot; AI-powered
                      </div>
                    </div>
                  )}

                  {messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} wa-msg-enter`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center mr-2 mt-1 shrink-0 overflow-hidden">
                          <Image src="/bumblebee-sm.webp" alt="" className="w-5 h-5" width={20} height={20} />
                        </div>
                      )}
                      {/* Bubbles cap at 85% of the row: wide enough that an
                          answer is not a tall thin column, narrow enough that
                          the eye never travels edge to edge. */}
                      <div className={`min-w-0 max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2.5 text-[15px] leading-[1.55] whitespace-pre-wrap [overflow-wrap:anywhere] max-w-full transition-colors duration-200 ${
                            msg.role === 'user'
                              ? 'bg-yellow-400 text-black rounded-2xl rounded-br-md'
                              : 'bg-white/[0.08] text-gray-100 rounded-2xl rounded-bl-md'
                          }`}
                        >
                          {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className="text-[10px] text-gray-400">{timeAgo(msg.timestamp)}</span>
                          {msg.role === 'assistant' && messages.indexOf(msg) > 0 && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => rateMessage(msg.id, 'up')}
                                className={`p-2 -m-1 rounded transition-colors ${msg.rated === 'up' ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
                                aria-label="Helpful"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => rateMessage(msg.id, 'down')}
                                className={`p-2 -m-1 rounded transition-colors ${msg.rated === 'down' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                                aria-label="Not helpful"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {followUps.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-9 wa-fade-in">
                      {followUps.map((suggestion, i) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setShowSuggestions(false);
                            sendMessage(suggestion);
                          }}
                          className="follow-up-pill max-w-full text-left px-3.5 py-2.5 rounded-full text-[14px] leading-snug text-yellow-200 bg-yellow-400/[0.06] border border-yellow-400/20 hover:bg-yellow-400/10 hover:border-yellow-400/35 hover:text-yellow-200 transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {isStreaming && streamingText && (
                    <div className="flex justify-start wa-msg-enter">
                      <div className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center mr-2 mt-1 shrink-0 overflow-hidden">
                        <Image src="/bumblebee-sm.webp" alt="" className="w-5 h-5" width={20} height={20} />
                      </div>
                      <div className="min-w-0 max-w-[85%]">
                        <div className="px-4 py-2.5 text-[15px] leading-[1.55] whitespace-pre-wrap [overflow-wrap:anywhere] max-w-full bg-white/[0.08] text-gray-100 rounded-2xl rounded-bl-md">
                          {renderMarkdown(streamingText)}
                          <span className="inline-block w-1.5 h-4 bg-yellow-400 ml-0.5 animate-pulse rounded-sm" />
                        </div>
                      </div>
                    </div>
                  )}

                  {isLoading && !isStreaming && (
                    <div className="flex justify-start wa-msg-enter">
                      <div className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center mr-2 mt-1 shrink-0 overflow-hidden">
                        <Image src="/bumblebee-sm.webp" alt="" className="w-5 h-5" width={20} height={20} />
                      </div>
                      <div className="bg-white/[0.07] px-4 py-3.5 rounded-2xl rounded-bl-md">
                        <div className="flex gap-1.5 items-center">
                          <span className="wa-typing-wave-dot w-2 h-2 bg-gray-500 rounded-full" style={{ animationDelay: '0ms' }} />
                          <span className="wa-typing-wave-dot w-2 h-2 bg-gray-500 rounded-full" style={{ animationDelay: '150ms' }} />
                          <span className="wa-typing-wave-dot w-2 h-2 bg-gray-500 rounded-full" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {showScrollBtn && (
                  <button
                    onClick={() => scrollToBottom()}
                    aria-label="Scroll to latest message"
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-zinc-700/80 border border-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 shadow-lg z-10 hover:scale-110"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                )}
                </div>

                {messages.length <= 2 && !isLoading && !isStreaming && (
                  // One row of four equal tiles, the same tile as the welcome
                  // screen's icons. As wrapping pills they broke onto two
                  // ragged rows and ate the bottom of a phone screen.
                  <div className="wa-fade-in px-5 pb-2 grid grid-cols-4 gap-2">
                    {QUICK_ACTIONS.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action)}
                          className="min-w-0 min-h-[56px] flex flex-col items-center justify-center gap-1.5 px-1 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[12px] leading-tight text-gray-300 hover:text-white hover:border-yellow-400/30 hover:bg-yellow-400/[0.05] transition-all duration-200 active:scale-95 cursor-pointer"
                        >
                          <ActionIcon className="w-4 h-4 text-yellow-400 shrink-0" />
                          <span className="whitespace-nowrap">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="shrink-0 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-white/[0.06] bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 mb-2">
                    <a href={buildWhatsAppUrl({ source: 'chat-widget' })}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] text-green-400 hover:bg-green-400/10 transition-colors">
                      <Phone className="w-3 h-3" /> WhatsApp
                    </a>
                    <a href={`mailto:${SOLAR_DATA.provider.email}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] text-gray-400 hover:bg-white/[0.04] transition-colors">
                      <Mail className="w-3 h-3" /> Email
                    </a>
                    <div className="flex-1" />
                    {messages.length > 3 && (
                      <button onClick={clearChat}
                        className="flex items-center gap-1.5 ml-2 px-3 py-2 rounded-lg text-[13px] text-gray-400 hover:text-gray-300 hover:bg-white/[0.04] transition-colors cursor-pointer">
                        <RotateCcw className="w-3 h-3" /> New chat
                      </button>
                    )}
                  </div>

                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about solar..."
                      enterKeyHint="send"
                      aria-label="Message"
                      disabled={isLoading}
                      rows={1}
                      className="flex-1 min-w-0 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-base text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/10 disabled:opacity-50 resize-none transition-all duration-200"
                      style={{ maxHeight: 120 }}
                    />
                    <button
                      onClick={() => sendMessage()}
                      aria-label="Send message"
                      disabled={!input.trim() || isLoading}
                      className="shrink-0 w-11 h-11 rounded-xl bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:text-gray-500 text-black flex items-center justify-center transition-all duration-200 disabled:shadow-none shadow-lg shadow-yellow-400/10 hover:shadow-yellow-400/20 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 text-center">AI assistant &middot; For accurate quotes, get a free site survey</p>
                </div>

              </>
            )}
          </>
        )}
      </div>

      {/* 
          INJECTED STYLES (enhanced wave + FAB bounce)
           */}
      <style jsx global>{`
        /* The chat sheet. Phone (under 640): a bottom sheet, full width,
           rounded top, a drag handle, the page dimmed behind it; the
           visualViewport effect pins it above the keyboard. From 640: a
           400px floating panel, bottom right. Only transform and opacity
           move; reduced motion gets a short fade with no travel. */
        .wa-sheet {
          position: fixed;
          z-index: 50;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          overscroll-behavior: contain;
          background: #0f0f0f;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          transition: transform 420ms cubic-bezier(0.32, 0.72, 0, 1), opacity 240ms ease, visibility 0s linear 0s;
        }
        .wa-sheet[data-open='false'] {
          visibility: hidden;
          pointer-events: none;
          transition: transform 360ms cubic-bezier(0.32, 0.72, 0, 1), opacity 240ms ease, visibility 0s linear 360ms;
        }
        .wa-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0, 0, 0, 0.55);
          opacity: 0;
          pointer-events: none;
          transition: opacity 300ms ease;
        }
        .wa-backdrop[data-open='true'] {
          opacity: 1;
          pointer-events: auto;
        }
        .wa-sheet__head {
          position: relative;
        }
        .wa-grabber {
          display: none;
        }
        @media (max-width: 639px) {
          .wa-sheet {
            left: 0;
            right: 0;
            bottom: 0;
            top: max(12px, env(safe-area-inset-top, 0px));
            border-bottom: 0;
            border-radius: 20px 20px 0 0;
          }
          .wa-sheet[data-open='false'] {
            transform: translate3d(0, 100%, 0);
          }
          .wa-sheet__head {
            padding-top: 22px;
          }
          .wa-grabber {
            display: block;
            position: absolute;
            top: 8px;
            left: 50%;
            width: 36px;
            height: 5px;
            margin-left: -18px;
            border-radius: 3px;
            background: rgba(255, 255, 255, 0.28);
          }
          .wa-sheet[data-min='true'] {
            top: auto;
            left: 16px;
            right: 16px;
            bottom: calc(16px + env(safe-area-inset-bottom, 0px));
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
          }
        }
        @media (min-width: 640px) {
          .wa-sheet {
            right: 24px;
            bottom: 24px;
            width: 400px;
            max-width: calc(100vw - 48px);
            height: 600px;
            max-height: calc(100vh - 96px);
            border-radius: 16px;
            transform-origin: bottom right;
          }
          .wa-sheet[data-open='false'] {
            opacity: 0;
            transform: translate3d(0, 24px, 0) scale(0.92);
          }
          .wa-sheet[data-min='true'] {
            width: 340px;
            height: auto;
          }
          .wa-backdrop {
            display: none;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .wa-sheet,
          .wa-sheet[data-open='false'] {
            transform: none;
            transition: opacity 160ms linear, visibility 0s linear 160ms;
          }
          .wa-sheet[data-open='true'] {
            transition: opacity 160ms linear, visibility 0s linear 0s;
          }
          .wa-sheet[data-open='false'] {
            opacity: 0;
          }
        }

        @keyframes wa-typing-wave {
          0%, 60%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          30% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .wa-typing-wave-dot {
          animation: wa-typing-wave 1.2s ease-in-out infinite;
        }

        @keyframes wa-follow-up-enter {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .follow-up-pill {
          animation: wa-follow-up-enter 0.35s ease-out both;
        }

        @keyframes fab-bounce {
          0% { transform: translateY(4px) scale(0.95); }
          50% { transform: translateY(-2px) scale(1.03); }
          100% { transform: translateY(0) scale(1); }
        }

        @keyframes wa-fab-pulse {
          0% {
            transform: scale(1);
            opacity: 0.4;
          }
          70% {
            transform: scale(2.2);
            opacity: 0;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
