// Cloudflare Pages Function entry point: would answer POST /api/enquiry once deployed.
// NOT DEPLOYED. For now it is only used to prove the shape works.
import { handleEnquiry } from "../../src/handler.js";
import { dryRunSender, resendSender } from "../../src/senders.js";

export async function onRequest({ request, env }) {
  const live = env.EMAIL_MODE === "resend" && env.RESEND_API_KEY;
  // Cloudflare cannot write files, so dry-run just logs (outDir: null).
  const sender = live ? resendSender({ apiKey: env.RESEND_API_KEY }) : dryRunSender({ outDir: null });
  return handleEnquiry(request, {
    sender,
    to: env.ENQUIRY_TO_EMAIL || "owner@example.invalid",
    from: env.ENQUIRY_FROM_EMAIL || "enquiries@example.invalid",
  });
}
