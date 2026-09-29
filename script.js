// Business WhatsApp number in international format, digits only (no + or spaces).
// [CLIENT: replace with the real number]
const WHATSAPP_NUMBER = "44XXXXXXXXXX";

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
  if (!name || !contact) {
    errorBox.textContent = "Please enter your name and a phone number or email.";
    errorBox.hidden = false;
    return;
  }
  errorBox.hidden = true;
  const text =
    `Hi, I'd like a quote.\nName: ${name}\nContact: ${contact}\n` +
    `Interested in: ${d.get("interest")}\n` +
    ((d.get("message") || "").trim() ? `Details: ${d.get("message").trim()}` : "");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
});
