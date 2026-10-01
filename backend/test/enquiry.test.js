import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry, buildEmail } from "../src/enquiry.js";
import { handleEnquiry } from "../src/handler.js";
import { resendSender } from "../src/senders.js";

const good = { name: "Sam Plumber", contact: "sam@example.com", interest: "New website", message: "Need a site" };
const post = (body, type = "application/json") =>
  new Request("http://x/api/enquiry", { method: "POST", headers: { "content-type": type }, body: typeof body === "string" ? body : JSON.stringify(body) });
const fake = () => { const sent = []; return { sent, sender: async (e) => { sent.push(e); } }; };
const opts = (sender) => ({ sender, to: "to@example.invalid", from: "from@example.invalid" });

test("valid enquiry passes and is trimmed", () => {
  const r = validateEnquiry({ ...good, name: "  Sam  " });
  assert.equal(r.ok, true);
  assert.equal(r.enquiry.name, "Sam");
});
test("missing name and contact are rejected", () => {
  const r = validateEnquiry({ interest: "New website" });
  assert.ok(r.errors.name && r.errors.contact);
});
test("unknown interest is rejected", () => assert.ok(validateEnquiry({ ...good, interest: "Free car" }).errors.interest));
test("too-long message is rejected", () => assert.ok(validateEnquiry({ ...good, message: "a".repeat(2001) }).errors.message));
test("non-object input does not crash", () => assert.ok(validateEnquiry(null).errors));
test("honeypot filled = spam", () => assert.equal(validateEnquiry({ ...good, website: "http://spam" }).spam, true));
test("email is plain text with fixed subject; replyTo only for real emails", () => {
  const e = buildEmail({ ...good, name: "A\r\nBcc: x@y.z" }, { to: "t", from: "f" });
  assert.equal(e.subject, "New website enquiry");
  assert.equal(e.replyTo, "sam@example.com");
  assert.equal(buildEmail({ ...good, contact: "07700 900000" }, { to: "t", from: "f" }).replyTo, undefined);
  assert.equal(buildEmail({ ...good, contact: "a@b.c\nBcc: x@y.z" }, { to: "t", from: "f" }).replyTo, undefined);
});
test("handler: valid JSON sends one email", async () => {
  const f = fake();
  const res = await handleEnquiry(post(good), opts(f.sender));
  assert.equal(res.status, 200);
  assert.equal(f.sent.length, 1);
  assert.match(f.sent[0].text, /Sam Plumber/);
});
test("handler: form-encoded body works", async () => {
  const f = fake();
  const res = await handleEnquiry(post(new URLSearchParams(good).toString(), "application/x-www-form-urlencoded"), opts(f.sender));
  assert.equal(res.status, 200);
  assert.equal(f.sent.length, 1);
});
test("handler: honeypot returns ok but sends nothing", async () => {
  const f = fake();
  const res = await handleEnquiry(post({ ...good, website: "x" }), opts(f.sender));
  assert.equal(res.status, 200);
  assert.equal(f.sent.length, 0);
});
test("handler: invalid input gives 400 and sends nothing", async () => {
  const f = fake();
  const res = await handleEnquiry(post({ name: "" }), opts(f.sender));
  assert.equal(res.status, 400);
  assert.equal(f.sent.length, 0);
});
test("handler: GET is refused, bad JSON is 400, huge body is 413", async () => {
  const f = fake();
  assert.equal((await handleEnquiry(new Request("http://x/", { method: "GET" }), opts(f.sender))).status, 405);
  assert.equal((await handleEnquiry(post("{nope"), opts(f.sender))).status, 400);
  assert.equal((await handleEnquiry(post("a".repeat(11000)), opts(f.sender))).status, 413);
});
test("handler: sender failure gives 502 with a friendly message and no details", async () => {
  const res = await handleEnquiry(post(good), opts(async () => { throw new Error("boom"); }));
  assert.equal(res.status, 502);
  assert.doesNotMatch(await res.text(), /Sam|boom/);
});
test("resend sender builds the right request (fake fetch, nothing real sent)", async () => {
  let call;
  const s = resendSender({ apiKey: "test-key", fetchImpl: async (u, o) => { call = { u, o }; return { ok: true }; } });
  await s({ to: "t@example.invalid", from: "f@example.invalid", subject: "S", text: "T", replyTo: "r@example.com" });
  assert.equal(call.u, "https://api.resend.com/emails");
  assert.equal(JSON.parse(call.o.body).reply_to, "r@example.com");
});
