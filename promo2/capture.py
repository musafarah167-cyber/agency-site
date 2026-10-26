# Capture full-page screenshots of the local site for the promo (desktop, phone, languages).
import sys, os, base64, json
sys.path.insert(0, 'tests'); from cdp import Chrome
out = 'promo2/shots'; base = 'http://localhost:8765/'
c = Chrome(port=9361)
def full(path, w, h, dpr, url, lang=None, viewport_only=False):
    c.cmd("Emulation.setDeviceMetricsOverride", width=w, height=h, deviceScaleFactor=dpr, mobile=w < 600)
    c.cmd("Page.navigate", url=url); c.pump(1.5)
    c.js("document.fonts.ready")
    # reveal every section, freeze the hero trailer at a good frame
    c.js("(async()=>{document.documentElement.style.scrollBehavior='auto';for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,40))} scrollTo(0,0); document.querySelectorAll('.reveal').forEach(e=>e.classList.add('is-visible'));})()"); c.pump(1.2)
    c.js("document.querySelector('.float-wa').style.display='none'; document.getAnimations().forEach(a=>{a.pause(); a.currentTime=3000})")
    if viewport_only:
        data = c.cmd("Page.captureScreenshot", format="jpeg", quality=92)["data"]
    else:
        H = c.js("document.documentElement.scrollHeight")
        data = c.cmd("Page.captureScreenshot", format="jpeg", quality=90, captureBeyondViewport=True, clip={"x":0,"y":0,"width":w,"height":H,"scale":1})["data"]
    open(os.path.join(out, path), 'wb').write(base64.b64decode(data))
try:
    full('desktop-full.jpg', 1440, 900, 1, base)
    full('phone-full.jpg', 390, 844, 2, base)
    full('desktop-ar.jpg', 1440, 900, 1, base + '?lang=ar', viewport_only=True)
    full('desktop-ur.jpg', 1440, 900, 1, base + '?lang=ur', viewport_only=True)
    full('desktop-es.jpg', 1440, 900, 1, base + '?lang=es', viewport_only=True)
    print('max texture', c.js("(()=>{const g=document.createElement('canvas').getContext('webgl2');return g?g.getParameter(g.MAX_TEXTURE_SIZE):'no webgl2'})()"))
finally:
    c.close()
