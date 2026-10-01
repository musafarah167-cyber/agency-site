"""Tiny Chrome remote-control helper (standard library only).

Starts a headless Google Chrome, connects over its DevTools WebSocket and offers a few simple
actions: open a page at a given width, run JavaScript, press real keys, take screenshots, force
"reduce motion", and collect console errors. Used by tests/full_browser_check.py.
"""
import base64
import json
import os
import socket
import struct
import subprocess
import tempfile
import time
import urllib.request

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
KEYS = {  # name -> (key, code, windowsVirtualKeyCode, text)
    "Tab": ("Tab", "Tab", 9, ""), "Enter": ("Enter", "Enter", 13, "\r"), "Space": (" ", "Space", 32, " "),
    "Escape": ("Escape", "Escape", 27, ""), "ArrowDown": ("ArrowDown", "ArrowDown", 40, ""),
    "ArrowUp": ("ArrowUp", "ArrowUp", 38, ""), "ArrowRight": ("ArrowRight", "ArrowRight", 39, ""),
    "Backspace": ("Backspace", "Backspace", 8, ""),
}


class WebSocket:
    def __init__(self, url):
        host, rest = url[5:].split("/", 1)
        h, p = host.split(":")
        self.s = socket.create_connection((h, int(p)))
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET /{rest} HTTP/1.1\r\nHost: {host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
                        f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            buf += self.s.recv(1)

    def send(self, text):
        data = text.encode()
        head = bytearray([0x81])
        n = len(data)
        if n < 126:
            head.append(0x80 | n)
        elif n < 65536:
            head += bytes([0x80 | 126]) + struct.pack(">H", n)
        else:
            head += bytes([0x80 | 127]) + struct.pack(">Q", n)
        mask = os.urandom(4)
        self.s.sendall(bytes(head) + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))

    def _read(self, n):
        out = b""
        while len(out) < n:
            chunk = self.s.recv(n - len(out))
            if not chunk:
                raise ConnectionError("closed")
            out += chunk
        return out

    def recv(self):
        message = b""
        while True:
            b1, b2 = self._read(2)
            n = b2 & 0x7F
            if n == 126:
                n = struct.unpack(">H", self._read(2))[0]
            elif n == 127:
                n = struct.unpack(">Q", self._read(8))[0]
            message += self._read(n)
            if b1 & 0x80:
                return message.decode("utf-8", "replace")


class Chrome:
    def __init__(self, port=9333):
        self.profile = tempfile.mkdtemp()
        self.proc = subprocess.Popen([CHROME, "--headless=new", f"--remote-debugging-port={port}", f"--user-data-dir={self.profile}",
                                      "--hide-scrollbars", "--no-first-run", "--window-size=1400,1000", "about:blank"],
                                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(50):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json/list"))
                page = [t for t in tabs if t["type"] == "page"][0]
                break
            except Exception:
                time.sleep(0.2)
        self.ws = WebSocket(page["webSocketDebuggerUrl"])
        self.n = 0
        self.errors = []
        for m in ("Page.enable", "Runtime.enable", "Log.enable", "Network.enable"):
            self.cmd(m)

    def cmd(self, method, **params):
        self.n += 1
        mid = self.n
        self.ws.send(json.dumps({"id": mid, "method": method, "params": params}))
        while True:
            msg = json.loads(self.ws.recv())
            self._event(msg)
            if msg.get("id") == mid:
                if "error" in msg:
                    raise RuntimeError(f"{method}: {msg['error']}")
                return msg.get("result", {})

    def _event(self, msg):
        m, p = msg.get("method"), msg.get("params", {})
        if m == "Runtime.exceptionThrown":
            self.errors.append("exception: " + p["exceptionDetails"].get("text", "") + " " + str(p["exceptionDetails"].get("exception", {}).get("description", ""))[:200])
        elif m == "Runtime.consoleAPICalled" and p.get("type") in ("error", "warning"):
            self.errors.append(f"console.{p['type']}: " + " ".join(str(a.get("value", a.get("description", ""))) for a in p.get("args", []))[:200])
        elif m == "Log.entryAdded" and p["entry"]["level"] in ("error", "warning"):
            self.errors.append(f"log.{p['entry']['level']}: {p['entry']['text']} {p['entry'].get('url', '')}"[:240])
        elif m == "Network.loadingFailed" and not p.get("canceled"):
            self.errors.append("network failed: " + p.get("errorText", ""))

    def pump(self, seconds):
        """Wait while collecting events (the page keeps running)."""
        end = time.time() + seconds
        self.ws.s.settimeout(0.1)
        while time.time() < end:
            try:
                self._event(json.loads(self.ws.recv()))
            except socket.timeout:
                pass
            except Exception:
                break
        self.ws.s.settimeout(None)

    def open(self, url, width, height=800, reduce_motion=False, media="", no_js=False):
        self.cmd("Emulation.setDeviceMetricsOverride", width=width, height=height, deviceScaleFactor=1, mobile=False)
        self.cmd("Emulation.setEmulatedMedia", media=media, features=[{"name": "prefers-reduced-motion", "value": "reduce" if reduce_motion else "no-preference"}])
        self.cmd("Emulation.setScriptExecutionDisabled", value=no_js)
        self.cmd("Page.navigate", url=url)
        for _ in range(100):  # wait for load
            if self.js("document.readyState") == "complete":
                break
            self.pump(0.1)

    def js(self, expr):
        r = self.cmd("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
        if "exceptionDetails" in r:
            raise RuntimeError(str(r["exceptionDetails"])[:300])
        return r["result"].get("value")

    def key(self, name, shift=False, ctrl=False):
        k, code, vk, text = KEYS[name]
        mods = (8 if shift else 0) | (2 if ctrl else 0)
        self.cmd("Input.dispatchKeyEvent", type="keyDown" if text else "rawKeyDown", key=k, code=code, windowsVirtualKeyCode=vk, text=text, modifiers=mods)
        self.cmd("Input.dispatchKeyEvent", type="keyUp", key=k, code=code, windowsVirtualKeyCode=vk, modifiers=mods)
        self.pump(0.15)
        if name == "Tab":  # the page scrolls smoothly: wait until it has stopped moving
            last = None
            for _ in range(25):
                y = self.js("scrollY")
                if y == last:
                    break
                last = y
                self.pump(0.1)

    def type(self, text):
        for ch in text:
            self.cmd("Input.dispatchKeyEvent", type="keyDown", key=ch, text=ch, unmodifiedText=ch)
            self.cmd("Input.dispatchKeyEvent", type="keyUp", key=ch)
        self.pump(0.1)

    def shot(self, path, selector=None, pad=0, max_height=4000):
        """Screenshot of the viewport, or of one element (even if it is below the fold)."""
        params = {"format": "png"}
        if selector:
            r = self.js(f"(()=>{{const e=document.querySelector({json.dumps(selector)});if(!e)return null;const b=e.getBoundingClientRect();return [b.left+scrollX,b.top+scrollY,b.width,b.height]}})()")
            if not r:
                return False
            params.update(clip={"x": max(0, r[0] - pad), "y": max(0, r[1] - pad), "width": r[2] + 2 * pad, "height": min(r[3] + 2 * pad, max_height), "scale": 1},
                          captureBeyondViewport=True)
        data = self.cmd("Page.captureScreenshot", **params)["data"]
        with open(path, "wb") as f:
            f.write(base64.b64decode(data))
        return True

    def close(self):
        try:
            self.cmd("Browser.close")
        except Exception:
            pass
        self.proc.kill()
