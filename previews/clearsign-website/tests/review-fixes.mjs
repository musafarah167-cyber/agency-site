import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chrome, safari, visit, base, evidence, ready, phoneProfiles } from './site-browser.mjs';

const results = [];
const contexts = [
  ['Website & enquiries', 'Salons & barbers', 'Websites'],
  ['AI & automation', 'Phone enquiry', 'AI agents'],
  ['AI & automation', 'Repeated admin', 'Admin & follow-up'],
  ['Marketing & branding', 'Restaurants', 'Marketing & print'],
  ['Custom software', 'Professional firms', 'Custom software'],
  ['Websites', 'Website enquiry', 'Websites'],
  ['Admin & follow-up', 'Car hire', 'Admin & follow-up'],
  ['AI agents', 'Restaurants & takeaways', 'AI agents'],
  ['Custom software', 'Accountants & legal firms', 'Custom software'],
  ['Admin & follow-up', 'Trades & garages', 'Admin & follow-up'],
  ['AI agents', 'Accountancy practices', 'AI agents'],
  ['AI agents', 'Law firms', 'AI agents'],
  ['Custom software', 'Transport & logistics', 'Custom software'],
  ['AI agents', 'AI on our own equipment', 'AI agents'],
];

async function phoneHierarchy(page) {
  const screens = [];
  for (const [width, height] of [
    [320, 568],
    [360, 640],
    [390, 844],
    [430, 932],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(visit('/'));
    await ready(page);
    const conversation = page
      .locator('.home-intro')
      .getByRole('link', { name: 'Request a project outline' });
    const hero = await conversation.boundingBox();
    assert(
      hero.height >= 44 && hero.y + hero.height <= height,
      'Visible primary business enquiry at ' + width
    );
    const proof = await page.getByRole('heading', { name: 'Can I see it working?' }).boundingBox();
    assert(proof.y < height, 'Work samples introduced on the first phone screen at ' + width);
    await conversation.tap();
    await page.waitForURL(/\/contact\//);
    const start = page.getByRole('link', { name: 'Start my enquiry' });
    const contact = await start.boundingBox();
    assert(
      contact.height >= 44 && contact.y + contact.height <= height,
      'Visible business enquiry link at ' + width
    );
    await start.tap();
    await page.locator('#enquiry-form').waitFor();
    assert.equal(await page.locator('[name=interest]').inputValue(), 'Not sure yet');
    await page.locator('main').getByRole('link', { name: 'Book a phone assistant demo' }).tap();
    await page.waitForURL(/\/demo\//);
    await page.locator('#demo-preferences button').waitFor();
    const email = await page.locator('#demo-email').boundingBox();
    assert(
      email.height >= 44 && email.y + email.height <= height,
      'Visible demo email action at ' + width + ' (bottom ' + (email.y + email.height) + ')'
    );
    screens.push({
      width,
      height,
      homeActionBottom: Math.round(hero.y + hero.height),
      firstProofHeadingTop: Math.round(proof.y),
      contactActionBottom: Math.round(contact.y + contact.height),
      demoActionBottom: Math.round(email.y + email.height),
    });
  }
  return screens;
}

async function checkPhoneJourney(page) {
  const sections = ['business-story', 'your-business', 'bottlenecks', 'business-needs'];
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(visit('/'));
  const guide = page.getByRole('navigation', { name: 'On this page' });
  await guide.waitFor();
  const links = guide.getByRole('link');
  assert.equal(await links.count(), sections.length);
  for (const [i, id] of sections.entries()) {
    const link = links.nth(i);
    assert((await link.boundingBox()).height >= 44);
    await link.tap();
    await page.waitForURL((url) => url.hash === '#' + id);
    await page.waitForFunction(
      (id) => document.querySelector('.phone-journey [aria-current="location"]')?.hash === '#' + id,
      id
    );
    const bar = await guide.boundingBox();
    const heading = await page.locator('#' + id + ' h2').boundingBox();
    assert(heading.y >= bar.y + bar.height - 1 && heading.y < 400, 'Visible heading for ' + id);
  }
  await page.goBack();
  await page.waitForURL((url) => url.hash === '#bottlenecks');
  // Scrolling by hand also moves the indicator, independently of the address.
  await page.locator('#your-business').evaluate((section) => section.scrollIntoView());
  await page.waitForFunction(
    () =>
      document.querySelector('.phone-journey [aria-current="location"]')?.hash === '#your-business'
  );
  assert.equal(new URL(page.url()).hash, '#bottlenecks');
  await page.setViewportSize({ width: 1280, height: 800 });
  await guide.waitFor({ state: 'hidden' });
  await page.setViewportSize({ width: 390, height: 844 });
  await guide.waitFor();
}

async function checkTimeEstimate(page) {
  await page.goto(visit('/#bottlenecks'));
  const result = page.locator('.time-result');
  const minutes = page.getByLabel('Whole minutes per task');
  const repeats = page.getByLabel('Times per week');
  assert.match(await result.innerText(), /Example calculation[\s\S]*2 hours a week/);
  await minutes.fill('7');
  await repeats.fill('13');
  assert.match(await result.innerText(), /1 hour 31 minutes a week/);
  assert.match(await result.innerText(), /6 hours 4 minutes over four similar weeks/);
  const email = new URL(
    await page.getByRole('link', { name: 'Email us this estimate' }).getAttribute('href')
  );
  assert.equal(email.pathname, 'sales@clearsign.uk');
  assert.match(email.searchParams.get('body'), /7 minutes each time, 13 times a week/);
  for (const invalid of ['', '-2', '0.5', 'abc', '99999999999999999999']) {
    await minutes.fill(invalid);
    assert.equal(await minutes.getAttribute('aria-invalid'), 'true');
    assert.equal(await page.getByRole('link', { name: 'Email us this estimate' }).count(), 0);
  }
  await minutes.fill('0');
  assert.match(await result.innerText(), /0 minutes a week/);
  await minutes.fill('9007199254740991');
  assert.match(await result.innerText(), /too large/);
  await minutes.fill('1');
  await repeats.fill('1');
  assert.match(await result.innerText(), /1 minute a week/);
}

async function disclosureMotion(page) {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => {
    const events = [];
    document.documentElement.dataset.panelMotion = '';
    document.addEventListener('animationstart', (e) => {
      if (e.target instanceof HTMLElement && e.target.closest('#demo-preferences')) {
        events.push(e.animationName);
        document.documentElement.dataset.panelMotion = events.join(' ');
      }
    });
  });
  const toggle = page.getByRole('button', { name: 'Add a time or firm name' });
  await toggle.tap();
  await page.waitForFunction(() =>
    document.documentElement.dataset.panelMotion.includes('accordion-down')
  );
  assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  await page.locator('#demo-firm').waitFor();
  await toggle.tap();
  await page.waitForFunction(() =>
    document.documentElement.dataset.panelMotion.includes('accordion-up')
  );
  assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
  await page.locator('#demo-firm').waitFor({ state: 'hidden' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await toggle.tap();
  await page.locator('#demo-firm').waitFor();
  assert.equal(
    await page
      .locator('#demo-preferences [data-slot=accordion-content]')
      .evaluate((el) => getComputedStyle(el).animationName),
    'none'
  );
  return { open: 'accordion-down', close: 'accordion-up', reducedMotion: 'none' };
}

async function checkEngine(engine, browser) {
  const context = await browser.newContext({
    ...phoneProfiles[engine],
    reducedMotion: 'reduce',
  });
  const page = await context.newPage(),
    errors = [],
    nonReads = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('request', (r) => {
    if (r.method() !== 'GET' && r.method() !== 'HEAD') nonReads.push(r.method() + ' ' + r.url());
  });
  try {
    await page.goto(visit('/brand.html?from=bookmark'));
    assert.equal(new URL(page.url()).pathname, '/service-branding/');
    assert.equal(new URL(page.url()).searchParams.get('from'), 'bookmark');
    assert.equal(await page.locator('a[download]').count(), 0);
    for (const [interest, scenario, expected] of contexts) {
      const qp = new URLSearchParams({ interest, scenario });
      // Both previously distributed file addresses and the new canonical pages work.
      await page.goto(visit((scenario === 'Phone enquiry' ? '/contact.html?' : '/contact/?') + qp));
      await page.locator('[name=interest]').waitFor();
      assert.equal(await page.locator('[name=interest]').inputValue(), expected);
      assert.equal(await page.locator('[name=context]').inputValue(), scenario);
    }
    await page.goto(visit('/contact/?interest=unrecognised&scenario=unrecognised'));
    await page.locator('[name=interest]').waitFor();
    assert.equal(await page.locator('[name=interest]').inputValue(), 'Not sure yet');
    assert.equal(await page.locator('[name=context]').count(), 0);
    for (const role of ['sales', 'info', 'support', 'accounts'])
      assert((await page.locator('main a[href="mailto:' + role + '@clearsign.uk"]').count()) > 0);
    await page.getByRole('button', { name: 'Prepare my email' }).click();
    await page.waitForFunction(() => document.activeElement?.getAttribute('name') === 'name');
    assert.equal(await page.locator('[aria-invalid=true]').count(), 3);
    await page.locator('[name=name]').fill('Example & Co');
    await page.locator('[name=email]').fill('unknown');
    await page.locator('[name=message]').fill('  ');
    await page.getByRole('button', { name: 'Prepare my email' }).click();
    await page.waitForFunction(() => document.activeElement?.getAttribute('name') === 'email');
    assert.equal(await page.locator('[aria-invalid=true]').count(), 2);
    await page.locator('[name=business]').fill('Sample hire');
    await page.locator('[name=email]').fill('visitor@example.org');
    await page.locator('[name=interest]').selectOption('Admin & follow-up');
    const request = 'We lose Friday quotes & need follow-up.\nPlease show options <in writing>.';
    await page.locator('[name=message]').fill(request);
    await page.getByRole('button', { name: 'Prepare my email' }).click();
    await page.locator('#enquiry-result').waitFor();
    await page.waitForFunction(() => document.activeElement?.id === 'enquiry-result-heading');
    const mail = new URL(await page.locator('#send-enquiry-email').getAttribute('href'));
    assert.equal(mail.protocol, 'mailto:');
    assert.equal(mail.pathname, 'sales@clearsign.uk');
    assert.equal(mail.searchParams.get('subject'), 'ClearSign project enquiry – Admin & follow-up');
    for (const word of [request, 'visitor@example.org', 'Sample hire', 'Example & Co'])
      assert(mail.searchParams.get('body').includes(word));
    assert.equal(await page.locator('#enquiry-result writing').count(), 0);
    assert(!page.url().includes('visitor'));
    await page.getByRole('button', { name: 'Edit your details' }).click();
    assert.equal(await page.locator('[name=message]').inputValue(), request);
    await page.waitForFunction(() => document.activeElement?.getAttribute('name') === 'name');
    await page.goto(visit('/industries/#restaurants'));
    await page.locator('#restaurants a').filter({ hasText: 'Discuss my business' }).click();
    await page.waitForURL(/contact\//);
    assert.equal(await page.locator('[name=context]').inputValue(), 'Restaurants & takeaways');
    await page.goBack();
    await page.locator('#restaurants').waitFor();
    assert.equal(new URL(page.url()).hash, '#restaurants');
    await page.goto(visit('/'));
    await page
      .locator('#business-story')
      .getByRole('link', { name: 'Book a phone assistant demo' })
      .click();
    await page.waitForURL(/\/demo\//);
    await page.getByRole('button', { name: 'Add a time or firm name' }).click();
    await page.getByLabel('Your firm').fill('Sample & Co');
    await page.getByLabel('Preferred day and time').fill('Thursday after 10am');
    const demo = new URL(
      await page.getByRole('link', { name: 'Request demo by email' }).getAttribute('href')
    );
    assert.equal(demo.protocol, 'mailto:');
    assert.equal(demo.pathname, 'sales@clearsign.uk');
    assert.equal(demo.searchParams.get('subject'), 'Book a ClearSign phone assistant demo');
    assert(demo.searchParams.get('body').includes('Sample & Co'));
    assert(demo.searchParams.get('body').includes('Thursday after 10am'));
    assert(!page.url().includes('Sample'));
    await page.getByLabel('Preferred day and time').fill('');
    const flexible = new URL(await page.locator('#demo-email').getAttribute('href'));
    assert(flexible.searchParams.get('body').includes('which times are available'));
    assert(!flexible.searchParams.get('body').includes('Thursday'));
    for (const [sector, action, detail] of [
      ['accountancy', 'Book a demo for my practice', 'bookkeeping or payroll'],
      ['legal', 'Book a demo for my law firm', 'right solicitor'],
    ]) {
      await page.goto(visit('/industries/#' + sector));
      await page
        .locator('#' + sector)
        .getByRole('link', { name: action })
        .click();
      await page.waitForURL(
        (url) => url.pathname === '/demo/' && url.searchParams.get('sector') === sector
      );
      await page.locator('#demo-preferences button').waitFor();
      const tailored = new URL(await page.locator('#demo-email').getAttribute('href'));
      assert(tailored.searchParams.get('body').includes(detail));
      assert((await page.locator('.demo-request').innerText()).includes(detail));
    }
    await page.goto(visit('/industries/#legal'));
    await page.locator('#legal').getByRole('link', { name: 'Discuss my business' }).click();
    await page.waitForURL(/contact\//);
    assert.equal(await page.locator('[name=context]').inputValue(), 'Law firms');
    await page.locator('main').getByRole('link', { name: 'Book a phone assistant demo' }).click();
    await page.waitForURL(/\/demo\//);
    await page.goto(visit('/service-ai/'));
    await page.locator('.service-actions').getByRole('link', { name: 'Book a demo' }).click();
    await page.waitForURL(/\/demo\//);
    await page.goto(visit('/solutions/'));
    await page.getByRole('link', { name: 'Discuss a package' }).click();
    await page.waitForURL(/\/contact\//);
    assert.equal(await page.locator('[name=interest]').inputValue(), 'A package of services');
    await page.getByRole('link', { name: 'Start my enquiry' }).click();
    await page.waitForURL((url) => url.hash === '#project-enquiry');
    assert.equal(new URL(page.url()).searchParams.get('interest'), 'A package of services');
    assert.equal(await page.locator('[name=interest]').inputValue(), 'A package of services');
    await page.goto(visit('/service-branding/'));
    await page.getByRole('link', { name: 'Discuss this service' }).click();
    await page.waitForURL(/\/contact\//);
    assert.equal(await page.locator('[name=interest]').inputValue(), 'Branding');
    await page.goto(visit('/solutions/'));
    await page.locator('#ai a').click();
    await page.waitForURL(/service-ai\//);
    await page.getByRole('link', { name: 'Compare ways to run AI' }).click();
    await page.waitForURL((url) => url.pathname === '/service-ai/' && url.hash === '#running-ai');
    await page.getByRole('link', { name: 'Discuss private AI' }).click();
    await page.waitForURL(/\/contact\//);
    assert.equal(await page.locator('[name=context]').inputValue(), 'AI on our own equipment');
    assert.equal(
      await page.locator('[name=interest] option:checked').textContent(),
      'AI assistants & integration'
    );
    await page.goto(visit('/service-software/'));
    assert(
      await page
        .getByRole('heading', { name: 'Fleet management around your operation' })
        .isVisible()
    );
    await checkTimeEstimate(page);
    await checkPhoneJourney(page);
    const phoneScreens = await phoneHierarchy(page);
    const motion = await disclosureMotion(page);
    assert.deepEqual(errors, []);
    assert.deepEqual(nonReads, []);
    results.push({
      browser: engine,
      contexts: contexts.length,
      roleAddresses: 4,
      validation: true,
      emailDraft: true,
      edit: true,
      industryJourney: true,
      packageAndStandalone: true,
      timeEstimate: true,
      phoneChapterNavigation: true,
      privateAiJourney: true,
      demoRequest: true,
      phoneScreens,
      motion,
      noSubmissions: true,
    });
  } finally {
    await context.close();
    await browser.close();
  }
}
await checkEngine('Chrome', await chrome());
await checkEngine('WebKit', await safari());
await fs.writeFile(
  path.join(evidence, 'enquiry-checks.json'),
  JSON.stringify({ base: base.href, results }, null, 2) + '\n'
);
console.log(
  'Business, package, branding, private AI and demo enquiries, saved enquiry links, all four addresses, validation, editing and browser back passed in Chrome and WebKit.'
);
