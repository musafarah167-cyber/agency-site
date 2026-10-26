# Record promo2/video.html. Stills: python3 promo2/record.py stills OUTDIR 3.5 10 ...   All frames: python3 promo2/record.py all
import sys, os, base64, time, functools, http.server, threading
sys.path.insert(0, 'tests'); from cdp import Chrome
root = os.getcwd(); fps = 30
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8793), functools.partial(http.server.SimpleHTTPRequestHandler, directory=root))
srv.RequestHandlerClass.log_message = lambda *a: None
threading.Thread(target=srv.serve_forever, daemon=True).start()
c = Chrome(port=9363)
try:
    c.open('http://127.0.0.1:8793/promo2/video.html?record', 1080, 1920)
    ok = c.js("window.READY")
    errs = [e for e in c.errors if 'favicon' not in e]
    if errs: print('page errors:', errs[:5])
    mode = sys.argv[1]
    if mode == 'stills':
        out = sys.argv[2]; os.makedirs(out, exist_ok=True)
        for t in map(float, sys.argv[3:]):
            c.js(f"render({t})"); data = c.cmd("Page.captureScreenshot", format="jpeg", quality=88)["data"]
            open(os.path.join(out, f"t{t:05.1f}.jpg"), 'wb').write(base64.b64decode(data))
    else:
        out = 'promo2/out/frames'; os.makedirs(out, exist_ok=True)
        for f in os.listdir(out): os.remove(os.path.join(out, f))
        n = int(c.js("DURATION") * fps); t0 = time.time()
        for i in range(n):
            c.js(f"render({i / fps}, {i})")
            data = c.cmd("Page.captureScreenshot", format="jpeg", quality=92)["data"]
            open(os.path.join(out, f"{i:05d}.jpg"), 'wb').write(base64.b64decode(data))
            if i % 150 == 0: print(f"frame {i}/{n} {time.time() - t0:.0f}s", flush=True)
        print('done', n)
    print('later errors:', [e for e in c.errors if 'favicon' not in e][:5])
finally:
    c.close(); srv.shutdown()
