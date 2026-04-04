'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  ArrowUp,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';
import BumblebeeMascot from './BumblebeeMascot';

/* ═══════════════════════════════════════════════════════════════
   WORLD-CLASS WHATSAPP WIDGET
   ─────────────────────────────────────────────────────────────
   GPU-safe animations only. No CSS filter/drop-shadow/backdrop-filter.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Types ─── */
interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id: string;
}

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}

/* ─── Constants ─── */
const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Solar costs', icon: Euro, message: 'How much does a solar panel system cost in Ireland?' },
  { label: 'SEAI grant', icon: Sparkles, message: 'Tell me about the SEAI grant for solar panels' },
  { label: 'My savings', icon: Zap, message: 'How much could I save with solar panels?' },
  { label: 'Installation', icon: Clock, message: 'How long does installation take?' },
];

const CONTEXTUAL_GREETINGS: Record<string, string> = {
  '#calculator': "👋 Welcome back! Already checked out our Bill Analyser? Ask me anything about your results, or I can help you understand the savings projections.",
  '#how-it-works': "👋 Curious about how it works? I can walk you through the process — from survey to installation. What would you like to know?",
  '#why-solar': "👋 Great, you're exploring the benefits! I can tell you about savings, the SEAI grant, or how solar works with the Irish grid. What interests you?",
  '#faq': "👋 Got a specific question? I might have a quicker answer than scrolling through FAQs. Fire away!",
};

const DEFAULT_GREETING = "👋 Hi there! I'm the Solar Ireland assistant. I can help with grants, costs, installation, savings — anything solar. What would you like to know?";

/* ─── Helpers ─── */
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

/* ─── Sound helper ─── */
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
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Silently fail — audio not available
  }
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const wasGreeted = useRef(false);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ─── Detect current section for contextual greeting ─── */
  const getGreeting = useCallback(() => {
    if (typeof window === 'undefined') return DEFAULT_GREETING;
    const sections = ['#calculator', '#how-it-works', '#why-solar', '#faq', '#our-work', '#grant-info'];
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

  /* ─── Initial greeting on first open ─── */
  useEffect(() => {
    if (isOpen && !wasGreeted.current) {
      wasGreeted.current = true;
      const greeting = getGreeting();
      setMessages([{ role: 'assistant', content: greeting, timestamp: new Date(), id: genId() }]);
      setHasGreeted(true);
    }
  }, [isOpen, getGreeting]);

  /* ─── Show notification toast after delay ─── */
  useEffect(() => {
    if (hasGreeted || isOpen || notifDismissed) return;
    notifTimerRef.current = setTimeout(() => {
      setNotification("Got a question about solar? 👋");
    }, 8000);
    return () => {
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    };
  }, [hasGreeted, isOpen, notifDismissed]);

  /* ─── Play sound when new assistant message arrives ─── */
  useEffect(() => {
    if (messages.length > prevMsgCount && messages.length > 1) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant' && soundEnabled) {
        playNotifSound();
      }
    }
    setPrevMsgCount(messages.length);
  }, [messages.length, soundEnabled, prevMsgCount]);

  /* ─── Auto-scroll ─── */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) scrollToBottom();
  }, [messages, isLoading, isOpen, isMinimized, scrollToBottom]);

  /* ─── Track scroll for "scroll to bottom" ─── */
  const handleScroll = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }, []);

  /* ─── Send message ─── */
  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || isLoading) return;

    const userMsg: Message = { role: 'user', content, timestamp: new Date(), id: genId() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    if (inputRef.current) inputRef.current.style.height = 'auto';
    setNotification(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.slice(-12) }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.message || "Sorry, I couldn't process that. Try again or WhatsApp us directly.",
        timestamp: new Date(),
        id: genId(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (isMinimized) setUnreadCount(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. You can reach us directly on **WhatsApp** or email cal@solarireland.com.",
        timestamp: new Date(),
        id: genId(),
      }]);
    } finally {
      setIsLoading(false);
    }
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
    setTimeout(() => inputRef.current?.focus(), 400);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  const clearChat = () => {
    wasGreeted.current = false;
    setMessages([]);
    setHasGreeted(false);
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

  return (
    <>
      {/* ═══════════════════════════════════════
          NOTIFICATION TOAST — with auto-dismiss bar
          ═══════════════════════════════════════ */}
      <div
        onClick={handleOpen}
        className={`fixed bottom-24 right-6 z-50 cursor-pointer max-w-xs transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          notification && !isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-5 scale-95 pointer-events-none'
        }`}
        aria-hidden={!notification || isOpen}
      >
        <div className="relative overflow-hidden flex items-center gap-3 px-5 py-4 rounded-2xl bg-zinc-800/95 border border-white/[0.08] shadow-2xl shadow-black/40">
          {/* Auto-dismiss progress bar */}
          <div className="notif-progress absolute bottom-0 left-0 h-[2px] bg-amber-400/60 rounded-full" />

          <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0">
            <BumblebeeMascot size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium">{notification}</p>
            <p className="text-xs text-gray-500 mt-0.5">Tap to chat</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); dismissNotif(); }}
            className="w-7 h-7 rounded-full hover:bg-white/[0.06] flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          FLOATING ACTION BUTTON — pulsing ring + tooltip
          ═══════════════════════════════════════ */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
          {/* Tooltip */}
          <div
            className={`whatsapp-fab-tooltip transition-all duration-300 pointer-events-none ${
              fabHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            <div className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium shadow-lg whitespace-nowrap">
              Chat with us
            </div>
          </div>

          {/* Pulsing ring */}
          <div className="whatsapp-fab-ring absolute w-14 h-14 rounded-full bg-green-500/30" />

          {/* Button */}
          <button
            onClick={handleOpen}
            onMouseEnter={() => setFabHovered(true)}
            onMouseLeave={() => setFabHovered(false)}
            className="whatsapp-fab relative w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 transition-all duration-300 flex items-center justify-center group shadow-xl shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105 active:scale-95"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6 text-white transition-transform duration-300 group-hover:scale-110" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════
          CHAT PANEL — spring-like CSS transition
          ═══════════════════════════════════════ */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden shadow-2xl shadow-black/50 border border-white/[0.08] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-[0.92] translate-y-6 pointer-events-none'
        } ${
          'bottom-0 right-0 sm:bottom-6 sm:right-6 sm:rounded-2xl sm:w-[400px] sm:max-w-[calc(100vw-3rem)] sm:h-[580px] sm:max-h-[calc(100vh-6rem)] w-full h-full sm:h-auto rounded-none sm:rounded-2xl'
        } bg-[#0f0f0f]`}
        aria-hidden={!isOpen}
      >
        {/* ─── Minimized State ─── */}
        {isMinimized ? (
          <div
            onClick={() => { setIsMinimized(false); setUnreadCount(0); }}
            className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                <img src="/logo-sm.png" alt="Solar Ireland" className="w-10 h-10 object-contain" />
              </div>
              <span className="wa-online-dot absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0f0f0f]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Solar Ireland</p>
              <p className="text-xs text-gray-500 truncate">
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
            {/* ─── Header ─── */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/[0.06] bg-[#0a0a0a]">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
                  <img src="/logo-sm.png" alt="Solar Ireland" className="w-10 h-10 object-contain" />
                </div>
                <span className="wa-online-dot absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0a0a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white">Solar Ireland</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 wa-pulse" />
                  <p className="text-xs text-green-400">Online now</p>
                  <span className="text-xs text-gray-600">· Typically replies in minutes</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {/* Sound toggle */}
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

            {/* ─── Messages ─── */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3 min-h-0"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
            >
              {/* Privacy notice */}
              {messages.length <= 1 && hasGreeted && (
                <div className="text-center py-2 wa-fade-in">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-[10px] text-gray-600">
                    <Lock className="w-3 h-3" /> Your data stays private · AI-powered
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} wa-msg-enter`}
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center mr-2 mt-1 shrink-0 overflow-hidden">
                      <img src="/bumblebee-sm.png" alt="" className="w-5 h-5" />
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
                    <span className="text-[10px] text-gray-700 mt-1 px-1">
                      {timeAgo(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start wa-msg-enter">
                  <div className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center mr-2 mt-1 shrink-0 overflow-hidden">
                    <img src="/bumblebee-sm.png" alt="" className="w-5 h-5" />
                  </div>
                  <div className="bg-white/[0.07] px-4 py-3.5 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-500 rounded-full wa-typing-dot" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-500 rounded-full wa-typing-dot" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-500 rounded-full wa-typing-dot" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ─── Scroll to bottom ─── */}
            {showScrollBtn && (
              <button
                onClick={() => scrollToBottom()}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-zinc-700/80 border border-white/[0.1] flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 shadow-lg z-10 hover:scale-110"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}

            {/* ─── Quick Actions ─── */}
            {messages.length <= 2 && !isLoading && (
              <div className="wa-fade-in px-4 sm:px-5 pb-2 flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={() => handleQuickAction(action)}
                      className="wa-quick-chip flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:border-amber-400/30 hover:bg-amber-400/[0.05] transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                      <ActionIcon className="w-3 h-3" /> {action.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── Input Area ─── */}
            <div className="px-4 sm:px-5 py-3 border-t border-white/[0.06] bg-[#0a0a0a]">
              <div className="flex items-center gap-2 mb-2">
                <a href="https://wa.me/353873958424?text=Hi%2C%20I%20have%20a%20question%20about%20solar%20panels."
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-green-400 hover:bg-green-400/10 transition-colors">
                  <Phone className="w-3 h-3" /> WhatsApp
                </a>
                <a href="mailto:cal@solarireland.com"
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-gray-500 hover:bg-white/[0.04] transition-colors">
                  <Mail className="w-3 h-3" /> Email
                </a>
                <div className="flex-1" />
                {messages.length > 3 && (
                  <button onClick={clearChat}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-gray-600 hover:text-gray-400 hover:bg-white/[0.04] transition-colors">
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
                  disabled={!input.trim() || isLoading}
                  className="shrink-0 w-10 h-10 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-gray-700 disabled:text-gray-500 text-black flex items-center justify-center transition-all duration-200 disabled:shadow-none shadow-lg shadow-amber-400/10 hover:shadow-amber-400/20 hover:scale-105 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-gray-700 mt-2 text-center">AI assistant · For accurate quotes, get a free site survey</p>
            </div>

            {/* Mobile close */}
            <button onClick={handleClose}
              className="sm:hidden flex items-center justify-center gap-2 py-3 border-t border-white/[0.06] text-gray-500 hover:text-white transition-colors">
              <X className="w-4 h-4" /> Close chat
            </button>
          </>
        )}
      </div>
    </>
  );
}

/* ─── Lock icon (inline SVG for zero dependency) ─── */
function Lock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
