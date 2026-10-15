import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

function loadEnvFile(filename) {
  const path = resolve(root, filename);
  if (!existsSync(path)) return;

  const contents = readFileSync(path, 'utf8');

  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[match[1]] = value;
  }
}

// Load local env files from lowest to highest precedence.
// Existing environment variables (such as Vercel settings) take priority.
for (const filename of [
  '.env.production.local',
  '.env.production',
  '.env.local',
  '.env',
]) {
  loadEnvFile(filename);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Sitemap generation requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const { data: articles, error } = await supabase
  .from('blogs')
  .select('slug, published_at')
  .eq('is_published', true);

if (error) {
  throw new Error(`Unable to fetch published blog slugs: ${error.message}`);
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

const urls = new Map();

urls.set('https://sarvasolar.in/', null);
urls.set('https://sarvasolar.in/blog', null);

for (const article of articles ?? []) {
  if (typeof article.slug !== 'string' || !article.slug.trim()) continue;

  const slug = article.slug.trim();

  // Blog routes support one slug segment, not nested paths.
  if (slug.includes('/') || slug === '.' || slug === '..') continue;

  const url = `https://sarvasolar.in/blog/${encodeURIComponent(slug)}`;

  let lastmod = null;
  if (article.published_at) {
    const date = new Date(article.published_at);
    if (!Number.isNaN(date.getTime())) {
      lastmod = date.toISOString().slice(0, 10);
    }
  }

  urls.set(url, lastmod);
}

const entries = [...urls.entries()].map(([url, lastmod]) => {
  const lastmodTag = lastmod
    ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>`
    : '';

  return `  <url>\n    <loc>${escapeXml(url)}</loc>${lastmodTag}\n  </url>`;
});

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  '</urlset>',
  '',
].join('\n');

const output = resolve(root, 'dist', 'sitemap.xml');
writeFileSync(output, xml, 'utf8');

console.log(`Generated ${output}`);
console.log(`Included ${urls.size} URLs (${Math.max(0, urls.size - 2)} published article URLs).`);
