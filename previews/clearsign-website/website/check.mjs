import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { services } from './content/services.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--dir'))
  throw new Error('Usage: node website/check.mjs [--dir <project-local export>]');
const root = path.resolve(args[1] || path.join(project, 'site'));
if (!root.startsWith(project + path.sep)) throw new Error('Use an export inside this project.');
const slugs = [
  '',
  'solutions',
  'industries',
  'about',
  'contact',
  'demo',
  ...services.map((s) => 'service-' + s.slug),
];
const documents = new Map(),
  errors = [],
  refs = new Set();
const local = new URL('https://clearsign.uk/');
const decode = (s) => s.replaceAll('&amp;', '&');
const fail = (message) => errors.push(message);
for (const slug of slugs) {
  const route = slug ? '/' + slug + '/' : '/';
  const html = await fs.readFile(path.join(root, slug, 'index.html'), 'utf8');
  documents.set(route, html);
  if ((html.match(/<h1(?:[\s>])/g) || []).length !== 1) fail(route + ' needs one main heading');
  if (
    !html.includes('lang="en-GB"') ||
    !html.includes('name="viewport"') ||
    !html.includes('name="description"')
  )
    fail(route + ' missing page information');
  if (!html.includes('rel="canonical" href="' + new URL(route, local).href + '"'))
    fail(route + ' canonical address');
  if (
    /name="robots" content="noindex|Local design preview|Preview only|mock[- ]?up|Pause animations|remain for review/i.test(
      html
    )
  )
    fail(route + ' public wording or indexing');
  if (!html.includes('/_next/static/')) fail(route + ' missing Next.js assets');
  if (/brand[ -]kit|href="\/brand(?:\/|\.html)/i.test(html))
    fail(route + ' links to the retired brand kit');
  if (slug && (await fs.readFile(path.join(root, slug + '.html'), 'utf8')) !== html)
    fail(slug + ' legacy address differs');
}
for (const [route, html] of documents) {
  const attributes = [...html.matchAll(/\s(?:href|src)="([^"]+)"/gi)].map((m) => m[1]);
  for (const match of html.matchAll(/\ssrcSet="([^"]+)"/gi))
    attributes.push(...match[1].split(',').map((part) => part.trim().split(/\s+/)[0]));
  for (const value of attributes) {
    const url = new URL(decode(value), new URL(route, local));
    if (url.protocol === 'mailto:') {
      if (
        !['sales', 'info', 'support', 'accounts']
          .map((x) => x + '@clearsign.uk')
          .includes(url.pathname)
      )
        fail(route + ' unknown public recipient');
      continue;
    }
    if (url.origin !== local.origin) {
      fail(route + ' unexpected external asset or link ' + url.origin);
      continue;
    }
    if (
      url.hash &&
      documents.has(url.pathname) &&
      !documents.get(url.pathname).includes('id="' + decodeURIComponent(url.hash.slice(1)) + '"')
    )
      fail(route + ' broken section ' + url.pathname + url.hash);
    refs.add(url.pathname);
  }
}
for (const name of refs) {
  const file = path.join(root, decodeURIComponent(name), name.endsWith('/') ? 'index.html' : '');
  try {
    if (!(await fs.stat(file)).isFile()) fail('Missing file for ' + name);
  } catch {
    fail('Missing ' + name);
  }
}
const sitemap = await fs.readFile(path.join(root, 'sitemap.xml'), 'utf8');
for (const route of documents.keys())
  if (!sitemap.includes('<loc>' + new URL(route, local).href + '</loc>'))
    fail('Missing from sitemap ' + route);
const sitemapEntries = sitemap.match(/<loc>/g) || [];
if (sitemapEntries.length !== documents.size) fail('Unexpected public sitemap pages');
const redirects = (await fs.readFile(path.join(root, '_redirects'), 'utf8')).split('\n');
for (const oldAddress of ['/brand', '/brand/', '/brand.html', '/brand/index.html']) {
  if (!redirects.includes(oldAddress + ' /service-branding/ 301!'))
    fail('Missing retired address ' + oldAddress);
}
for (const retired of [
  'brand/index.html',
  'brand.html',
  'assets/brand/signature-dark.svg',
  'assets/brand/sizes/profile-charcoal-1080.png',
]) {
  const exists = await fs.stat(path.join(root, retired)).catch(() => undefined);
  if (exists) fail('Retired public file still present ' + retired);
}
const robots = await fs.readFile(path.join(root, 'robots.txt'), 'utf8');
if (!robots.includes('https://clearsign.uk/sitemap.xml')) fail('Sitemap missing from robots');
if (errors.length) throw new Error(errors.join('\n'));
console.log(
  'Verified ' +
    documents.size +
    ' Next.js pages, ' +
    (slugs.length - 1) +
    ' file-style page addresses, ' +
    refs.size +
    ' local links/assets and the search-engine sitemap.'
);
