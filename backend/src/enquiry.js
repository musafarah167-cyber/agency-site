// Pure logic: check a quote-form submission, spot bots, build the email text.
// No network and no files here, so it is easy to test.

export const INTERESTS = [
  "Blank NFC cards", "Custom NFC cards", "New website", "Website maintenance",
  "Video content", "Uniform design", "Van logo design",
  "Bronze package", "Silver package", "Gold package", "Not sure yet",
];

const MAX = { name: 100, contact: 150, message: 2000 };
// Hidden form field that real people never see. Bots fill it in.
export const HONEYPOT_FIELD = "website";

const clean = (v) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim() : "");

// Returns { spam: true } | { errors: {...} } | { ok: true, enquiry }
export function validateEnquiry(raw) {
  const body = raw && typeof raw === "object" ? raw : {};
  if (clean(body[HONEYPOT_FIELD]) !== "") return { spam: true };

  const enquiry = {
    name: clean(body.name),
    contact: clean(body.contact),
    interest: clean(body.interest) || "Not sure yet",
    message: clean(body.message),
  };
  const errors = {};
  if (!enquiry.name) errors.name = "Please enter your name.";
  else if (enquiry.name.length > MAX.name) errors.name = "Name is too long.";
  if (!enquiry.contact) errors.contact = "Please enter a phone number or email.";
  else if (enquiry.contact.length > MAX.contact) errors.contact = "Contact details are too long.";
  if (!INTERESTS.includes(enquiry.interest)) errors.interest = "Please pick one of the options.";
  if (enquiry.message.length > MAX.message) errors.message = "Message is too long (2000 characters max).";
  return Object.keys(errors).length ? { errors } : { ok: true, enquiry };
}

const looksLikeEmail = (s) => /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(s);

// Plain text only (no HTML), and the subject is fixed text, so visitor input cannot
// inject email headers or markup.
export function buildEmail(enquiry, { to, from }) {
  const lines = [
    "New quote enquiry from the website",
    "",
    `Name: ${enquiry.name}`,
    `Contact: ${enquiry.contact}`,
    `Interested in: ${enquiry.interest}`,
    `Details: ${enquiry.message || "(none)"}`,
  ];
  const email = { to, from, subject: "New website enquiry", text: lines.join("\n") };
  if (looksLikeEmail(enquiry.contact)) email.replyTo = enquiry.contact;
  return email;
}
