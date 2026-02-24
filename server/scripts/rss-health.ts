/**
 * RSS Health Check — analyzes availability of all configured RSS sources.
 * Run: cd server && npm run rss:health
 */

import { RSS_SOURCES } from '../src/data/sources';
import { parseRSSItems } from '../src/services/feed-fetcher';

const CONCURRENCY = 10;
const TIMEOUT_MS = 15_000;
const STALE_DAYS = 30;

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'application/rss+xml, application/xml, text/xml, */*;q=0.8',
  'Accept-Language': 'cs,sk;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
};

type Status = 'OK' | 'WARNING' | 'ERROR';

interface SourceResult {
  name: string;
  url: string;
  language: string;
  status: Status;
  httpStatus: number | null;
  itemCount: number;
  newestDate: string;
  ageDays: number | null;
  error: string;
}

function daysBetween(date: Date, now: Date): number {
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

async function checkSource(source: typeof RSS_SOURCES[number]): Promise<SourceResult> {
  const result: SourceResult = {
    name: source.name,
    url: source.url,
    language: source.language,
    status: 'ERROR',
    httpStatus: null,
    itemCount: 0,
    newestDate: '',
    ageDays: null,
    error: '',
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(source.url, {
      headers: HEADERS,
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    result.httpStatus = response.status;

    if (!response.ok) {
      result.error = `HTTP ${response.status}`;
      return result;
    }

    const xml = await response.text();
    const items = parseRSSItems(xml);
    result.itemCount = items.length;

    // Find newest pubDate
    const now = new Date();
    let newest: Date | null = null;
    for (const item of items) {
      const d = parseDate(item.pubDate);
      if (d && (!newest || d > newest)) {
        newest = d;
      }
    }

    if (newest) {
      result.newestDate = newest.toISOString().slice(0, 10);
      result.ageDays = daysBetween(newest, now);
    }

    // Classify
    if (items.length > 0 && (result.ageDays === null || result.ageDays <= STALE_DAYS)) {
      result.status = 'OK';
    } else if (items.length === 0) {
      result.status = 'WARNING';
      result.error = '0 items parsed';
    } else {
      result.status = 'WARNING';
      result.error = `Stale: ${result.ageDays}d old`;
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      result.error = 'Timeout (15s)';
    } else {
      result.error = err.message?.slice(0, 80) || 'Unknown error';
    }
  }

  return result;
}

async function runWithConcurrency<T>(
  items: T[],
  fn: (item: T) => Promise<any>,
  concurrency: number
): Promise<any[]> {
  const results: any[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

function pad(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
}

function padLeft(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : ' '.repeat(len - str.length) + str;
}

async function main() {
  console.log(`\nRSS Health Check — ${RSS_SOURCES.length} sources\n`);
  console.log('Checking feeds with concurrency', CONCURRENCY, '...\n');

  const startTime = Date.now();

  const results: SourceResult[] = await runWithConcurrency(
    RSS_SOURCES,
    async (source) => {
      const r = await checkSource(source);
      const icon = r.status === 'OK' ? '.' : r.status === 'WARNING' ? 'W' : 'X';
      process.stdout.write(icon);
      return r;
    },
    CONCURRENCY
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n\nDone in ${elapsed}s\n`);

  // Sort: ERROR first, then WARNING, then OK
  const order: Record<Status, number> = { ERROR: 0, WARNING: 1, OK: 2 };
  results.sort((a, b) => order[a.status] - order[b.status] || a.name.localeCompare(b.name));

  // Summary
  const ok = results.filter((r) => r.status === 'OK').length;
  const warn = results.filter((r) => r.status === 'WARNING').length;
  const err = results.filter((r) => r.status === 'ERROR').length;

  console.log('='.repeat(120));
  console.log(`  OK: ${ok}   WARNING: ${warn}   ERROR: ${err}   TOTAL: ${results.length}`);
  console.log('='.repeat(120));
  console.log('');

  // Table header
  const cols = [
    ['STATUS', 7],
    ['LANG', 4],
    ['HTTP', 4],
    ['ITEMS', 5],
    ['NEWEST', 10],
    ['AGE(d)', 6],
    ['NAME', 28],
    ['ERROR', 40],
  ] as const;

  const header = cols.map(([label, w]) => pad(label, w)).join(' | ');
  console.log(header);
  console.log('-'.repeat(header.length));

  for (const r of results) {
    const row = [
      pad(r.status, 7),
      pad(r.language, 4),
      padLeft(r.httpStatus?.toString() ?? '-', 4),
      padLeft(r.itemCount.toString(), 5),
      pad(r.newestDate || '-', 10),
      padLeft(r.ageDays?.toString() ?? '-', 6),
      pad(r.name, 28),
      pad(r.error, 40),
    ].join(' | ');
    console.log(row);
  }

  console.log('');

  // List errors for easy copy-paste cleanup
  if (err > 0) {
    console.log(`\n--- ERROR sources (${err}) ---`);
    for (const r of results.filter((r) => r.status === 'ERROR')) {
      console.log(`  ${r.name}: ${r.error} (${r.url})`);
    }
  }

  if (warn > 0) {
    console.log(`\n--- WARNING sources (${warn}) ---`);
    for (const r of results.filter((r) => r.status === 'WARNING')) {
      console.log(`  ${r.name}: ${r.error} (${r.url})`);
    }
  }

  console.log('');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
