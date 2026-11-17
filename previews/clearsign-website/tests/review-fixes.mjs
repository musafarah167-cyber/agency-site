// Regression checks for the practical issues in the 17 November design review.
import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const baselineFile = path.join(project, 'tests/fixtures/website-image-baseline.json');
const out = path.join(project, 'outputs/website-checks');
await fs.mkdir(path.join(out, 'tmp'), {recursive:true});
process.env.TMPDIR = path.join(out, 'tmp');
const before=process.argv.includes('--before');const checks=[];const errors=[],external=[],posts=[];const check=(ok,name)=>checks.push({name,passed:!!ok});
const base=process.env.CLEARSIGN_PREVIEW_URL || 'http://127.0.0.1:3210/';const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const c=await b.newContext({viewport:{width:390,height:844}});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))external.push(r.url());if(r.method()!=='GET')posts.push({url:r.url(),method:r.method()})});
 await p.goto(base+'contact.html');await p.getByRole('button',{name:'Preview your enquiry',exact:true}).click();
 check(await p.locator('form').evaluate(e=>e.noValidate),'Custom validation replaces temporary browser popups');
 check(await p.locator('[data-field-error]:visible').count()===3,'An empty submission shows three persistent field errors');
 check(await p.locator('[name=name]').evaluate(e=>e===document.activeElement),'An invalid submission focuses the first field');
 check(await p.locator('[name=name]').getAttribute('aria-invalid')==='true','Invalid name is announced');
 await p.locator('[name=business]').fill('Example');check(await p.locator('[data-field-error]:visible').count()===3,'Field errors remain visible after moving elsewhere');
 await p.locator('[name=name]').fill('  ');await p.locator('[name=message]').fill('\n  ');await p.locator('[name=email]').fill('not-an-email');await p.getByRole('button',{name:'Preview your enquiry',exact:true}).click();
 check(await p.locator('[data-field-error]:visible').count()===3,'Spaces and an invalid email each receive an explanation');
 await p.locator('[name=name]').fill('Test <img src=x onerror=alert(1)>');check(await p.locator('[name=name]').getAttribute('aria-invalid')!=='true','Correcting a field clears its invalid state');
 await p.locator('[name=email]').fill('test@example.com');await p.locator('[name=message]').fill('A local test enquiry.');await p.getByRole('button',{name:'Preview your enquiry',exact:true}).click();
 check(await p.locator('#enquiry-result').isVisible(),'A valid enquiry still previews');check((await p.locator('#enquiry-result-heading').textContent()).trim()==='Your enquiry preview','Preview heading does not imply a later send step');check(await p.locator('#enquiry-summary img').count()===0,'Entered text remains safely rendered');await p.locator('#edit-enquiry').click();check((await p.locator('[name=name]').inputValue()).includes('<img'),'Editing keeps entered details');
 await p.goto(base);check(/trades|salons|car hire/i.test(await p.locator('.hero-eyebrow').textContent()),'The hero identifies businesses it is for');check(/digital assistant/i.test(await p.locator('.hero-content').textContent()),'AI agents are defined in the opening');
 for(const selector of ['#business-needs','.business-story','.industries-intro'])check(await p.locator(selector+' a[href="contact.html"]').count()>0,'Contact stays available in '+selector);
 const servicesBeforeExample = await p.locator('#business-needs').evaluate(section => {
   const links = section.querySelectorAll('a[id^="home-service-"]');
   const example = document.getElementById('business-story');
   return links.length === 5 && Boolean(section.compareDocumentPosition(example) & Node.DOCUMENT_POSITION_FOLLOWING);
 });
 check(servicesBeforeExample, 'All five service choices are available together before the worked example');
 const names=(await p.locator('main h2').allTextContents()).map(t=>t.replace(/\s/g,'').toLowerCase());check(new Set(names).size===names.length,'Homepage section headings are distinct');
 const slugs=['websites','ai','automation','software','marketing'];for(const slug of slugs)check(await p.locator('#home-service-'+slug).getAttribute('href')==='service-'+slug+'.html',slug+' can be opened directly from its homepage row');
 const motion=p.locator('.hero-motion');const label=await motion.getAttribute('aria-label');await motion.click();check(await motion.getAttribute('aria-label')===label&&label==='Pause animations','Motion toggle has one stable accessible label');check(await motion.getAttribute('aria-pressed')==='true','Pressed motion toggle means paused');
 await p.goto(base+'about.html');check(await p.locator('html').evaluate(e=>e.classList.contains('motion-off')),'Pause preference survives another page');check(await p.locator('.motion-control').getAttribute('aria-pressed')==='true','The new page shows the saved paused state');
 await p.goto(base);check(await p.locator('.hero-motion').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=14,'Motion control is readable on phones');check(await p.locator('.hero-media-footer>span').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>=12,'Hero caption is readable on phones');
 for (const width of [1440, 320, 390]) {
   await p.setViewportSize({width, height: 900});
   await p.evaluate(() => document.fonts.ready);
   const opening = await p.locator('.hero').evaluate(hero => {
     const box = selector => hero.querySelector(selector).getBoundingClientRect();
     const main = box('.hero-actions .button');
     const link = box('.hero-actions .text-link');
     const art = box('.hero-sculpture-frame');
     return {
       mainHeight: main.height, linkHeight: link.height,
       gapAcross: link.left - main.right, gapBelow: link.top - main.bottom,
       artOnRight: art.left >= box('.hero-content').right,
       artWidth: art.width, artHeight: art.height,
       paper: getComputedStyle(hero).backgroundColor,
       masthead: getComputedStyle(document.querySelector('.site-header')).backgroundColor,
       unframed: getComputedStyle(hero.querySelector('.hero-media')).backgroundColor === 'rgba(0, 0, 0, 0)'
     };
   });
   const desktop = width === 1440;
   check(opening.mainHeight >= (desktop ? 52 : 48) && opening.linkHeight >= 44, 'Homepage actions have enough tap space at ' + width + 'px');
   const expectedGap = desktop ? 16 : 12;
   const measuredGap = width === 320 ? opening.gapBelow : opening.gapAcross;
   check(Math.abs(measuredGap - expectedGap) < 1, 'Homepage actions fit with their intended gap at ' + width + 'px');
   if (desktop) {
     check(opening.paper === 'rgb(247, 246, 242)' && opening.masthead === opening.paper && opening.unframed, 'Masthead and unframed C share the original warm-white surface');
     check(opening.artOnRight && opening.artWidth >= 640 && opening.artHeight >= 490, 'The large C sits beside the desktop headline');
   }
 }
 await p.goto(base+'solutions.html');check((await p.locator('#automation h2').textContent()).trim()==='Admin & follow-up','Admin service has one consistent main name');check(await p.locator('.solution-jump a[href="#automation"]').textContent().then(t=>t.includes('Admin & follow-up')),'The admin jump link uses its service name');
 await p.goto(base+'service-software.html');check(/customer portal.{0,60}(secure|sign in|customer update|page)|(?:secure|sign in).{0,60}customer portal/i.test(await p.locator('.page-hero>div>p').textContent()),'Customer portal is explained at first use');
 const tapSizes=await p.locator('.breadcrumb a,.faq-section summary,.site-footer .footer-grid a').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height));check(tapSizes.every(h=>h>=43.5),'Breadcrumb, FAQ and footer targets are comfortable to tap');
 await p.goto(base+'service-websites.html');check((await p.locator('.sv-web-copy .sv-caption').textContent()).includes('own website'),'Website example is clearly our own work');
 const baseline=JSON.parse(await fs.readFile(baselineFile,'utf8'));for(const file of ['homepage-preview.png','website-specimen-mobile.png']){const target=path.join(project,'website/static/assets/images',file);check(createHash('sha256').update(await fs.readFile(target)).digest('hex')!==baseline['website/static/assets/images/'+file],'Current homepage capture replaces '+file);}
 check(!errors.length&&!external.length&&!posts.length,'No script errors, external requests or sending');
 const r={checks,failures:checks.filter(c=>!c.passed),errors,external,posts};await fs.writeFile(path.join(out,before?'before-checks.json':'after-checks.json'),JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({checks:checks.length,passed:checks.filter(c=>c.passed).length,failures:r.failures.map(c=>c.name)},null,2));if(r.failures.length)process.exitCode=1;
}finally{await b.close()}
