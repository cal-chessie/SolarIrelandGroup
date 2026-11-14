import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chatFailureAdvice, providerDetail, reportChatFailure, resetChatFailureReport, CHAT_ALERT_EVERY_MS } from '@/lib/chatFailure';

describe('chat failure reporting (nothing fails silently)', () => {
  beforeEach(() => {
    resetChatFailureReport();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('pulls the provider message out of an OpenRouter error body', () => {
    expect(providerDetail('{"error":{"message":"Key limit exceeded","code":403}}')).toBe('Key limit exceeded');
    expect(providerDetail('not json\n at all')).toBe('not json at all');
    expect(providerDetail('x'.repeat(900)).length).toBe(300);
  });

  it('gives the owner an action for each provider status', () => {
    expect(chatFailureAdvice(402)).toMatch(/credit/);
    expect(chatFailureAdvice(403)).toMatch(/limit/);
    expect(chatFailureAdvice(401)).toMatch(/OPENROUTER_API_KEY/);
  });

  it('logs every failure and alerts at most once an hour', () => {
    const sent: string[] = [];
    const alert = { send: async (s: string, t: string) => (sent.push(`${s}\n${t}`), true) };
    const defer = (p: Promise<unknown>) => void p;
    reportChatFailure({ status: 403, detail: 'Key limit exceeded' }, { alert, now: 1_000, defer });
    reportChatFailure({ status: 403, detail: 'Key limit exceeded' }, { alert, now: 2_000, defer });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toContain('Website chat is DOWN');
    expect(sent[0]).toContain('Key limit exceeded');
    expect(console.error).toHaveBeenCalledTimes(2);
    reportChatFailure({ status: 403, detail: 'again' }, { alert, now: 1_000 + CHAT_ALERT_EVERY_MS, defer });
    expect(sent).toHaveLength(2);
  });
});
