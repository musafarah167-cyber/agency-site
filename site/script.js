// Business WhatsApp number in international format, digits only (no + or spaces).
const WHATSAPP_NUMBER = "447405535846";

// ---------------- Translations (English is written in the page; others live in i18n.js) ----------------
const LANGS = { en: "ltr", ar: "rtl", es: "ltr", fr: "ltr", ur: "rtl" };
let lang = "en";
// Text that contains numbers which may change (phone, prices) is matched by pattern, {n} is kept as is
const PATTERNS = [
  [/^Call ([\d ]+)$/, "Call {n}"],
  [/^Price: £(\d+) per card$/, "Price: £{n} per card"],
  [/^Plain \(£(\d+) each\)$/, "Plain (£{n} each)"],
  [/^Custom \(£(\d+) each\)$/, "Custom (£{n} each)"],
  [/^\+ £(\d+) a month$/, "+ £{n} a month"],
];
function t(en) {
  if (lang === "en" || typeof I18N === "undefined" || !I18N[lang]) return en;
  const dict = I18N[lang];
  if (dict[en]) return dict[en];
  for (const [re, key] of PATTERNS) {
    const m = en.match(re);
    // \u2066...\u2069 keeps numbers (e.g. the phone number) left-to-right inside Arabic and Urdu text
    if (m && dict[key]) return dict[key].replace("{n}", "\u2066" + m[1].trim() + "\u2069");
  }
  return en;
}
// Set text that the script changes later; remembers the English so it can be re-translated
function setT(el, en) { el.dataset.en = en; el.textContent = t(en); }
const originalText = new WeakMap();
const originalTitle = document.title;
const I18N_ATTRS = ["aria-label", "placeholder", "title", "alt"];
function applyLang(code) {
  lang = LANGS[code] ? code : "en";
  document.documentElement.lang = lang === "en" ? "en-GB" : lang;
  document.documentElement.dir = LANGS[lang];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const p = n.parentElement;
      if (!p || p.closest("script, style, #lang-select, [data-en]")) return NodeFilter.FILTER_REJECT;
      return n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  let node;
  while ((node = walker.nextNode())) {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue);
    const raw = originalText.get(node);
    const lead = raw.match(/^\s*/)[0], trail = raw.match(/\s*$/)[0];
    node.nodeValue = lead + t(raw.replace(/\s+/g, " ").trim()) + trail;
  }
  document.querySelectorAll(I18N_ATTRS.map((a) => `[${a}]`).join(",")).forEach((el) => {
    if (el.closest("#lang-select")) return;
    I18N_ATTRS.forEach((a) => {
      if (!el.hasAttribute(a)) return;
      const key = "i18n" + a.replace(/-./g, (x) => x[1].toUpperCase());
      if (!(key in el.dataset)) el.dataset[key] = el.getAttribute(a);
      el.setAttribute(a, t(el.dataset[key]));
    });
  });
  document.querySelectorAll("[data-en]").forEach((el) => { el.textContent = t(el.dataset.en); });
  document.title = t(originalTitle);
  const sel = document.getElementById("lang-select");
  if (sel) sel.value = lang;
}

document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("nav");
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// Escape closes the mobile menu and returns focus to the toggle
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("open")) {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  }
});

// Package/service buttons pre-select the enquiry dropdown
const form = document.getElementById("quote-form");
document.querySelectorAll("[data-interest]").forEach((el) => {
  el.addEventListener("click", () => {
    form.elements.interest.value = el.dataset.interest;
  });
});

// Quote form: checks the fields, then opens WhatsApp with the message filled in
const errorBox = document.getElementById("form-error");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const name = (d.get("name") || "").trim();
  const contact = (d.get("contact") || "").trim();
  // Mark empty required fields and move focus to the first one, so screen reader and keyboard users know what to fix
  const missing = [];
  ["name", "contact"].forEach((field) => {
    const input = form.elements[field];
    const empty = !(d.get(field) || "").trim();
    input.setAttribute("aria-invalid", empty ? "true" : "false");
    if (empty) missing.push(input);
  });
  if (missing.length) {
    setT(errorBox, "Please enter your name and a phone number or email.");
    errorBox.hidden = false;
    missing[0].focus();
    return;
  }
  errorBox.hidden = true;
  const text =
    `Hi, I'd like a quote.\nName: ${name}\nContact: ${contact}\n` +
    `Interested in: ${d.get("interest")}\n` +
    ((d.get("message") || "").trim() ? `Details: ${d.get("message").trim()}` : "");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});

// Respect "reduce motion": stop the hero SVG animation (CSS alone cannot pause SVG motion)
const signal = document.querySelector(".signal-bg");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
function applyMotionSetting() {
  if (!signal) return;
  if (reduceMotion.matches) signal.pauseAnimations(); else signal.unpauseAnimations();
}
applyMotionSetting();
reduceMotion.addEventListener("change", applyMotionSetting);

// Pause the hero animation while it is scrolled out of view (saves battery on phones)
const hero = document.querySelector(".hero");
if (hero && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    hero.classList.toggle("is-offscreen", !entry.isIntersecting);
    if (signal) {
      if (!entry.isIntersecting) signal.pauseAnimations();
      else applyMotionSetting();
    }
  }).observe(hero);
}

// Helper: fill the quote form and jump to it
function fillQuote(interest, message) {
  if (interest) form.elements.interest.value = interest;
  if (message !== undefined) form.elements.message.value = message;
}

// ---- NFC price calculator (prices from DECISIONS: plain £30, custom £50 per card)
const calcQty = document.getElementById("calc-qty");
const calcTotal = document.getElementById("calc-total");
const calcBulk = document.getElementById("calc-bulk");
const calcOrder = document.getElementById("calc-order");
function calcState() {
  const type = document.querySelector('input[name="calc-type"]:checked');
  let qty = parseInt(calcQty.value, 10);
  if (!Number.isFinite(qty) || qty < 1) qty = 1;
  if (qty > 999) qty = 999;
  return { price: Number(type.value), label: type.dataset.label, qty };
}
function updateCalc() {
  const { price, qty } = calcState();
  calcTotal.textContent = "£" + (price * qty).toLocaleString("en-GB");
  calcBulk.hidden = qty < 10;
}
if (calcQty) {
  document.querySelectorAll('input[name="calc-type"]').forEach((r) => r.addEventListener("change", updateCalc));
  calcQty.addEventListener("input", () => { if (Number(calcQty.value) > 999) calcQty.value = 999; updateCalc(); });
  calcQty.addEventListener("blur", () => { calcQty.value = calcState().qty; updateCalc(); });
  document.querySelectorAll("#nfc-calc .step").forEach((b) => b.addEventListener("click", () => {
    calcQty.value = Math.min(999, Math.max(1, calcState().qty + Number(b.dataset.step)));
    updateCalc();
  }));
  calcOrder.addEventListener("click", () => {
    const { price, label, qty } = calcState();
    fillQuote(label === "custom" ? "Custom NFC cards" : "Blank NFC cards",
      `I'd like ${qty} ${label} NFC card${qty > 1 ? "s" : ""} (£${(price * qty).toLocaleString("en-GB")} at £${price} each).`);
  });
  updateCalc();
}

// ---- "Try it" NFC demo
const demoTap = document.getElementById("demo-tap");
const demoStage = document.querySelector(".demo-stage");
const demoStatus = document.getElementById("demo-status");
if (demoTap) {
  demoTap.addEventListener("click", () => {
    const on = !demoStage.classList.contains("tapped");
    demoStage.classList.toggle("tapped", on);
    setT(demoStatus, on
      ? "The phone opened the business's own website, with call, WhatsApp and review buttons one tap away. Press the card again to reset."
      : "Example for a made-up business. Press the card to try it.");
  });
}

// ---- Package finder
const finder = document.querySelector(".finder-card");
const results = {
  bronze: { name: "Bronze", price: "£499 one-off", why: "A professional website and 4 plain NFC cards. Ideal if you just need to get online.", interest: "Bronze package" },
  silver: { name: "Silver", price: "£499 set-up + £175 a month (6\u2011month minimum)", why: "Everything in Bronze, plus we look after your website every month and reply to your messages within 24 hours.", interest: "Silver package" },
  gold: { name: "Gold", price: "£699 set-up + £300 a month (6\u2011month minimum)", why: "Everything in Silver, plus 2 videos a month and 5 custom NFC cards. Filming travel is charged at 80p per mile, there and back.", interest: "Gold package" },
  nfc: { name: "NFC cards on their own", price: "£30 plain or £50 custom, per card", why: "No package needed. Use the price calculator to see your total and order.", interest: null, href: "#nfc-calc", cta: "Open the price calculator" },
  video: { name: "Videos on their own", price: "Quoted per job", why: "Every filming job is different (location and filming time), so we give you a free quote. Travel is charged at 80p per mile, there and back.", interest: "Video content" },
  design: { name: "Van or uniform design", price: "Quoted per job", why: "Designed by us, printed (and fitted for vans) for you. Price depends on the size and design.", interest: "Van logo design" },
};
if (finder) {
  const steps = finder.querySelectorAll(".finder-step");
  const resultBox = finder.querySelector(".finder-result");
  let chosen = null;
  const show = (n) => {
    steps.forEach((s) => { s.hidden = s.dataset.step !== String(n); });
    resultBox.hidden = true;
    const first = finder.querySelector(`.finder-step[data-step="${n}"] .finder-opt`);
    if (first) first.focus();
  };
  finder.addEventListener("click", (e) => {
    const opt = e.target.closest(".finder-opt");
    if (opt && opt.dataset.next) return show(opt.dataset.next);
    if (opt && opt.dataset.result) {
      chosen = results[opt.dataset.result];
      steps.forEach((s) => { s.hidden = true; });
      setT(resultBox.querySelector(".finder-name"), chosen.name);
      setT(resultBox.querySelector(".finder-price"), chosen.price);
      setT(resultBox.querySelector(".finder-why"), chosen.why);
      const go = resultBox.querySelector(".finder-go");
      go.setAttribute("href", chosen.href || "#contact");
      setT(go, chosen.cta || "Get a quote");
      resultBox.hidden = false;
      resultBox.querySelector(".finder-name").setAttribute("tabindex", "-1");
      resultBox.querySelector(".finder-name").focus();
      return;
    }
    if (e.target.closest(".finder-restart")) return show(1);
    const back = e.target.closest(".finder-back");
    if (back) return show(back.dataset.back);
    if (e.target.closest(".finder-go") && chosen && chosen.interest) fillQuote(chosen.interest);
  });
}

// Header slims and gets a shadow once the page is scrolled
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Gentle fade-up as sections scroll into view (skipped for reduce-motion users)
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const revealEls = document.querySelectorAll(".section > .container, .services-strip .svc-grid");
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-visible"); revealObs.unobserve(en.target); }
    });
  }, { rootMargin: "0px", threshold: 0 });
  revealEls.forEach((el) => {
    // anything already on screen at load stays visible straight away
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add("reveal");
    revealObs.observe(el);
  });
}

// Pause the illustrations' animations while they are off screen (saves battery)
if ("IntersectionObserver" in window) {
  const illusObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => en.target.classList.toggle("is-offscreen", !en.isIntersecting));
  });
  document.querySelectorAll(".illus").forEach((el) => illusObs.observe(el));
}

// Language menu: read ?lang= from the address, switch instantly, keep the choice in the address (no cookies)
const langSelect = document.getElementById("lang-select");
const startLang = new URLSearchParams(location.search).get("lang");
if (startLang && LANGS[startLang] && startLang !== "en") applyLang(startLang);
if (langSelect) {
  langSelect.value = lang;
  langSelect.addEventListener("change", () => {
    applyLang(langSelect.value);
    const url = new URL(location.href);
    if (lang === "en") url.searchParams.delete("lang"); else url.searchParams.set("lang", lang);
    history.replaceState(null, "", url);
  });
}
