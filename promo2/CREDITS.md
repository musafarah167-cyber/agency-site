# Website film (promo2): how it is made and sources

45 s vertical film of the Clear Signs website. Files: promo2/out/clear-signs-website-film.mp4 (1080x1920) and -whatsapp.mp4 (720x1280).
- 3D: three.js 0.160 (MIT licence), loaded from cdn.jsdelivr.net at render time. Screens show real screenshots of the site (promo2/capture.py + promo2/shots/).
- Voiceover: macOS built-in voice "Daniel" (say command), script in promo2/vo/script.txt. Re-record lines: see promo2/vo.
- Music: "Corporate Cinematic" by PaulYudin, Pixabay Content Licence (see promo/CREDITS.md).
- Opening photo: Unsplash Licence (see promo/CREDITS.md, 01-van-night.jpg).
- "Brookvale Plumbing & Heating" is a made-up example business.
Rebuild: python3 promo2/record.py all ; swiftc -O promo2/encode.swift -o promo2/out/encode ;
promo2/out/encode promo2/out/frames promo/assets/music.mp3 promo2/out/clear-signs-website-film.mp4 30 1080 1920 9000000 promo2/vo 0.6,6.0,8.3,15.0,20.4,26.1,33.0,37.4,41.0
If the website changes, re-run promo2/capture.py first so the screens are current.
