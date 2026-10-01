// Tiny local server for trying the prototype. Listens on this computer only.
// Run: npm start   (or: node server.js)   Then see README.md.
import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { handleEnquiry } from "./src/handler.js";
import { dryRunSender } from "./src/senders.js";

// Read .env if you made one (simple KEY=value lines). Never printed.
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const PORT = Number(process.env.PORT) || 8787;
// The prototype only ever does a dry run, whatever EMAIL_MODE says.
const sender = dryRunSender();

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/api/enquiry") { res.writeHead(404).end("Not found"); return; }
  const chunks = [];
  let size = 0;
  for await (const c of req) { size += c.length; if (size > 20_000) { res.writeHead(413).end(); return; } chunks.push(c); }
  const request = new Request(url, { method: req.method, headers: req.headers, body: ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks) });
  const response = await handleEnquiry(request, {
    sender,
    to: process.env.ENQUIRY_TO_EMAIL || "owner@example.invalid",
    from: process.env.ENQUIRY_FROM_EMAIL || "enquiries@example.invalid",
  });
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
}).listen(PORT, "127.0.0.1", () => console.log(`Local prototype on http://127.0.0.1:${PORT}/api/enquiry (DRY RUN, nothing is emailed)`));
