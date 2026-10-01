// Takes a web Request, returns a web Response. Works in Node 18+ and in Cloudflare
// Pages Functions, because both use the standard Request/Response objects.
import { validateEnquiry, buildEmail } from "./enquiry.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

const MAX_BODY_BYTES = 10_000;

export async function handleEnquiry(request, { sender, to, from }) {
  if (request.method !== "POST") return json({ error: "Use POST." }, 405);

  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return json({ error: "Request too large." }, 413);

  let body;
  try {
    const type = request.headers.get("content-type") || "";
    body = type.includes("application/json") ? JSON.parse(text) : Object.fromEntries(new URLSearchParams(text));
  } catch {
    return json({ error: "Could not read the form." }, 400);
  }

  const result = validateEnquiry(body);
  // Bots get the same "ok" answer as people but nothing is sent.
  if (result.spam) return json({ ok: true });
  if (result.errors) return json({ error: "Please check the form.", fields: result.errors }, 400);

  try {
    await sender(buildEmail(result.enquiry, { to, from }));
  } catch (err) {
    console.error("Email failed:", err.message); // never log the visitor's details
    return json({ error: "Sorry, we could not send that. Please use WhatsApp or phone." }, 502);
  }
  return json({ ok: true });
}
