#!/usr/bin/env python3
"""Full browser check for the Clear Signs site (needs Google Chrome; no installs).

    python3 tests/full_browser_check.py [--no-shots]

Serves site/, opens it in headless Chrome at 375 / 768 / 1280 px and checks: sideways scroll, console
errors, contrast, tap targets, menu, quote form, NFC calculator, "try it" demo, package finder, a real
keyboard-only walkthrough, reduced motion (hero must have 0 running animations), pause when the hero is off
screen, frame timing, and every price on the page. Screenshots go to docs/testing/screenshots-<date>-c/.
Prints PASS / FAIL / NOTE per check. Exit code 1 if anything FAILs.
"""
import functools
import http.server
import json
import re
import sys
import threading
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from cdp import Chrome  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "docs" / "testing" / "screenshots-2026-10-01-c"
NO_SHOTS = "--no-shots" in sys.argv
WIDTHS = (375, 768, 1280)
ALLOWED_PRICES = {"£30", "£50", "£499", "£175", "£699", "£300"}
results = []


def check(status, name, detail=""):
    results.append((status, name, detail))
    print(f"{status:4}  {name}  {detail}", flush=True)


def ok(cond, name, detail=""):
    check("PASS" if cond else "FAIL", name, "" if cond else detail)
    return cond


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def shot(c, name, selector=None, pad=8):
    if NO_SHOTS:
        return
    SHOTS.mkdir(parents=True, exist_ok=True)
    c.shot(str(SHOTS / f"{name}.png"), selector, pad)


FOCUS_INFO = """(()=>{const e=document.activeElement;if(!e||e===document.body)return {tag:'BODY'};const cs=getComputedStyle(e);
 const b=e.getBoundingClientRect();const hb=document.querySelector('.site-header').getBoundingClientRect().bottom;
 return {tag:e.tagName,id:e.id||'',cls:e.className&&e.className.baseVal===undefined?e.className:'',text:(e.getAttribute('aria-label')||e.textContent||e.name||'').trim().replace(/\\s+/g,' ').slice(0,40),
 outline:cs.outlineStyle+' '+cs.outlineWidth,shadow:cs.boxShadow!=='none',
 visible:(cs.outlineStyle!=='none'&&parseFloat(cs.outlineWidth)>=2)||cs.boxShadow!=='none',
 underHeader:(b.top<hb-1&&b.bottom>0)&&getComputedStyle(e.closest('.site-header')||document.body).position!=='sticky'&&!e.closest('.site-header'),
 offscreen:b.bottom<0||b.top>innerHeight}})()"""


def active(c):
    return c.js(FOCUS_INFO)


def tab_until(c, predicate_js, limit=120, shift=False):
    """Press Tab until document.activeElement satisfies the JS predicate. Returns stops visited."""
    stops = []
    for _ in range(limit):
        c.key("Tab", shift=shift)
        stops.append(active(c))
        if c.js(f"(()=>{{const e=document.activeElement;return !!({predicate_js})}})()"):
            return stops
    return None


def main():
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT / "site")))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_address[1]}/"
    c = Chrome()
    checks_js = (ROOT / "tests" / "browser_checks.js").read_text()
    try:
        for w in WIDTHS:
            print(f"\n--- {w}px ---")
            c.errors.clear()
            c.open(base, w, 900 if w > 400 else 812)
            c.pump(1.0)
            if not NO_SHOTS:
                SHOTS.mkdir(parents=True, exist_ok=True)
                c.shot(str(SHOTS / f"{w}-hero-1s.png"))
                c.pump(2.0)
                c.shot(str(SHOTS / f"{w}-hero-3s.png"))
            else:
                c.pump(2.0)

            # ---- screenshots of every new section / state
            shot(c, f"{w}-whatwedo", ".services-strip")
            shot(c, f"{w}-nfc-tools-start", ".nfc-tools")
            c.js("document.querySelector('#nfc-calc input[value=\"50\"]').click(); const q=document.getElementById('calc-qty'); q.value=12; q.dispatchEvent(new Event('input',{bubbles:true}));")
            c.js("document.getElementById('demo-tap').click()")
            c.pump(0.9)
            shot(c, f"{w}-nfc-tools-used", ".nfc-tools")
            c.js("document.getElementById('demo-tap').click(); document.querySelector('#nfc-calc input[value=\"30\"]').click(); document.getElementById('calc-qty').value=1; document.getElementById('calc-qty').dispatchEvent(new Event('input',{bubbles:true}))")

            shot(c, f"{w}-finder-1-start", "#package-finder")
            c.js("document.querySelector('.finder-opt[data-next=\"2\"]').click()")
            shot(c, f"{w}-finder-2-maintenance", "#package-finder")
            c.js("document.querySelector('.finder-step[data-step=\"2\"] .finder-opt[data-next=\"3\"]').click()")
            shot(c, f"{w}-finder-3-videos", "#package-finder")
            finder_text = {}
            paths = {
                "gold": ["[data-next='2']", "[data-step='2'] [data-next='3']", "[data-result='gold']"],
                "silver": ["[data-next='2']", "[data-step='2'] [data-next='3']", "[data-result='silver']"],
                "bronze": ["[data-next='2']", "[data-result='bronze']"],
                "nfc": ["[data-result='nfc']"], "video": ["[data-result='video']"], "design": ["[data-result='design']"],
            }
            for name, clicks in paths.items():
                c.js("document.querySelector('.finder-restart').click()") if c.js("!document.querySelector('.finder-result').hidden") else None
                for sel in clicks:
                    c.js("document.querySelector(" + json.dumps(".finder-card " + sel) + ").click()")
                finder_text[name] = c.js("[...document.querySelectorAll('.finder-name,.finder-price,.finder-why')].map(e=>e.textContent).join(' | ')")
                shot(c, f"{w}-finder-result-{name}", "#package-finder")
            c.js("document.querySelector('.finder-restart').click()")
            shot(c, f"{w}-packages", "#packages")
            c.js("document.querySelectorAll('#faq details').forEach(d=>d.open=true)")
            shot(c, f"{w}-faq-open", "#faq")
            c.js("document.querySelectorAll('#faq details').forEach(d=>d.open=false)")
            shot(c, f"{w}-contact", "#contact")
            shot(c, f"{w}-footer", ".site-footer")
            if w == 1280:
                for k, v in finder_text.items():
                    prices = set(re.findall(r"£\d+(?:,\d{3})*", v))
                    ok(prices <= ALLOWED_PRICES, f"finder result '{k}' prices allowed", f"{sorted(prices)}: {v[:120]}")
                check("NOTE", "finder result texts", json.dumps(finder_text, ensure_ascii=False)[:900])

            # ---- measured checks (fresh load so nothing above affects them)
            c.errors.clear()
            c.open(base, w, 900 if w > 400 else 812)
            c.pump(1.5)
            r = c.js(checks_js)
            c.js("document.getElementById('demo-tap').click()")  # contrast again with the demo phone screen showing
            c.pump(1.0)
            r2 = c.js(checks_js)
            r["contrastFails"].update(r2["contrastFails"])
            ok(not r["hscroll"], f"{w}px no sideways scroll", f"scrollWidth {r['scrollW']}")
            ok(not r["overflowing"], f"{w}px no element wider than screen", str(r["overflowing"]))
            ok(not r["contrastFails"], f"{w}px text contrast (AA)", str(r["contrastFails"]))
            if w < 1000:
                ok(not r["tapUnder44"], f"{w}px tap targets at least 44px", str(r["tapUnder44"]))
            ok(not r["focusHiddenUnderHeader"], f"{w}px focus not hidden under header", str(r["focusHiddenUnderHeader"]))
            ok(not r["headingSkips"], f"{w}px no skipped heading levels", str(r["headingSkips"]))
            if w <= 820:
                m = r["menu"]
                ok(m["open"] == "flex" and m["afterEscape"] == "none" and m["focusBack"] and m["afterLinkClick"] == "none" and m["expanded"] == "false",
                   f"{w}px menu opens, Escape closes (focus returns), link click closes", str(m))
            fi = r["formInvalid"]
            ok(fi["errorShown"] and fi["nameAriaInvalid"] == "true" and fi["contactAriaInvalid"] == "true" and fi["focusOnFirstEmpty"] and fi["opened"] == 0 and fi["secondEmptyIsContact"],
               f"{w}px quote form: empty submit marks fields, focuses first, sends nothing", str(fi))
            ok("wa.me/447405535846?text=" in (r["formValid"]["url"] or ""), f"{w}px quote form: valid submit builds WhatsApp link", str(r["formValid"]))
            ok(r["ctaHrefs"] == ["tel:+447405535846", "https://wa.me/447405535846"] or set(r["ctaHrefs"]) == {"tel:+447405535846", "https://wa.me/447405535846"},
               f"{w}px only the right phone/WhatsApp numbers", str(r["ctaHrefs"]))
            ok(all(t.endswith("true") for t in r["svcTiles"]), f"{w}px 'What we do' tiles link to real sections", str(r["svcTiles"]))
            ok(not c.errors, f"{w}px console errors / failed requests", str(c.errors[:5]))

            # ---- 404 page
            c.errors.clear()
            c.open(base + "404.html", w, 900 if w > 400 else 812)
            c.pump(0.5)
            shot(c, f"{w}-404", pad=0) if not NO_SHOTS else None
            ok(c.js("document.querySelectorAll('h1').length===1 && !!document.querySelector('a[href=\"./\"]')"), f"{w}px 404 page has h1 and a way home")
            ok(c.js("document.documentElement.scrollWidth<=innerWidth"), f"{w}px 404 page no sideways scroll")
            ok(not c.errors, f"{w}px 404 console errors", str(c.errors[:3]))

        # ---------------- calculator behaviour (1280)
        print("\n--- NFC calculator ---")
        c.open(base, 1280, 900)
        cases = [("30", "1", "£30", False, "1"), ("30", "9", "£270", False, "9"), ("30", "10", "£300", True, "10"), ("50", "10", "£500", True, "10"),
                 ("50", "999", "£49,950", True, "999"), ("30", "1000", "£29,970", True, "999"), ("30", "0", "£30", False, "1"),
                 ("30", "-5", "£30", False, "1"), ("50", "", "£50", False, "1"), ("30", "2.5", "£60", False, "2")]
        for typ, qty, total, bulk, after in cases:
            got = c.js(f"""(()=>{{document.querySelector('#nfc-calc input[value="{typ}"]').click();const q=document.getElementById('calc-qty');
              q.value={json.dumps(qty)};q.dispatchEvent(new Event('input',{{bubbles:true}}));const t=document.getElementById('calc-total').textContent;const b=!document.getElementById('calc-bulk').hidden;
              q.dispatchEvent(new Event('blur'));return [t,b,q.value]}})()""")
            ok(got[0] == total and got[1] == bulk and got[2] == after, f"calculator £{typ} x '{qty}' -> {total}, bulk={bulk}, field after leaving={after}", f"got {got}")
        got = c.js("""(()=>{document.querySelector('#nfc-calc input[value="50"]').click();const q=document.getElementById('calc-qty');q.value=12;q.dispatchEvent(new Event('input',{bubbles:true}));
          document.getElementById('calc-order').click();const f=document.getElementById('quote-form');return [f.elements.interest.value,f.elements.message.value]})()""")
        ok(got[0] == "Custom NFC cards" and "12 custom NFC cards (£600 at £50 each)" in got[1], "calculator 'Order these cards' fills the quote form", str(got))
        got = c.js("""(()=>{const q=document.getElementById('calc-qty');q.value=1;q.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#nfc-calc .step[data-step="-1"]').click();const a=q.value;
          q.value=999;q.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#nfc-calc .step[data-step="1"]').click();return [a,q.value]})()""")
        ok(got == ["1", "999"], "calculator stepper stops at 1 and 999", str(got))

        # ---------------- keyboard-only walkthroughs
        print("\n--- keyboard-only ---")
        for w in (1280, 375):
            c.errors.clear()
            c.open(base, w, 900 if w > 400 else 812)
            c.pump(0.5)
            stops = []
            for _ in range(160):
                c.key("Tab")
                a = active(c)
                stops.append(a)
                if len(stops) > 3 and a.get("text") == "Skip to content":
                    break
            names = [s.get("text") or s.get("tag") for s in stops]
            ok(stops[0]["text"] == "Skip to content", f"{w}px keyboard: first Tab stop is 'Skip to content'", stops[0]["text"])
            ok(all(s.get("visible") for s in stops if s["tag"] != "BODY"), f"{w}px keyboard: every stop shows a visible focus ring",
               str([s["text"] for s in stops if s["tag"] != "BODY" and not s.get("visible")][:6]))
            ok(not any(s.get("offscreen") for s in stops[:-1]), f"{w}px keyboard: no stop is left off-screen", str([s["text"] for s in stops if s.get("offscreen")][:5]))
            ok(not any(s["tag"] == "BODY" for s in stops[:-2]),  # the last stop before the wrap-around is the browser itself
                f"{w}px keyboard: focus never falls back to the page body while tabbing", str([(i, names[i - 1] if i else '', names[i + 1] if i + 1 < len(names) else '') for i, s_ in enumerate(stops[:-1]) if s_["tag"] == "BODY"]))
            check("NOTE", f"{w}px keyboard: {len(stops) - 1} Tab stops in a full lap", " > ".join(names[:200])[:1200])

            # skip link
            c.open(base, w, 900 if w > 400 else 812)
            c.key("Tab")
            c.key("Enter")
            ok(c.js("location.hash==='#top' && document.activeElement.id==='top'"), f"{w}px keyboard: skip link moves focus to main content", c.js("location.hash+' '+document.activeElement.tagName"))

            # package finder, keyboard only
            c.open(base, w, 900 if w > 400 else 812)
            s = tab_until(c, "e.classList.contains('finder-opt')", 140)
            if ok(s is not None, f"{w}px finder: reachable with Tab", "not reached in 140 presses"):
                a0 = active(c)["text"]
                c.key("Enter")
                a1 = active(c)
                ok(c.js("!document.querySelector('.finder-step[data-step=\"2\"]').hidden") and "look after" in a1["text"].lower(), f"{w}px finder: Enter on '{a0}' opens question 2 and focus moves into it", str(a1))
                c.key("Enter")
                a2 = active(c)
                ok(c.js("!document.querySelector('.finder-step[data-step=\"3\"]').hidden") and "include videos" in a2["text"].lower(), f"{w}px finder: Enter opens question 3 and focus moves into it", str(a2))
                c.key("Tab")
                c.key("Space")
                a3 = active(c)
                ok(c.js("!document.querySelector('.finder-result').hidden && document.querySelector('.finder-name').textContent==='Silver'") and a3["tag"] == "H3",
                   f"{w}px finder: Space on 'No, just the website' shows Silver and focus goes to the result heading", str(a3))
                c.key("Tab")
                ok("get a quote" in active(c)["text"].lower(), f"{w}px finder: next Tab stop is 'Get a quote'", active(c)["text"])
                c.key("Enter")
                c.pump(0.4)
                ok(c.js("location.hash==='#contact' && document.getElementById('quote-form').elements.interest.value==='Silver package'"),
                   f"{w}px finder: Enter on 'Get a quote' jumps to the form with 'Silver package' selected", c.js("location.hash+' '+document.getElementById('quote-form').elements.interest.value"))
                # restart from the keyboard
                c.js("document.querySelector('.finder-restart').focus()")
                c.key("Enter")
                a4 = active(c)
                ok(a4["tag"] != "BODY" and c.js("!document.querySelector('.finder-step[data-step=\"1\"]').hidden"), f"{w}px finder: after 'Start again' via keyboard, focus stays in the finder (not lost)",
                   f"focus is on {a4['tag']}: keyboard and screen reader users lose their place")

            # calculator, keyboard only
            c.open(base, w, 900 if w > 400 else 812)
            s = tab_until(c, "e.name==='calc-type'", 140)
            if ok(s is not None, f"{w}px calculator: reachable with Tab"):
                c.key("ArrowDown")
                ok(c.js("document.getElementById('calc-total').textContent")=="£50", f"{w}px calculator: arrow key switches to Custom (£50)", c.js("document.getElementById('calc-total').textContent"))
                c.key("Tab")
                ok("fewer" in active(c)["text"].lower(), f"{w}px calculator: Tab goes to the minus button", active(c)["text"])
                c.key("Tab")
                ok(active(c)["id"] == "calc-qty", f"{w}px calculator: Tab goes to the quantity box", active(c)["text"])
                c.type("12")
                got = c.js("[document.getElementById('calc-qty').value, document.getElementById('calc-total').textContent, !document.getElementById('calc-bulk').hidden]")
                ok(got[1] == "£600" and got[2], f"{w}px calculator: typing 12 gives £600 and the bulk note (box shows '{got[0]}')", str(got))
                c.key("Tab")
                ok("more" in active(c)["text"].lower(), f"{w}px calculator: Tab goes to the plus button", active(c)["text"])
                c.key("Enter")
                ok(c.js("document.getElementById('calc-total').textContent") == "£650", f"{w}px calculator: Enter on plus adds one card (£650)", c.js("document.getElementById('calc-total').textContent"))
                c.key("Tab")
                ok("order these" in active(c)["text"].lower(), f"{w}px calculator: next stop is 'Order these cards'", active(c)["text"])
                c.key("Enter")
                c.pump(0.4)
                got = c.js("[location.hash, document.getElementById('quote-form').elements.interest.value, document.getElementById('quote-form').elements.message.value]")
                ok(got[0] == "#contact" and got[1] == "Custom NFC cards" and "13 custom NFC cards (£650 at £50 each)" in got[2], f"{w}px calculator: Enter on order fills the form", str(got))

            # demo, keyboard only
            c.open(base, w, 900 if w > 400 else 812)
            s = tab_until(c, "e.id==='demo-tap'", 140)
            if ok(s is not None, f"{w}px demo: card button reachable with Tab"):
                ok(active(c)["visible"], f"{w}px demo: card button shows a focus ring")
                c.key("Enter")
                st = c.js("[document.querySelector('.demo-stage').classList.contains('tapped'), document.getElementById('demo-status').textContent]")
                ok(st[0] and "opened" in st[1], f"{w}px demo: Enter 'taps' the card and the status text updates", str(st))
                c.key("Space")
                st = c.js("[document.querySelector('.demo-stage').classList.contains('tapped'), document.getElementById('demo-status').textContent]")
                ok(not st[0], f"{w}px demo: Space resets it", str(st))
                ok(c.js("[...document.querySelectorAll('.demo-phone a,.demo-phone button,.demo-phone input')].length===0"), f"{w}px demo: the fake phone screen has no tab stops")

            # menu with keyboard on phone
            if w == 375:
                c.open(base, w, 812)
                c.key("Tab"); c.key("Tab"); c.key("Tab")
                ok(c.js("document.activeElement.classList.contains('nav-toggle')"), "375px keyboard: third Tab stop is the Menu button", active(c)["text"])
                c.key("Enter")
                ok(c.js("document.getElementById('nav').classList.contains('open')"), "375px keyboard: Enter opens the menu")
                c.key("Tab")
                ok(active(c)["text"] == "NFC Cards", "375px keyboard: Tab moves into the menu links", active(c)["text"])
                c.key("Escape")
                ok(c.js("!document.getElementById('nav').classList.contains('open') && document.activeElement.classList.contains('nav-toggle')"), "375px keyboard: Escape closes the menu and returns focus to Menu")
            ok(not c.errors, f"{w}px keyboard walkthrough console errors", str(c.errors[:3]))

        # ---------------- reduced motion
        print("\n--- reduced motion / performance ---")
        HERO_ANIMS = "document.getAnimations().filter(a=>a.playState==='running'&&a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('.hero')).length"
        for w in WIDTHS:
            c.open(base, w, 900 if w > 400 else 812)
            c.pump(1.5)
            normal = c.js(HERO_ANIMS)
            c.open(base, w, 900 if w > 400 else 812, reduce_motion=True)
            c.pump(1.5)
            hero = c.js(HERO_ANIMS)
            smil = c.js("[...document.querySelectorAll('svg')].map(s=>s.animationsPaused()).every(Boolean) && document.querySelectorAll('svg animate,svg animateMotion,svg animateTransform').length")
            page_total = c.js("document.getAnimations().filter(a=>a.playState==='running').length")
            ok(hero == 0, f"{w}px reduce motion: hero has 0 running animations (normal mode: {normal})", f"{hero} still running")
            ok(smil in (0, True) or smil is not False, f"{w}px reduce motion: SVG (SMIL) animations paused/none", str(smil))
            check("NOTE", f"{w}px reduce motion: running animations on the whole page", str(page_total))
        c.open(base, 1280, 900, reduce_motion=True)
        c.pump(1)
        c.js("document.getElementById('demo-tap').click()")
        c.pump(1.2)
        ok(c.js("document.querySelector('.demo-stage').classList.contains('tapped')"), "reduce motion: the demo still works (shows the result without animation)")
        c.errors.clear()

        for w in (1280, 375):
            c.open(base, w, 900 if w > 400 else 812)
            c.pump(1.5)
            c.js("window.scrollTo(0, 3000)")
            c.pump(0.8)
            off = c.js("[document.querySelector('.hero').classList.contains('is-offscreen')," + HERO_ANIMS + "]")
            ok(off[0] and off[1] == 0, f"{w}px hero animations pause when scrolled out of view", str(off))
            c.js("window.scrollTo(0, 0)")
            c.pump(0.8)
            back = c.js(HERO_ANIMS)
            ok(back > 0, f"{w}px hero animations resume when scrolled back", str(back))

            frames = c.js("""new Promise(res=>{const t=[];let last=performance.now();const s=last;function f(n){t.push(n-last);last=n;if(n-s<6000)requestAnimationFrame(f);else{t.shift();const a=[...t].sort((x,y)=>x-y);
              res({n:t.length,fps:+(1000/(t.reduce((x,y)=>x+y,0)/t.length)).toFixed(1),p95:+a[Math.floor(a.length*.95)].toFixed(1),worst:+a[a.length-1].toFixed(1),over33:t.filter(x=>x>33.4).length})}}requestAnimationFrame(f)})""")
            running = c.js(HERO_ANIMS)
            check("PASS" if frames["fps"] >= 50 and frames["over33"] <= 3 else "FAIL", f"{w}px hero frame timing over 6 s (fast Mac, headless)",
                  f"{frames['fps']} fps, 95th percentile {frames['p95']} ms, worst {frames['worst']} ms, {frames['over33']} frames over 33 ms; {running} hero animations running")

        # ---------------- every price / claim number on the page
        print("\n--- prices and numbers on the page ---")
        c.open(base, 1280, 900)
        text = c.js("document.body.innerText")
        found = sorted(set(re.findall(r"£\d+(?:,\d{3})*", text)))
        ok(set(found) <= ALLOWED_PRICES, "only confirmed prices appear on the page", f"found {found}")
        check("NOTE", "all £ amounts on the page", ", ".join(found))
        miles = sorted(set(re.findall(r"\d+p per mile", text)))
        ok(miles == ["80p per mile"], "filming travel is 80p per mile everywhere", str(miles))
        pk = c.js("[...document.querySelectorAll('#packages .card.price')].map(e=>e.innerText.replace(/\\s+/g,' ').trim())")
        expect = [("Bronze", "£499", "one-off"), ("Silver", "£499", "£175"), ("Gold", "£699", "£300")]
        for card, (n, a, b) in zip(pk, expect):
            ok(card.startswith(n) and a in card and b in card, f"package card {n} shows {a} and {b}", card[:140])
        placeholders = re.findall(r"\[[A-Z]{3,}[^\]]*\]", text)
        check("NOTE", "placeholders still visible", str(placeholders))
    finally:
        c.close()
        srv.shutdown()

    p = sum(1 for r in results if r[0] == "PASS")
    f = sum(1 for r in results if r[0] == "FAIL")
    n = sum(1 for r in results if r[0] == "NOTE")
    print(f"\n{p} passed, {f} failed, {n} notes")
    for r in results:
        if r[0] == "FAIL":
            print("FAIL:", r[1], "|", r[2])
    (ROOT / "docs" / "testing" / "full_browser_check_output.json").write_text(json.dumps(results, ensure_ascii=False, indent=1))
    return 1 if f else 0


if __name__ == "__main__":
    sys.exit(main())
