import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const evidence = path.join(project, 'outputs', 'phone-first-2026-11-18');
const scratch = path.join(project, '.codex', 'cache', 'growth-site');
for (const [key, folder] of Object.entries({
  TMPDIR: 'tmp',
  XDG_CACHE_HOME: 'xdg',
  XDG_CONFIG_HOME: 'browser-config',
})) {
  process.env[key] = path.join(scratch, folder);
  await fs.mkdir(process.env[key], { recursive: true });
}
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(project, '.codex', 'cache', 'playwright');
await fs.mkdir(evidence, { recursive: true });
async function loadPlaywright() {
  if (process.env.PLAYWRIGHT_MODULE) return import(process.env.PLAYWRIGHT_MODULE);
  try {
    return await import('playwright');
  } catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  }
  // Desktop's installed Playwright is read-only. Browser profiles and output go in this project.
  const runtime = path.join(
    process.env.HOME,
    '.cache',
    'codex-runtimes',
    'codex-primary-runtime',
    'dependencies',
    'node',
    'node_modules',
    'playwright',
    'index.mjs'
  );
  return import(pathToFileURL(runtime).href);
}
const { chromium, webkit, devices } = await loadPlaywright();
export const phoneProfiles = { Chrome: devices['Pixel 7'], WebKit: devices['iPhone 13'] };
export const base = new URL(process.env.SITE_URL || 'http://127.0.0.1:3213/');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname))
  throw new Error('Run these editing checks against a local preview.');
export const visit = (pathname) => new URL(pathname, base).href;
export const chrome = () =>
  chromium.launch({
    headless: true,
    executablePath:
      process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--disable-crash-reporter', '--enable-unsafe-swiftshader'],
  });
export const safari = () => webkit.launch({ headless: true });
export async function ready(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.locator('main h1').waitFor();
}
export const pages = [
  '',
  'solutions',
  'service-websites',
  'service-branding',
  'service-ai',
  'service-automation',
  'service-software',
  'service-marketing',
  'industries',
  'about',
  'contact',
  'demo',
];
export const route = (slug) => (slug ? '/' + slug + '/' : '/');
