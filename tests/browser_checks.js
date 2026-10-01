// Paste into the browser console (or run via the in-app browser) on the site at any width.
// Returns: sideways scroll, wide elements, small tap targets, menu behaviour, contrast, header overlap.
(() => {
  const de = document.documentElement, r = { vw: innerWidth };
  r.scrollW = de.scrollWidth; r.hscroll = de.scrollWidth > innerWidth;
  r.overflowing = [...document.querySelectorAll('body *')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.right > innerWidth + 1 && !e.closest('svg') && !e.closest('.hero'); }) // hero clips its own animated scenery; real sideways scroll is the hscroll test above.slice(0, 8).map(e => e.tagName + '.' + (e.getAttribute('class') || ''));
  r.tapUnder44 = [...document.querySelectorAll('a,button,summary,input,select,textarea')].filter(e => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height < 44 && !e.classList.contains('skip-link') && getComputedStyle(e).position !== 'absolute'; }).map(e => e.tagName + ' "' + (e.textContent || e.name).trim().slice(0, 28) + '" h=' + Math.round(e.getBoundingClientRect().height));
  const toggle = document.querySelector('.nav-toggle'), nav = document.getElementById('nav');
  if (getComputedStyle(toggle).display !== 'none') {
    toggle.click(); const open = getComputedStyle(nav).display;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const esc = getComputedStyle(nav).display, focus = document.activeElement === toggle;
    toggle.click(); nav.querySelector('a[href="#faq"]').click();
    r.menu = { open, afterEscape: esc, focusBack: focus, afterLinkClick: getComputedStyle(nav).display, expanded: toggle.getAttribute('aria-expanded') };
  } else r.menu = 'full nav shown (no menu button)';
  const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
  const L = c => .2126 * lin(c[0]) + .7152 * lin(c[1]) + .0722 * lin(c[2]);
  const bg = el => { while (el) { const c = getComputedStyle(el).backgroundColor, a = c.match(/[\d.]+/g); if (a && (a.length < 4 || +a[3] > .5)) return a.slice(0, 3).map(Number); el = el.parentElement; } return [255, 255, 255]; };
  const bad = {}; document.querySelectorAll('body *').forEach(el => {
    if (el.closest('svg')) return;
    const t = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' '); if (!t) return;
    const cs = getComputedStyle(el); if (cs.display === 'none' || !el.checkVisibility()) return;
    let op = 1, p = el; while (p) { const animated = p.getAnimations().some(a => (a.effect.getKeyframes ? a.effect.getKeyframes() : []).some(k => 'opacity' in k)); if (!animated) op *= +getComputedStyle(p).opacity; p = p.parentElement; } // fades that are animated are measured at full opacity
    const b = bg(el), f = cs.color.match(/[\d.]+/g).slice(0, 3).map(Number).map((v, i) => v * op + b[i] * (1 - op));
    const x = L(f), y = L(b), ratio = (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
    const sz = parseFloat(cs.fontSize), large = sz >= 24 || (sz >= 18.66 && +cs.fontWeight >= 700), need = large ? 3 : 4.5;
    if (ratio < need) bad[t.slice(0, 30)] = +ratio.toFixed(2) + ' (need ' + need + ')';
  });
  r.contrastFails = bad;
  const hb = document.querySelector('.site-header').getBoundingClientRect().bottom; r.focusHiddenUnderHeader = [];
  document.querySelectorAll('main a,main button,main summary,main input,main select,main textarea').forEach(el => { el.focus(); if (el.getBoundingClientRect().top < hb) r.focusHiddenUnderHeader.push(el.textContent.trim().slice(0, 20)); });
  document.activeElement.blur();
  const fl = document.querySelector('.float-wa').getBoundingClientRect(); r.floatBtn = Math.round(fl.width) + 'x' + Math.round(fl.height);
  const ctas = [...document.querySelectorAll('.hero .cta-row .btn')].map(b => Math.round(b.getBoundingClientRect().width)); r.heroButtonWidths = ctas;

  // --- added 2026-10-01: form invalid-field behaviour, images, skip link, FAQ count, services tiles ---
  (() => {
    const f = document.getElementById('quote-form'), err = document.getElementById('form-error');
    const opened = []; const orig = window.open; window.open = (u) => { opened.push(u); return null; };
    f.reset(); f.requestSubmit();
    r.formInvalid = { errorShown: !err.hidden, nameAriaInvalid: f.name.getAttribute('aria-invalid'), contactAriaInvalid: f.contact.getAttribute('aria-invalid'), focusOnFirstEmpty: document.activeElement === f.name, opened: opened.length };
    f.name.value = 'T'; f.requestSubmit();
    r.formInvalid.secondEmptyIsContact = document.activeElement === f.contact; r.formInvalid.nameClearedInvalid = f.name.getAttribute('aria-invalid');
    f.contact.value = '07700 900000'; f.requestSubmit(); r.formValid = { errorHidden: err.hidden, url: opened[0] && decodeURIComponent(opened[0]).slice(0, 160) };
    window.open = orig; f.reset(); f.name.removeAttribute('aria-invalid'); f.contact.removeAttribute('aria-invalid'); err.hidden = true;
    r.images = [...document.images].map(i => ({ src: i.getAttribute('src'), alt: i.hasAttribute('alt'), loaded: i.complete && i.naturalWidth > 0 }));
    r.faqCount = document.querySelectorAll('details').length;
    r.svcTiles = [...document.querySelectorAll('.svc-tile')].map(a => a.getAttribute('href') + ' ' + !!document.querySelector(a.getAttribute('href')));
    r.ctaHrefs = [...document.querySelectorAll('a[href^="tel:"],a[href*="wa.me"]')].map(a => a.getAttribute('href')).filter((v, i, a) => a.indexOf(v) === i);
    r.headingSkips = (() => { const h = [...document.querySelectorAll('h1,h2,h3')].map(x => +x.tagName[1]); const o = []; for (let i = 1; i < h.length; i++) if (h[i] - h[i - 1] > 1) o.push(i); return o; })();
  })();
  return r;
})()
