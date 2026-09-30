# Design handoff (branch `design`)

Only `site/styles.css` changed (new rules appended at the end). No HTML or JS touched, no wording or prices changed.

## What changed (one commit each)
1. **Phone hero buttons**: below 480px the three hero buttons are full width and stacked. Desktop row unchanged.
2. **Floating WhatsApp button**: smaller on phones (below 480px), respects the iPhone bottom safe area. Still white on #0f7a35 = 5.45:1, still labelled "Chat on WhatsApp", link untouched.
3. **Tap targets**: logo link is 44px tall; phone links inside paragraphs have a bigger tap area. (Menu button, nav, buttons and footer links were already 44px on phones.)
4. **Silver button**: graphite #5f6368 with white text = 6.05:1, hover #44484d = 9.21:1. Silver tint, top strip and heading unchanged. Bronze and Gold untouched. Package buttons were already level across cards, so nothing needed there.
5. **Spacing and sections**: below 480px section and hero padding reduced (48px to 36px). Alternate-section colour slightly stronger (#eef4fd to #eaf1fc) with thin top/bottom lines. On that colour: body text #4a5a70 = 6.19:1, orange text #c2410c = 4.56:1.

## How tested
Local server, browser at 375, 768 and 1280px: no sideways scroll, no console errors, hero buttons 343px wide and stacked at 375, single row at 1280, logo 44px, float button 44px tall, Silver button visibly darker, hero animation still running. Contrast ratios calculated with the WCAG formula.

## NOT tested
Real phones and Safari; Silver hover state by mouse (CSS only); 768px checked for overflow and spacing only, not every section by eye; screen reader; reduced-motion setting (rules untouched).

## Requests for front end
None.
