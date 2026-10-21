# Promo video: sources and licences

Made 2026-10-21. 45 s, vertical. Files: `promo/out/clear-signs-promo.mp4` (1080x1920, Instagram/TikTok/Reels) and `promo/out/clear-signs-promo-whatsapp.mp4` (720x1280, under 16 MB).
Rebuild: `python3 promo/record.py 30` then `promo/out/encode promo/out/frames promo/assets/music.mp3 promo/out/clear-signs-promo.mp4 30 1080 1920 9000000` (compile first: `swiftc -O promo/encode.swift -o promo/out/encode`).
Edit the video: `promo/video.html` (open in a browser to preview; space pauses, arrows scrub).

## Photos: Unsplash Licence (free for commercial use, no attribution required). Downloaded 2026-10-21.
- 01-van-night.jpg: https://unsplash.com/photos/white-panel-van-parked-beside-house-_6MdKACpLVY
- 02-nfc.jpg: https://unsplash.com/photos/person-holding-white-iphone-5-c-TOaE3Td9F8M
- 03-plumber.jpg: https://unsplash.com/photos/a-man-working-on-a-pipe-in-a-cabinet-wzIjLL4KB-4
- 04-electrician.jpg: https://unsplash.com/photos/technician-working-on-network-equipment-with-tools-fJTyegEd-6k
- 05-filming.jpg: https://unsplash.com/photos/person-using-smartphone-and-capturing-images-lkHNDf-oXTk
- 06-van.jpg: https://unsplash.com/photos/white-van-beside-wall-9AMcBwf7AiY
- 07-street.jpg (not used in the current cut): https://unsplash.com/photos/black-taxi-on-luxury-london-street-W-xvFEZbEvA
- 08-happy.jpg: https://unsplash.com/photos/man-in-orange-shirt-smiles-at-another-AmdiSUONPms
Licence: https://unsplash.com/license (do not sell the photos unaltered or build a competing photo service).

## Music: Pixabay Content Licence (free for commercial use). Downloaded 2026-10-21.
- "Corporate Cinematic" by PaulYudin: https://pixabay.com/music/main-title-corporate-cinematic-164798/
Licence: https://pixabay.com/service/license-summary/
Note: if a platform (e.g. YouTube Content ID) flags the music, the Pixabay licence page and this link are your proof.

## Content notes
- "Brookvale Plumbing & Heating" is a made-up example business.
- Prices match docs/DECISIONS.md (Bronze £499; Silver £499 + £175/month; Gold £699 + £300/month; 6-month minimum).
- If prices, phone numbers or the name change, update promo/video.html and re-record.
