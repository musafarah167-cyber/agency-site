# Grab still frames of promo/video.html at given seconds (for checking the design).
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'tests'))
from cdp import Chrome
import http.server, threading, functools
root = os.path.dirname(os.path.abspath(__file__))
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8791), functools.partial(http.server.SimpleHTTPRequestHandler, directory=root))
srv.RequestHandlerClass.log_message = lambda *a: None
threading.Thread(target=srv.serve_forever, daemon=True).start()
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
times = [float(x) for x in sys.argv[2:]]
c = Chrome(port=9341)
try:
    c.open('http://127.0.0.1:8791/video.html?record', 1080, 1920)
    c.js("document.fonts.ready.then(()=>Promise.all([...document.querySelectorAll('.bg')].map(b=>new Promise(r=>{const i=new Image();i.onload=i.onerror=r;i.src=getComputedStyle(b).backgroundImage.slice(5,-2)}))))")
    for t in times:
        c.js(f"render({t})"); c.pump(0.05)
        c.shot(os.path.join(out, f"t{t:05.1f}.png"))
    print('errors:', c.errors[:5])
finally:
    c.close(); srv.shutdown()
