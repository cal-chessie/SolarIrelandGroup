import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// On Vercel/serverless the project directory is read-only — use /tmp instead.
// NOTE: /tmp is ephemeral per lambda instance, so A/B stats won't persist there.
// Point AB_DB_DIR at a persistent disk (or migrate to a hosted DB) for real data.
const DB_DIR =
  process.env.AB_DB_DIR ||
  (process.env.VERCEL ? path.join('/tmp', 'ab-testing') : path.join(process.cwd(), 'db'));
const DB_PATH = path.join(DB_DIR, 'custom.db');

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('busy_timeout = 5000');
    _db.exec(`
      CREATE TABLE IF NOT EXISTS ab_experiments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        status TEXT DEFAULT 'running' CHECK(status IN ('running','paused','stopped')),
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS ab_variants (
        id TEXT PRIMARY KEY,
        experiment_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        traffic_weight INTEGER DEFAULT 50,
        is_control INTEGER DEFAULT 0,
        FOREIGN KEY (experiment_id) REFERENCES ab_experiments(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS ab_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experiment_id TEXT NOT NULL,
        variant_id TEXT NOT NULL,
        visitor_id TEXT NOT NULL,
        session_id TEXT DEFAULT '',
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (experiment_id) REFERENCES ab_experiments(id),
        FOREIGN KEY (variant_id) REFERENCES ab_variants(id)
      );

      CREATE TABLE IF NOT EXISTS ab_conversions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        experiment_id TEXT NOT NULL,
        variant_id TEXT NOT NULL,
        visitor_id TEXT NOT NULL,
        conversion_type TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (experiment_id) REFERENCES ab_experiments(id),
        FOREIGN KEY (variant_id) REFERENCES ab_variants(id)
      );

      CREATE INDEX IF NOT EXISTS idx_assignments_visitor ON ab_assignments(visitor_id);
      CREATE INDEX IF NOT EXISTS idx_assignments_experiment ON ab_assignments(experiment_id);
      CREATE INDEX IF NOT EXISTS idx_conversions_experiment ON ab_conversions(experiment_id);
      CREATE INDEX IF NOT EXISTS idx_conversions_variant ON ab_conversions(variant_id);
      CREATE INDEX IF NOT EXISTS idx_conversions_type ON ab_conversions(conversion_type);
    `);
  }
  return _db;
}

/* ═══════════════════════════════════════════════════════
   SEED — default experiments
   ═══════════════════════════════════════════════════════ */
export function seedDefaultExperiments() {
  const db = getDb();
  const existing = db.prepare('SELECT COUNT(*) as c FROM ab_experiments').get() as { c: number };
  if (existing.c > 0) return;

  const insertExp = db.prepare(
    'INSERT OR IGNORE INTO ab_experiments (id, name, description) VALUES (?, ?, ?)'
  );
  const insertVar = db.prepare(
    'INSERT OR IGNORE INTO ab_variants (id, experiment_id, name, description, traffic_weight, is_control) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const experiments = [
    {
      id: 'hero-cta-text',
      name: 'Hero CTA Text',
      description: 'Tests different primary CTA button text to maximise click-through rate',
      variants: [
        { id: 'hero-cta-a', name: 'Analyse My Bill — Free', weight: 50, control: 1 },
        { id: 'hero-cta-b', name: 'Get Your Free Solar Quote', weight: 50, control: 0 },
      ],
    },
    {
      id: 'hero-headline',
      name: 'Hero Headline',
      description: 'Tests hero headline copy variants for engagement',
      variants: [
        { id: 'hero-head-a', name: 'Your Energy. Your Asset.', weight: 50, control: 1 },
        { id: 'hero-head-b', name: 'Stop Renting Your Energy.', weight: 50, control: 0 },
      ],
    },
    {
      id: 'social-proof-style',
      name: 'Social Proof Display',
      description: 'Tests different social proof presentations in the hero section',
      variants: [
        { id: 'social-a', name: 'Badge + Trust Row', weight: 50, control: 1 },
        { id: 'social-b', name: 'Compact Stats Row', weight: 50, control: 0 },
      ],
    },
  ];

  const tx = db.transaction(() => {
    for (const exp of experiments) {
      insertExp.run(exp.id, exp.name, exp.description);
      for (const v of exp.variants) {
        insertVar.run(v.id, exp.id, v.name, '', v.weight, v.control ? 1 : 0);
      }
    }
  });
  tx();
}

/* ═══════════════════════════════════════════════════════
   VARIANT ASSIGNMENT
   ═══════════════════════════════════════════════════════ */
export function assignVariant(
  experimentId: string,
  visitorId: string,
  sessionId: string = ''
): { variantId: string; variantName: string; isNew: boolean } {
  const db = getDb();

  // Check if experiment exists and is running
  const experiment = db.prepare(
    'SELECT id, status FROM ab_experiments WHERE id = ?'
  ).get(experimentId) as { id: string; status: string } | undefined;

  if (!experiment || experiment.status !== 'running') {
    const control = db.prepare(
      "SELECT id, name FROM ab_variants WHERE experiment_id = ? AND is_control = 1 LIMIT 1"
    ).get(experimentId) as { id: string; name: string } | undefined;
    return { variantId: control?.id || 'control', variantName: control?.name || 'Control', isNew: false };
  }

  // Check if visitor already assigned
  const existing = db.prepare(
    'SELECT variant_id FROM ab_assignments WHERE experiment_id = ? AND visitor_id = ?'
  ).get(experimentId, visitorId) as { variant_id: string } | undefined;

  if (existing) {
    const variant = db.prepare('SELECT name FROM ab_variants WHERE id = ?').get(existing.variant_id) as { name: string };
    return { variantId: existing.variant_id, variantName: variant?.name || '', isNew: false };
  }

  // Weighted random selection
  const variants = db.prepare(
    'SELECT id, name, traffic_weight FROM ab_variants WHERE experiment_id = ?'
  ).all(experimentId) as { id: string; name: string; traffic_weight: number }[];

  const totalWeight = variants.reduce((sum, v) => sum + v.traffic_weight, 0);
  let r = Math.random() * totalWeight;
  let picked = variants[0];
  for (const v of variants) {
    r -= v.traffic_weight;
    if (r <= 0) { picked = v; break; }
  }

  db.prepare(
    'INSERT INTO ab_assignments (experiment_id, variant_id, visitor_id, session_id) VALUES (?, ?, ?, ?)'
  ).run(experimentId, picked.id, visitorId, sessionId);

  return { variantId: picked.id, variantName: picked.name, isNew: true };
}

/* ═══════════════════════════════════════════════════════
   CONVERSION TRACKING
   ═══════════════════════════════════════════════════════ */
export function trackConversion(
  experimentId: string,
  visitorId: string,
  conversionType: string,
  metadata: Record<string, unknown> = {}
): boolean {
  const db = getDb();

  const assignment = db.prepare(
    'SELECT variant_id FROM ab_assignments WHERE experiment_id = ? AND visitor_id = ?'
  ).get(experimentId, visitorId) as { variant_id: string } | undefined;

  if (!assignment) return false;

  db.prepare(
    'INSERT INTO ab_conversions (experiment_id, variant_id, visitor_id, conversion_type, metadata) VALUES (?, ?, ?, ?, ?)'
  ).run(experimentId, assignment.variant_id, visitorId, conversionType, JSON.stringify(metadata));

  return true;
}

/* ═══════════════════════════════════════════════════════
   RESULTS / STATS
   ═══════════════════════════════════════════════════════ */
export function getExperimentResults(experimentId: string) {
  const db = getDb();

  const experiment = db.prepare(
    'SELECT * FROM ab_experiments WHERE id = ?'
  ).get(experimentId) as Record<string, unknown> | undefined;

  if (!experiment) return null;

  const variants = db.prepare(
    `SELECT
      v.id, v.name, v.description, v.traffic_weight, v.is_control,
      COUNT(DISTINCT a.id) as visitors,
      COUNT(DISTINCT CASE WHEN c.id IS NOT NULL THEN a.id END) as conversions
    FROM ab_variants v
    LEFT JOIN ab_assignments a ON a.variant_id = v.id
    LEFT JOIN ab_conversions c ON c.variant_id = v.id AND c.experiment_id = v.experiment_id
    WHERE v.experiment_id = ?
    GROUP BY v.id`
  ).all(experimentId) as Array<Record<string, unknown>>;

  const conversionBreakdown = db.prepare(
    `SELECT
      v.name as variant_name,
      c.conversion_type,
      COUNT(*) as count
    FROM ab_conversions c
    JOIN ab_variants v ON v.id = c.variant_id
    WHERE c.experiment_id = ?
    GROUP BY v.name, c.conversion_type
    ORDER BY v.name, c.conversion_type`
  ).all(experimentId) as Array<Record<string, unknown>>;

  const totalVisitors = variants.reduce((sum, v) => sum + Number(v.visitors || 0), 0);
  const totalConversions = variants.reduce((sum, v) => sum + Number(v.conversions || 0), 0);

  return {
    experiment,
    variants: variants.map((v) => ({
      ...v,
      visitors: Number(v.visitors),
      conversions: Number(v.conversions),
      conversionRate: Number(v.visitors) > 0
        ? (Number(v.conversions) / Number(v.visitors) * 100).toFixed(2) + '%'
        : '0%',
    })),
    conversionBreakdown,
    totalVisitors,
    totalConversions,
    overallConversionRate: totalVisitors > 0
      ? (totalConversions / totalVisitors * 100).toFixed(2) + '%'
      : '0%',
  };
}

export function getAllExperiments() {
  const db = getDb();
  return db.prepare('SELECT * FROM ab_experiments ORDER BY created_at DESC').all();
}

export function getStats() {
  const db = getDb();
  const experiments = getAllExperiments();
  const assignments = db.prepare('SELECT COUNT(*) as c FROM ab_assignments').get() as { c: number };
  const conversions = db.prepare('SELECT COUNT(*) as c FROM ab_conversions').get() as { c: number };
  return {
    totalExperiments: experiments.length,
    runningExperiments: experiments.filter((e: Record<string, unknown>) => e.status === 'running').length,
    totalAssignments: assignments.c,
    totalConversions: conversions.c,
    experiments,
  };
}

export function updateExperimentStatus(id: string, status: 'running' | 'paused' | 'stopped') {
  const db = getDb();
  db.prepare('UPDATE ab_experiments SET status = ?, updated_at = unixepoch() WHERE id = ?').run(status, id);
}
