#!/usr/bin/env python3
"""Automatic checks for the Clear Signs site (site/ folder).

Run from the project root:
    python3 tests/check_site.py            # everyday check
    python3 tests/check_site.py --launch   # pre-launch: any placeholder counts as a FAIL

Uses only Python's standard library, so nothing needs installing.
It starts a small local web server for site/, fetches every page and file,
and prints PASS / WARN / FAIL for each check. Exit code 1 if anything FAILs.
"""
import functools
import http.server
import re
import sys
import threading
import urllib.error
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urldefrag, urljoin, urlparse

SITE = Path(__file__).resolve().parent.parent / "site"
PHONE_TEL = "tel:+441215172760"
WHATSAPP = "447405535846"
PLACEHOLDER = re.compile(r"\[(CLIENT|CONFIRM|X\]|£|PROPOSED|YOUR|TODO|TBC|DECISION)", re.I)
LAUNCH = "--launch" in sys.argv

results = []  # (status, check, detail)


def report(status, check, detail=""):
    results.append((status, check, detail))


class PageParser(HTMLParser):
    """Collects the bits of a page we check: links, ids, meta tags, headings."""

    def __init__(self):
        super().__init__()
        self.ids, self.links, self.metas, self.icons, self.imgs = [], [], {}, [], []
        self.h1 = 0
        self.title = ""
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        line = self.getpos()[0]
        if "id" in a:
            self.ids.append(a["id"])
        if tag == "title":
            self._in_title = True
        if tag == "h1":
            self.h1 += 1
        if tag == "meta":
            key = a.get("name") or a.get("property")
            if key:
                self.metas[key] = a.get("content", "")
        if tag == "link" and "icon" in (a.get("rel") or ""):
            self.icons.append(a.get("href"))
        if tag == "img":
            self.imgs.append((line, a))
        for attr in ("href", "src"):
            if a.get(attr) is not None:
                self.links.append((line, tag, a[attr], a))

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._in_title:
            self.title += data


def start_server():
    handler = functools.partial(QuietHandler, directory=str(SITE))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f"http://127.0.0.1:{server.server_address[1]}/"


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def fetch(url):
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""


def main():
    server, base = start_server()
    pages = sorted(p.relative_to(SITE).as_posix() for p in SITE.rglob("*.html"))
    parsed = {}

    # 1. Every page loads
    for page in pages:
        status, body = fetch(base + page)
        report("PASS" if status == 200 else "FAIL", "Page loads", f"{page} -> {status}")
        p = PageParser()
        p.feed(body)
        parsed[page] = p

    for page, p in parsed.items():
        # 2. Required meta tags
        report("PASS" if p.title.strip() else "FAIL", "Has <title>", f"{page}: {p.title.strip()[:70]}")
        for name in ("description", "viewport"):
            report("PASS" if p.metas.get(name) else "FAIL", f"Has meta {name}", page)
        report("PASS" if p.icons else "FAIL", "Has favicon link", f"{page}: {p.icons}")
        report("PASS" if p.metas.get("og:title") else "WARN", "Has og:title (share preview)", page)

        # 3. Exactly one h1
        report("PASS" if p.h1 == 1 else "FAIL", "Exactly one h1", f"{page}: found {p.h1}")

        # 4. No duplicate ids (anchors must be unique)
        dupes = sorted({i for i in p.ids if p.ids.count(i) > 1})
        report("FAIL" if dupes else "PASS", "No duplicate ids", f"{page}: {dupes or 'none'}")

        # 5. Images have alt text
        for line, a in p.imgs:
            report("PASS" if "alt" in a else "FAIL", "Image has alt text", f"{page}:{line} {a.get('src')}")

        # 6. Links, anchors, files, phone and WhatsApp
        checked = set()
        for line, tag, href, attrs in p.links:
            where = f"{page}:{line} <{tag}> {href}"
            if href.startswith("tel:"):
                report("PASS" if href == PHONE_TEL else "FAIL", "tel: link uses +441215172760", where)
                continue
            if href.startswith("mailto:"):
                report("PASS" if "@" in href else "FAIL", "mailto: link has an address", where)
                continue
            if "wa.me" in href:
                ok = urlparse(href).path.strip("/") == WHATSAPP
                report("PASS" if ok else "FAIL", "wa.me link uses 447405535846", where)
            if href.startswith(("http://", "https://")):
                if attrs.get("target") == "_blank":
                    ok = "noopener" in (attrs.get("rel") or "")
                    report("PASS" if ok else "WARN", "New-tab link has rel=noopener", where)
                continue  # external sites are not fetched (they may block robots)
            target, frag = urldefrag(urljoin(base + page, href))
            target_page = target[len(base):] or "index.html"
            if target_page.endswith("/"):
                target_page += "index.html"
            if target_page not in checked:
                status, _ = fetch(target)
                checked.add(target_page)
                report("PASS" if status == 200 else "FAIL", "Internal file/link loads", f"{where} -> {status}")
            if frag:
                ids = parsed[target_page].ids if target_page in parsed else []
                report("PASS" if frag in ids else "FAIL", "#anchor exists", where)

    # 7. WhatsApp number in script.js (used by the quote form)
    js = (SITE / "script.js").read_text()
    m = re.search(r'WHATSAPP_NUMBER\s*=\s*"(\d+)"', js)
    report("PASS" if m and m.group(1) == WHATSAPP else "FAIL", "script.js WHATSAPP_NUMBER is 447405535846",
           m.group(1) if m else "not found")

    # 8. Placeholders left in any site file
    found = 0
    for f in sorted(SITE.rglob("*")):
        if f.suffix not in (".html", ".js", ".css", ".txt", ".xml"):
            continue
        for n, text in enumerate(f.read_text().splitlines(), 1):
            for m in PLACEHOLDER.finditer(text):
                found += 1
                snippet = text[m.start():m.start() + 70].strip()
                report("FAIL" if LAUNCH else "WARN", "Placeholder still on site",
                       f"{f.relative_to(SITE)}:{n} {snippet}")
    if not found:
        report("PASS", "Placeholder still on site", "none found")

    server.shutdown()

    # Summary
    width = max(len(c) for _, c, _ in results)
    for status, check, detail in results:
        print(f"{status:4}  {check:<{width}}  {detail}")
    counts = {s: sum(1 for r in results if r[0] == s) for s in ("PASS", "WARN", "FAIL")}
    print(f"\n{counts['PASS']} passed, {counts['WARN']} warnings, {counts['FAIL']} failed"
          + ("  (launch mode: placeholders count as failures)" if LAUNCH else ""))
    return 1 if counts["FAIL"] else 0


if __name__ == "__main__":
    sys.exit(main())
