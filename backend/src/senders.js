// A "sender" is any function that takes an email object and delivers it.
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Prototype default: sends NOTHING. Prints the email and saves it to a file.
export function dryRunSender({ outDir = "outbox", log = console.log } = {}) {
  return async (email) => {
    log(`[DRY RUN] would send email to ${email.to}:\n${email.text}\n`);
    if (outDir) {
      await mkdir(outDir, { recursive: true });
      await writeFile(join(outDir, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.txt`), JSON.stringify(email, null, 2));
    }
    return { dryRun: true };
  };
}

// Real sender for later (Resend's HTTP API). NOT used by the prototype and never
// called by the tests with a real fetch. Needs an account the owner opens first.
export function resendSender({ apiKey, fetchImpl = fetch }) {
  return async (email) => {
    const res = await fetchImpl("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: email.from, to: [email.to], subject: email.subject, text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
    });
    if (!res.ok) throw new Error(`Email service returned ${res.status}`);
    return { dryRun: false };
  };
}
