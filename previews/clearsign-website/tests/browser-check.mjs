import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chrome, safari, evidence, base, visit, ready, pages, route } from './site-browser.mjs';

const layouts = [],
  failures = [],
  checks = [];
const check = (valid, title) => {
  checks.push({ title, passed: !!valid });
  if (!valid) failures.push(title);
};
function observe(page) {
  page.on('pageerror', (e) => failures.push('Browser error ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') failures.push('Console ' + m.text() + ' ' + m.location().url);
  });
  page.on('response', (r) => {
    if (r.status() >= 400) failures.push(r.status() + ' ' + r.url());
  });
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (['http:', 'https:'].includes(url.protocol) && url.origin !== base.origin)
      failures.push('External request ' + url.origin);
  });
}
async function layoutCheck(page, slug, width, scale = 1) {
  await page.setViewportSize({ width, height: 900 });
  await page.evaluate((zoom) => {
    document.documentElement.style.fontSize = zoom * 100 + '%';
  }, scale);
  await page.waitForFunction(
    ({ width, scale }) =>
      window.innerWidth === width &&
      getComputedStyle(document.documentElement).fontSize === scale * 16 + 'px',
    { width, scale }
  );
  const issues = await page.evaluate(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const viewport = document.documentElement.clientWidth;
    const errors = [];
    if (document.documentElement.scrollWidth > viewport + 1)
      errors.push('page overflows by ' + (document.documentElement.scrollWidth - viewport));
    const sel = 'main h1,main h2,main h3,main p,main label,main summary,main a,button,.mast .logo';
    for (const el of document.querySelectorAll(sel)) {
      if (!el.checkVisibility() || (el.closest('details:not([open])') && !el.closest('summary')))
        continue;
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      if (box.left < -1 || box.right > viewport + 1)
        errors.push(el.tagName + ' box ' + (el.textContent || '').trim().slice(0, 32));
      const range = document.createRange();
      range.selectNodeContents(el);
      for (const r of range.getClientRects())
        if (r.width && (r.left < -1 || r.right > viewport + 1)) {
          errors.push(el.tagName + ' text ' + (el.textContent || '').trim().slice(0, 32));
          break;
        }
    }
    return [...new Set(errors)].slice(0, 7);
  });
  layouts.push({ page: slug || 'home', width, scale, issues });
  if (issues.length)
    failures.push((slug || 'home') + ' ' + width + ' ×' + scale + ': ' + issues.join(', '));
}
async function menuAndHero(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(visit('/'));
  await ready(page);
  await page.locator('.skip').focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.activeElement?.id === 'main-content');
  assert.match(await page.locator('main h1').innerText(), /websites,\s*brands and software/i);
  await page.locator('.home-intro').getByRole('link', { name: 'Book a phone demo' }).click();
  await page.waitForURL((url) => url.pathname === '/demo/');
  await page.goBack();
  await page
    .getByRole('navigation', { name: 'On this page' })
    .getByRole('link', { name: 'The demo' })
    .click();
  await page.waitForURL((url) => url.pathname === '/' && url.hash === '#business-story');
  assert.equal(
    await page
      .locator('.work-band')
      .getByRole('link', { name: 'Book a phone assistant demo' })
      .getAttribute('href'),
    '/demo/'
  );
  assert.equal(await page.getByRole('link', { name: /brand kit/i }).count(), 0);
  await page.locator('.phone-menu summary').click();
  assert(await page.locator('.phone-menu nav').isVisible());
  await page.keyboard.press('Escape');
  assert(!(await page.locator('.phone-menu nav').isVisible()));
  assert(await page.locator('.phone-menu summary').evaluate((el) => el === document.activeElement));
  await page.locator('.phone-menu summary').press('Enter');
  await page.locator('.phone-menu nav').getByRole('link', { name: 'Who we help' }).click();
  await page.waitForURL(/industries\//);
  assert(!(await page.locator('.phone-menu nav').isVisible()));
  await page.goBack();
  await ready(page);
  await page.locator('#business-needs').getByRole('link', { name: 'Browse our services' }).click();
  await page.waitForURL(/solutions\//);
  const services = page.locator('.directory-links a');
  assert.deepEqual((await services.evaluateAll((links) => links.map((a) => a.pathname))).sort(), [
    '/service-ai/',
    '/service-automation/',
    '/service-branding/',
    '/service-marketing/',
    '/service-software/',
    '/service-websites/',
  ]);
  await page.locator('#automation a').click();
  await page.waitForURL(/service-automation\//);
  await page.getByRole('link', { name: 'Discuss this service' }).click();
  await page.waitForURL(/contact\//);
  assert.equal(await page.locator('[name=interest]').inputValue(), 'Admin & follow-up');
  checks.push({
    title: 'Mobile keyboard navigation, the guided demo, six services and a service enquiry',
    passed: true,
  });
}
async function noScript(browser) {
  const c = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
    }),
    p = await c.newPage();
  try {
    await p.goto(visit('/'));
    assert(await p.locator('.hero-art img').isVisible());
    assert(await p.getByText(/Multiply minutes per task/).isVisible());
    assert(!(await p.locator('#minutes-per-task').isVisible()));
    await p.goto(visit('/industries/'));
    await p.getByText('Trades & garages', { exact: true }).first().click();
    assert(
      await p.locator('#trades').getByRole('link', { name: 'Discuss my business' }).isVisible()
    );
    await p.locator('.phone-menu summary').click();
    await p.locator('.phone-menu nav').getByRole('link', { name: 'Get in touch' }).click();
    await p.waitForURL(/contact\//);
    for (const key of ['sales', 'info', 'accounts', 'support'])
      assert(
        await p
          .locator('main a[href="mailto:' + key + '@clearsign.uk"]')
          .first()
          .isVisible()
      );
    await p.locator('main').getByRole('link', { name: 'Book a phone assistant demo' }).click();
    await p.waitForURL(/\/demo\//);
    const request = new URL(await p.locator('#demo-email').getAttribute('href'));
    assert.equal(request.pathname, 'sales@clearsign.uk');
    assert(request.searchParams.get('body').includes('which times are available'));
    assert.equal(await p.locator('#demo-time').count(), 0);
    checks.push({
      title:
        'Without JavaScript the mobile menu, still artwork, project mail and demo requests work',
      passed: true,
    });
  } finally {
    await c.close();
  }
}

const b = await chrome();
try {
  const c = await b.newContext({ reducedMotion: 'reduce' }),
    p = await c.newPage();
  observe(p);
  for (const slug of pages) {
    const response = await p.goto(visit(route(slug)));
    check(response.status() === 200, route(slug) + ' opens');
    await ready(p);
    if (slug === 'contact') await p.locator('[name=interest]').waitFor();
    if (slug === 'demo') {
      await p.locator('#demo-preferences button').click();
      await p.locator('#demo-time').waitFor();
    }
    check((await p.locator('main h1').count()) === 1, route(slug) + ' page heading');
    for (const w of [320, 360, 390, 430, 768, 1024, 1440, 1920, 2560])
      await layoutCheck(p, slug, w);
    for (const w of [320, 390, 768]) await layoutCheck(p, slug, w, 2);
    await p.evaluate(() => (document.documentElement.style.fontSize = ''));
  }
  await menuAndHero(p);
  for (const [name, width, height] of [
    ['desktop', 1440, 920],
    ['phone', 390, 844],
  ]) {
    await p.setViewportSize({ width, height });
    await p.goto(visit('/'));
    await ready(p);
    await p.locator('.hero-art img').evaluate((i) => i.decode());
    await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await p.screenshot({ path: path.join(evidence, name + '.png'), animations: 'disabled' });
    await p.screenshot({
      path: path.join(evidence, name + '-full.png'),
      fullPage: true,
      animations: 'disabled',
    });
    const links = p.locator('.home-intro .actions a');
    for (const a of await links.all())
      check(
        (await a.boundingBox()).height >= 44,
        'Home ' + name + ' primary and secondary touch targets'
      );
  }
  const req = await p.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name));
  check(
    !req.some((s) => s.includes('/assets/vendor/three') || s.includes('/assets/js/hero-3d')),
    'Reduced-motion homepage skips 3D downloads'
  );
  check(
    await p
      .locator('img:visible')
      .evaluateAll((nodes) => nodes.every((n) => n.complete && n.naturalWidth > 0)),
    'Homepage pictures loaded'
  );
  await c.close();
  await noScript(b);
  const normal = await b.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'no-preference',
    }),
    n = await normal.newPage();
  observe(n);
  await n.goto(visit('/'));
  await n.locator('.hero-art[data-ready=true]').waitFor({ timeout: 18000 });
  await n.waitForFunction(
    () => document.querySelector('.hero-art')?.dataset.heroMotion === 'settled',
    {},
    { timeout: 15000 }
  );
  const first = await n.locator('.hero-art').getAttribute('data-hero-frames');
  await n.waitForTimeout(300);
  check(
    first === (await n.locator('.hero-art').getAttribute('data-hero-frames')),
    '3D mark stops animating after its entrance'
  );
  await n.screenshot({ path: path.join(evidence, 'desktop-animation.png') });
  await n.setViewportSize({ width: 390, height: 844 });
  await n.waitForFunction(
    () => document.querySelector('.hero-art canvas')?.getBoundingClientRect().width < 400
  );
  await n.screenshot({ path: path.join(evidence, 'phone-animation.png') });
  await n.setViewportSize({ width: 1440, height: 900 });
  await n.locator('.desk-nav').getByRole('link', { name: 'About', exact: true }).click();
  await n.waitForURL(/about\//);
  await n.locator('.mast .logo').click();
  await n.locator('.hero-art[data-ready=true]').waitFor({ timeout: 15000 });
  await n.emulateMedia({ reducedMotion: 'reduce' });
  await n.waitForFunction(() => document.querySelector('.hero-art')?.dataset.ready === 'false');
  await n.locator('.hero-art img').waitFor({ state: 'visible' });
  check(
    await n.locator('.hero-art img').isVisible(),
    'Returning to the homepage restores the artwork and switching to reduced motion displays the still'
  );
  await normal.close();
  for (const hint of [
    { saveData: true, effectiveType: '4g' },
    { saveData: false, effectiveType: '3g' },
  ]) {
    const limited = await b.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'no-preference',
    });
    await limited.addInitScript(
      (value) => Object.defineProperty(navigator, 'connection', { configurable: true, value }),
      hint
    );
    const limitedPage = await limited.newPage(),
      requests = [];
    limitedPage.on('request', (r) => requests.push(r.url()));
    await limitedPage.goto(visit('/'), { waitUntil: 'networkidle' });
    await limitedPage.locator('.hero-art img').evaluate((img) => img.decode());
    check(
      !requests.some(
        (url) => url.includes('/assets/js/hero-3d') || url.includes('/assets/vendor/three')
      ) && (await limitedPage.locator('.hero-art img').isVisible()),
      'Connection preference ' + JSON.stringify(hint) + ' gets the lightweight still'
    );
    await limited.close();
  }
} finally {
  await b.close();
}
const w = await safari();
try {
  const p = await w.newPage({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  observe(p);
  await menuAndHero(p);
  await p.goto(visit('/'));
  await ready(p);
  await layoutCheck(p, 'home-webkit', 320);
  await layoutCheck(p, 'home-webkit', 390);
  await layoutCheck(p, 'home-webkit', 390, 2);
  await noScript(w);
} finally {
  await w.close();
}
await fs.writeFile(
  path.join(evidence, 'browser-checks.json'),
  JSON.stringify({ base: base.href, checks, layouts, failures }, null, 2) + '\n'
);
console.log(
  layouts.length + ' responsive layout checks; ' + checks.length + ' route and interaction checks.'
);
if (failures.length) {
  console.error([...new Set(failures)].slice(0, 26).join('\n'));
  process.exitCode = 1;
}
