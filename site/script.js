// Business WhatsApp number in international format, digits only (no + or spaces).
const WHATSAPP_NUMBER = "447405535846";

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
    errorBox.textContent = "Please enter your name and a phone number or email.";
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
