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
  '#calculator': "👋 Just finished checking your savings? I can explain any of the results \u2014 savings projections, system sizing, or grant eligibility. What would you like to know?",
  '#quick-calculator': "👋 Just finished checking your savings? I can explain any of the results \u2014 savings projections, system sizing, or grant eligibility. What would you like to know?",
  '#how-it-works': "👋 Curious about how it works? I can walk you through the full process \u2014 from survey to installation. What would you like to know?",
  '#why-solar': "👋 Great, you're exploring the benefits! I can tell you about savings, the SEAI grant, or how solar works with the Irish grid. What interests you?",
  '#faq': "👋 Got a specific question? I might have a quicker answer than scrolling through the FAQs. Fire away!",
  '#grant-info': "👋 Looking into the SEAI grant? I can check your eligibility and explain how the process works.",
};

const DEFAULT_GREETING = "👋 Hi there! I'm the Solar Ireland assistant. I can help with grants, costs, installation, savings \u2014 anything solar. What would you like to know?";

const FOLLOW_UP_MAP = [
  { keywords: ['cost', 'price', 'expensive', 'how much', 'cheap', 'afford'], suggestions: [
    'What about the SEAI grant?',
    'Battery storage cost?',
    'What is the payback period?',
  ]},
  { keywords: ['grant', 'seai', '€1,800', 'eligib'], suggestions: [
    'Am I eligible for the grant?',
    'How long does the grant take?',
    'Do you handle the application?',
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
  let remaining = text;
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
          className="text-amber-400 underline underline-offset-2 hover:text-amber-300 transition-colors">
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
  const [notifDismissed, setNotifDismissed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prevMsgCount, setPrevMsgCount] = useState(0);
  const [fabHovered, setFabHovered] = useState(false);
  const [showPreChat, setShowPreChat] = useState(true);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatRestored, setChatRestored] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasGreeted = useRef(false);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    notifTimerRef.current = setTimeout(() => {
      setNotification("Got a question about solar? \ud83d\udc4b");
    }, 10000);
    return () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    };
  }, [hasGreeted, isOpen, notifDismissed]);

  useEffect(() => {
    if (messages.length > prevMsgCount && messages.length > 1) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant' && soundEnabled) playNotifSound();
    }
    setPrevMsgCount(messages.length);
  }, [messages.length, soundEnabled, prevMsgCount]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) scrollToBottom();
  }, [messages, isLoading, isStreaming, streamingText, isOpen, isMinimized, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }, []);

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

      if (!res.ok) throw new Error('Failed');

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
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm having trouble connecting right now. You can reach us directly on **WhatsApp** or email ${SOLAR_DATA.provider.email}.`,
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

  const dismissNotif = () => {
    setNotification(null);
    setNotifDismissed(true);
  };

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
        className={`fixed bottom-24 right-6 z-50 cursor-pointer max-w-xs transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          notification && !isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-5 scale-95 pointer-events-none'
        }`}
        aria-hidden={!notification || isOpen}
      >
        <div className="relative overflow-hidden flex items-center gap-3 px-5 py-4 rounded-2xl bg-zinc-800/95 border border-white/[0.08] shadow-2xl shadow-black/40">
          <div className="notif-progress absolute bottom-0 left-0 h-[2px] bg-amber-400/60 rounded-full" />
          <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0">
            <BumblebeeMascot size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">{notification}</p>
            <p className="text-xs text-gray-400 mt-0.5">Tap to chat</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); dismissNotif(); }}
            className="w-7 h-7 rounded-full hover:bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 
          FLOATING ACTION BUTTON (Enhanced 2026)
           */}
      {!isOpen && (
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
          <div className="whatsapp-fab-ring absolute w-14 h-14 rounded-full bg-green-500/30" />
          <div className="absolute w-14 h-14 rounded-full bg-green-500/20" style={{ animation: 'wa-fab-pulse 3.5s ease-out infinite' }} />
          <button
            onClick={handleOpen}
            onMouseEnter={() => setFabHovered(true)}
            onMouseLeave={() => setFabHovered(false)}
            className="whatsapp-fab relative w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 transition-all duration-300 flex items-center justify-center group shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.08] active:scale-95"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-green-300 rounded-full border-[2.5px] border-green-500" />
          </button>
        </div>
      )}

      {/* 
          CHAT PANEL
           */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.08] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-[0.92] translate-y-6 pointer-events-none'
        } ${
          'bottom-0 right-0 sm:bottom-6 sm:right-6 sm:rounded-2xl sm:w-[400px] sm:max-w-[calc(100vw-3rem)] sm:h-[600px] sm:max-h-[calc(100vh-6rem)] w-full h-full sm:h-auto rounded-none sm:rounded-2xl'
        } bg-[#0f0f0f]`}
        aria-hidden={!isOpen}
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
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/[0.06] bg-[#0a0a0a]">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                      <Image src="/logo-sm.webp" alt="Solar Ireland" className="w-10 h-10 object-contain" width={40} height={45} />
                    </div>
                    <span className="wa-online-dot absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0a0a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white">Solar Ireland</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 wa-pulse" />
                      <p className="text-xs text-green-400">Online now</p>
                    </div>
                  </div>
                  <button onClick={handleClose}
                    className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white transition-colors sm:block hidden"
                    aria-label="Close chat">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 py-10 text-center">
                  <div className="mb-6">
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
                            <Icon className="w-4 h-4 text-amber-400" />
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={startConversation}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer mb-3"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Start Chat
                  </button>

                  <a
                    href={buildWhatsAppUrl({ source: 'chat-widget-prechat' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-gray-400 font-medium text-sm hover:bg-white/[0.06] hover:text-white transition-all duration-200"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp Us Instead
                  </a>

                  <div className="flex items-center gap-1.5 mt-6 text-[10px] text-gray-400">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Your data stays private
                  </div>
                </div>

                <button onClick={handleClose}
                  className="sm:hidden flex items-center justify-center gap-2 py-3 border-t border-white/[0.06] text-gray-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" /> Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/[0.06] bg-[#0a0a0a]">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                      <Image src="/logo-sm.webp" alt="Solar Ireland" className="w-10 h-10 object-contain" width={40} height={45} />
                    </div>
                    <span className="wa-online-dot absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0a0a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white">Solar Ireland</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 wa-pulse" />
                      <p className="text-xs text-green-400">
                        {isLoading || isStreaming ? 'Typing...' : 'Online now'}
                      </p>
                      <span className="text-xs text-gray-400">&middot; Typically replies instantly</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                      aria-label={soundEnabled ? 'Mute notifications' : 'Enable notifications'}
                    >
                      {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={handleMinimize}
                      className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                      aria-label="Minimize chat">
                      <Minus className="w-4 h-4" />
                    </button>
                    <button onClick={handleClose}
                      className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-white transition-colors sm:block hidden"
                      aria-label="Close chat">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3 min-h-0"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
                >
                  {chatRestored && (
                    <div className="flex justify-center py-1 wa-fade-in">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] text-amber-400/80">
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
                      <div className={`max-w-[82%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-2.5 text-[13.5px] leading-relaxed transition-all duration-200 ${
                            msg.role === 'user'
                              ? 'bg-green-600 text-white rounded-2xl rounded-br-md'
                              : 'bg-white/[0.07] text-gray-300 rounded-2xl rounded-bl-md hover:bg-white/[0.09]'
                          }`}
                        >
                          {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                        </div>
                        <div className="flex items-center gap-2 mt-1 px-1">
                          <span className="text-[10px] text-gray-400">{timeAgo(msg.timestamp)}</span>
                          {msg.role === 'assistant' && messages.indexOf(msg) > 0 && (
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={() => rateMessage(msg.id, 'up')}
                                className={`p-0.5 rounded transition-colors ${msg.rated === 'up' ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}`}
                                aria-label="Helpful"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => rateMessage(msg.id, 'down')}
                                className={`p-0.5 rounded transition-colors ${msg.rated === 'down' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
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
                    <div className="flex flex-wrap gap-1.5 pl-9 wa-fade-in">
                      {followUps.map((suggestion, i) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            setShowSuggestions(false);
                            sendMessage(suggestion);
                          }}
                          className="follow-up-pill px-3 py-1.5 rounded-full text-[11px] text-amber-300/80 bg-amber-400/[0.06] border border-amber-400/20 hover:bg-amber-400/10 hover:border-amber-400/35 hover:text-amber-200 transition-all duration-300 hover:scale-[1.03] active:scale-95 cursor-pointer"
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
                      <div className="max-w-[82%]">
                        <div className="px-4 py-2.5 text-[13.5px] leading-relaxed bg-white/[0.07] text-gray-300 rounded-2xl rounded-bl-md">
                          {renderMarkdown(streamingText)}
                          <span className="inline-block w-1.5 h-4 bg-amber-400 ml-0.5 animate-pulse rounded-sm" />
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

                  <div ref={messagesEndRef} />
                </div>

                {showScrollBtn && (
                  <button
                    onClick={() => scrollToBottom()}
                    aria-label="Scroll to latest message"
                    className="absolute bottom-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-700/80 border border-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 shadow-lg z-10 hover:scale-110"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                )}

                {messages.length <= 2 && !isLoading && !isStreaming && (
                  <div className="wa-fade-in px-4 sm:px-5 pb-2 flex flex-wrap gap-2">
                    {QUICK_ACTIONS.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <button
                          key={action.label}
                          onClick={() => handleQuickAction(action)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:border-amber-400/30 hover:bg-amber-400/[0.05] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <ActionIcon className="w-3 h-3" /> {action.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="px-4 sm:px-5 py-3 border-t border-white/[0.06] bg-[#0a0a0a]">
                  <div className="flex items-center gap-2 mb-2">
                    <a href={buildWhatsAppUrl({ source: 'chat-widget' })}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-green-400 hover:bg-green-400/10 transition-colors">
                      <Phone className="w-3 h-3" /> WhatsApp
                    </a>
                    <a href={`mailto:${SOLAR_DATA.provider.email}`}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-gray-400 hover:bg-white/[0.04] transition-colors">
                      <Mail className="w-3 h-3" /> Email
                    </a>
                    <div className="flex-1" />
                    {messages.length > 3 && (
                      <button onClick={clearChat}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-gray-400 hover:text-gray-300 hover:bg-white/[0.04] transition-colors cursor-pointer">
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
                      disabled={isLoading}
                      rows={1}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/10 disabled:opacity-50 resize-none transition-all duration-200"
                      style={{ maxHeight: 120 }}
                    />
                    <button
                      onClick={() => sendMessage()}
                      aria-label="Send message"
                      disabled={!input.trim() || isLoading}
                      className="shrink-0 w-10 h-10 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-gray-700 disabled:text-gray-500 text-black flex items-center justify-center transition-all duration-200 disabled:shadow-none shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20 hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-2 text-center">AI assistant &middot; For accurate quotes, get a free site survey</p>
                </div>

                <button onClick={handleClose}
                  className="sm:hidden flex items-center justify-center gap-2 py-3 border-t border-white/[0.06] text-gray-500 hover:text-white transition-colors cursor-pointer">
                  <X className="w-4 h-4" /> Close chat
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* 
          INJECTED STYLES (enhanced wave + FAB bounce)
           */}
      <style jsx global>{`
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
