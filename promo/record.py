# Record promo/video.html to JPEG frames (30 fps) for encode.swift.
# Usage: python3 promo/record.py [fps]
import sys, os, base64, time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'tests'))
from cdp import Chrome
import http.server, threading, functools
root = os.path.dirname(os.path.abspath(__file__))
fps = int(sys.argv[1]) if len(sys.argv) > 1 else 30
out = os.path.join(root, 'out', 'frames'); os.makedirs(out, exist_ok=True)
for f in os.listdir(out): os.remove(os.path.join(out, f))
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root)
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8792), Handler); srv.RequestHandlerClass.log_message = lambda *a: None
threading.Thread(target=srv.serve_forever, daemon=True).start()
c = Chrome(port=9342)
try:
    c.open('http://127.0.0.1:8792/video.html?record', 1080, 1920)
    c.js("document.fonts.ready.then(()=>Promise.all([...document.querySelectorAll('.bg')].map(b=>new Promise(r=>{const i=new Image();i.onload=i.onerror=r;i.src=getComputedStyle(b).backgroundImage.slice(5,-2)}))))")
    dur = c.js("DURATION"); n = int(dur * fps); t0 = time.time()
    for i in range(n):
        c.js(f"render({i / fps})")
        data = c.cmd("Page.captureScreenshot", format="jpeg", quality=92)["data"]
        open(os.path.join(out, f"{i:05d}.jpg"), "wb").write(base64.b64decode(data))
        if i % 150 == 0: print(f"frame {i}/{n}  {time.time()-t0:.0f}s", flush=True)
    print("done", n, "frames; page errors:", [e for e in c.errors if 'favicon' not in e][:3])
finally:
    c.close(); srv.shutdown()
