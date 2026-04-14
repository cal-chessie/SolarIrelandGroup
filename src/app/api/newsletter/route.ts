import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

function getDb() {
  const dbPath = path.join(process.cwd(), 'db', 'custom.db');
  return new Database(dbPath);
}

function ensureTable(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      source_page TEXT NOT NULL DEFAULT 'unknown',
      status TEXT NOT NULL DEFAULT 'active',
      subscribed_at TEXT NOT NULL DEFAULT (datetime('now')),
      unsubscribed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
  `);
}

export async function POST(request: NextRequest) {
  try {
    const { email, source_page } = await request.json();

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const db = getDb();
    ensureTable(db);

    // Upsert: if email exists and unsubscribed, reactivate; otherwise insert
    const existing = db.prepare('SELECT id, status FROM newsletter_subscriptions WHERE email = ?').get(email.trim()) as any;

    if (existing) {
      if (existing.status === 'unsubscribed') {
        db.prepare("UPDATE newsletter_subscriptions SET status = 'active', subscribed_at = datetime('now'), unsubscribed_at = NULL WHERE email = ?").run(email.trim());
      }
      // Already active — just return success
      db.close();
      return NextResponse.json({
        success: true,
        message: 'You\'re already subscribed! Thanks for your interest.',
        alreadySubscribed: true,
      });
    }

    db.prepare(`
      INSERT INTO newsletter_subscriptions (email, source_page, status)
      VALUES (?, ?, 'active')
    `).run(email.trim(), source_page || request.headers.get('referer') || 'unknown');

    db.close();

    console.log('[Newsletter] New subscription:', { email: email.trim(), source: source_page });

    return NextResponse.json({
      success: true,
      message: 'You\'re subscribed! We\'ll send you the latest solar news and tips.',
    });
  } catch (error: any) {
    if (error?.message?.includes('UNIQUE constraint')) {
      return NextResponse.json({
        success: true,
        message: 'You\'re already subscribed! Thanks for your interest.',
        alreadySubscribed: true,
      });
    }
    console.error('[Newsletter] Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
