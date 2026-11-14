/**
 * The site chat must never fail silently (Cal, 8 Sep: "nothing fails
 * silently"; 14 Nov: the bee answered "I'm having trouble connecting" to
 * every question and nobody knew). When the model provider refuses:
 *
 *   - console.error every time with the provider's status and its own short
 *     error message (never the key, never the visitor's words), so
 *     `vercel logs` names the cause instead of "responded 403";
 *   - the owner alert through the intake's Postmark path, at most once an
 *     hour per server instance, saying in plain words what to check.
 *
 * Server only.
 */
import { after } from 'next/server';
import { postmarkAlerter, type Alerter } from './intake/live/outbox';

export const CHAT_ALERT_EVERY_MS = 60 * 60_000;

let lastAlertAt = 0;

/** Tests only. */
export function resetChatFailureReport(): void {
  lastAlertAt = 0;
}

export interface ChatFailure {
  /** The provider's HTTP status, or 0 when it could not be reached. */
  status: number;
  /** The provider's own error text, already trimmed. */
  detail: string;
}

/** OpenRouter's documented meanings, in words the owner can act on. */
export function chatFailureAdvice(status: number): string {
  switch (status) {
    case 401:
      return 'The OpenRouter key is wrong or was deleted. Make a new key at openrouter.ai, put it in Vercel as OPENROUTER_API_KEY and redeploy.';
    case 402:
      return 'The OpenRouter account is out of credit. Top it up at openrouter.ai (Credits).';
    case 403:
      return 'OpenRouter refused the key: usually its spending limit is used up (openrouter.ai, Keys, raise or reset the limit) or the key was disabled. The detail below is OpenRouter\'s own words.';
    case 429:
      return 'OpenRouter or the model is rate limiting. If it keeps happening, check the account\'s credit and limits.';
    case 0:
      return 'OpenRouter could not be reached (timeout or network). Usually passes on its own.';
    default:
      return status >= 500
        ? 'The model provider is having an outage. Usually passes on its own.'
        : 'Check the OpenRouter dashboard (Activity) for this error.';
  }
}

/** Pull the provider's short message out of an error body, never more than 300 chars. */
export function providerDetail(body: string): string {
  try {
    const j = JSON.parse(body) as { error?: { message?: unknown; code?: unknown } };
    const m = j?.error?.message;
    if (typeof m === 'string' && m.trim()) return m.trim().slice(0, 300);
  } catch {
    // not JSON
  }
  return body.replace(/\s+/g, ' ').trim().slice(0, 300);
}

export interface ChatFailureDeps {
  alert: Alerter | null;
  now: number;
  defer: (p: Promise<unknown>) => void;
}

function defaultDefer(p: Promise<unknown>) {
  try {
    after(p);
  } catch {
    void p;
  }
}

export function reportChatFailure(f: ChatFailure, deps: Partial<ChatFailureDeps> = {}): void {
  console.error(`[chat] provider refused: status ${f.status || 'unreachable'}: ${f.detail || 'no detail'}`);
  const now = deps.now ?? Date.now();
  if (lastAlertAt && now - lastAlertAt < CHAT_ALERT_EVERY_MS) return;
  const alert = deps.alert !== undefined ? deps.alert : postmarkAlerter();
  if (!alert) return;
  lastAlertAt = now;
  const text = [
    'The chat on solarirelandgroup.ie is not answering. Every visitor who asks the bee a question is told "I\'m having trouble connecting" and pointed at WhatsApp.',
    '',
    `What to do: ${chatFailureAdvice(f.status)}`,
    '',
    `Provider status: ${f.status || 'unreachable'}`,
    `Provider said: ${f.detail || '(nothing)'}`,
    '',
    'This alert repeats at most once an hour while the chat is down.',
  ].join('\n');
  (deps.defer ?? defaultDefer)(alert.send('Website chat is DOWN', text));
}
