import fs from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import nodeProcess from 'node:process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {services,serviceBySlug} from './content/services.mjs';
import {serviceVisuals} from './content/service-visuals.mjs';
import {solutionOverview} from './content/solution-overview.mjs';
import {storyMarkup} from './content/scroll-story.mjs';
import {businessNeeds} from './content/homepage.mjs';
import {businessPurpose} from './content/business-purpose.mjs';
const sourceRoot=path.dirname(fileURLToPath(import.meta.url));
const projectRoot=path.resolve(sourceRoot,'..');
const usage='Usage: node website/build.mjs [--out <project-local output directory>]';
const args=nodeProcess.argv.slice(2);
if(args.length===1 && args[0]==='--help') { console.log(usage); nodeProcess.exit(0); }
if(args.length && (args.length!==2 || args[0]!=='--out' || !args[1] || args[1].startsWith('--'))) throw new Error(usage);
const root=args.length?path.resolve(nodeProcess.cwd(),args[1]):path.join(projectRoot,'site');
const relativeOutput=path.relative(projectRoot,root);
if(relativeOutput!=='site' && !relativeOutput.startsWith(`outputs${path.sep}`)) {
  throw new Error('Output must be site/ or a directory inside this project’s outputs/. Nothing was written.');
}
const sha256=value=>createHash('sha256').update(value).digest('hex');
const stateDir=path.join(sourceRoot,'.build-state');
const stateFile=path.join(stateDir,`${sha256(root)}.json`);
const safeRelative=file=>typeof file==='string' && !path.isAbsolute(file) && !file.includes('\\') && !file.includes('\0') && !file.split('/').some(part=>!part || part==='.' || part==='..');

// Never follow symlinks, replace an unrelated website or delete an output tree.
async function checkPath(target) {
  const relative=path.relative(projectRoot,target);
  if(relative==='..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('Path leaves the project.');
  let current=projectRoot;
  for(const part of relative.split(path.sep).filter(Boolean)) {
    current=path.join(current,part);
    try { if((await fs.lstat(current)).isSymbolicLink()) throw new Error(`Refusing symlink: ${current}`); }
    catch(error) { if(error.code!=='ENOENT') throw error; }
  }
}
async function collectFiles(directory,prefix='') {
  let entries;
  try { entries=await fs.readdir(directory,{withFileTypes:true}); }
  catch(error) { if(error.code==='ENOENT') return []; throw error; }
  const files=[];
  for(const entry of entries.sort((a,b)=>a.name.localeCompare(b.name))) {
    const relative=prefix?`${prefix}/${entry.name}`:entry.name;
    if(entry.isSymbolicLink()) throw new Error(`Refusing symlink: ${path.join(directory,entry.name)}`);
    if(entry.isDirectory()) files.push(...await collectFiles(path.join(directory,entry.name),relative));
    else if(entry.isFile()) files.push(relative);
    else throw new Error(`Not a regular file: ${relative}`);
  }
  return files;
}
async function writeBuild(generatedPages) {
  await checkPath(root);
  await checkPath(stateFile);
  const staticRoot=path.join(sourceRoot,'static');
  await checkPath(staticRoot);
  const files=new Map();
  for(const file of await collectFiles(staticRoot)) files.set(file,await fs.readFile(path.join(staticRoot,file)));
  for(const [file,html] of generatedPages) {
    if(!safeRelative(file)) throw new Error(`Unsafe generated filename: ${file}. Nothing was written.`);
    if(files.has(file)) throw new Error(`Static file conflicts with generated page: ${file}`);
    files.set(file,Buffer.from(html));
  }
  let previous;
  try { previous=JSON.parse(await fs.readFile(stateFile,'utf8')); }
  catch(error) { if(error.code!=='ENOENT') throw error; }
  if(previous && (previous.schemaVersion!==1 || previous.output!==root || !Array.isArray(previous.files))) throw new Error('Unrecognised build record. Nothing was written.');
  const previousFiles=new Map();
  for(const entry of previous?.files||[]) {
    if(!safeRelative(entry.path) || !/^[a-f0-9]{64}$/.test(entry.sha256)) throw new Error('Invalid build record. Nothing was written.');
    previousFiles.set(entry.path,entry.sha256);
  }
  const existing=await collectFiles(root);
  // A fresh checkout may include generated site/ without this computer's local
  // build record. Adopt it only when every existing byte matches this build.
  if(!previous) {
    for(const file of existing) {
      const planned=files.get(file);
      if(!planned || !(await fs.readFile(path.join(root,file))).equals(planned)) throw new Error(`Existing output has no build record and differs from source: ${file}. Archive it before building. Nothing was written.`);
      previousFiles.set(file,sha256(planned));
    }
  }
  for(const file of existing) {
    if(!previousFiles.has(file)) throw new Error(`Output contains an untracked file: ${file}. Archive it before building. Nothing was written.`);
    if(sha256(await fs.readFile(path.join(root,file)))!==previousFiles.get(file)) throw new Error(`Generated file was edited: ${file}. Preserve that edit in website/ before rebuilding. Nothing was written.`);
  }
  // Check every file/directory collision before the first output write. Such
  // structural changes need a fresh output folder rather than a partial build.
  const existingSet=new Set(existing);
  for(const file of files.keys()) {
    const segments=file.split('/');
    for(let i=1;i<segments.length;i++) {
      const ancestor=segments.slice(0,i).join('/');
      if(files.has(ancestor) || existingSet.has(ancestor)) throw new Error(`File/directory conflict at ${ancestor}. Archive the output and rebuild fresh. Nothing was written.`);
    }
    try {
      if((await fs.lstat(path.join(root,file))).isDirectory()) throw new Error(`Directory blocks output file ${file}. Archive the output and rebuild fresh. Nothing was written.`);
    } catch(error) { if(error.code!=='ENOENT') throw error; }
  }
  await fs.mkdir(root,{recursive:true});
  for(const [file,data] of files) {
    const target=path.join(root,file);
    await fs.mkdir(path.dirname(target),{recursive:true});
    await fs.writeFile(target,data);
  }
  // Remove only obsolete files recorded by this builder and verified above.
  // No recursive delete is used, even for an explicit --out directory.
  const stale=existing.filter(file=>!files.has(file));
  for(const file of stale) await fs.unlink(path.join(root,file));
  const obsoleteDirs=new Set();
  for(const file of stale) {
    let directory=path.dirname(path.join(root,file));
    while(directory!==root) { obsoleteDirs.add(directory); directory=path.dirname(directory); }
  }
  for(const directory of [...obsoleteDirs].sort((a,b)=>b.length-a.length)) {
    try { await fs.rmdir(directory); }
    catch(error) { if(!['ENOENT','ENOTEMPTY'].includes(error.code)) throw error; }
  }
  const record={schemaVersion:1,output:root,files:[...files].sort(([a],[b])=>a.localeCompare(b)).map(([file,data])=>({path:file,sha256:sha256(data)}))};
  await fs.mkdir(stateDir,{recursive:true});
  const nextState=path.join(stateDir,`${randomUUID()}.json.tmp`);
  await fs.writeFile(nextState,`${JSON.stringify(record,null,2)}\n`,{flag:'wx'});
  await fs.rename(nextState,stateFile);
  console.log(`Built ${generatedPages.length} generated pages, brand.html and ${files.size-generatedPages.length-1} assets in ${path.relative(projectRoot,root)}/.`);
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
const btn=(label,href,cls='primary',current=false)=>`<a class="button ${cls}" href="${esc(href)}"${current?' aria-current="page"':''}>${label}${arrow}</a>`;
const interestLabels={websites:'Websites',ai:'AI agents',automation:'Admin & follow-up',software:'Custom software',marketing:'Marketing & print'};
const contact=(interest,scenario='',slug='')=>'contact.html?'+new URLSearchParams({interest:interestLabels[slug]||interest,...(scenario?{scenario}: {})});
const nav=[['index.html','Home','Home'],['solutions.html','Services','Solutions'],['industries.html','Who we help','Industries'],['about.html','About us','About']];
function header(active) {
  const links = nav.filter(([url]) => url !== 'index.html').map(([url, label, key]) => {
    const state = active === key ? ' aria-current="page"' : active === 'Service' && key === 'Solutions' ? ' class="is-current-section"' : '';
    return `<a href="${url}"${state}>${label}</a>`;
  });
  return `<a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header"><div class="container header-inner">
      <a class="brand" href="index.html" aria-label="ClearSign home"><img src="assets/brand/wordmark-light.svg" width="190" height="48" alt="ClearSign"></a>
      <button class="menu-toggle" aria-controls="main-nav" aria-expanded="false">Menu<span aria-hidden="true"></span></button>
      <nav id="main-nav" aria-label="Main navigation">${links.join('')}${btn('Get in touch', 'contact.html', 'nav-cta', active === 'Contact')}</nav>
    </div></header>`;
}
function footer(){return `<footer class="site-footer"><div class="container footer-grid"><div class="footer-brand"><a class="brand" href="index.html"><img src="assets/brand/wordmark-dark.svg" width="190" height="48" alt="ClearSign home"></a><p>Websites, business tools<br>and marketing.</p><span>Birmingham, UK</span></div><div><h2>Explore</h2>${nav.map(([url,label])=>`<a href="${url}">${label}</a>`).join('')}<a href="contact.html">Contact</a></div><div><h2>Services</h2>${services.map(s=>`<a href="${s.filename}">${esc(s.navTitle)}</a>`).join('')}</div><div><h2>Have a project in mind?</h2><p>Tell us about your business and the work you need help with.</p><a class="text-link" href="contact.html">Tell us what you need${arrow}</a></div></div><div class="container footer-bottom"><span>ClearSign Solutions · Local design preview</span><div><a href="brand.html">Brand kit</a><button class="motion-control" aria-pressed="false">Motion on</button></div></div></footer>`;}
function close(title='What would you like<br>to improve?'){return `<section class="close-section"><div class="container close-inner"><h2>${title}</h2><div><p>One service or a few together. Start with what you need.</p>${btn('Tell us what you need','contact.html')}</div></div></section>`;}
function layout(title,description,body,active='',home=false){return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#f7f6f2"><title>${esc(title)} | ClearSign Solutions</title><meta name="description" content="${esc(description)}"><link rel="icon" href="favicon.ico" sizes="16x16 32x32 48x48"><link rel="icon" type="image/png" sizes="32x32" href="assets/icons/favicon-32.png"><link rel="icon" type="image/png" sizes="16x16" href="assets/icons/favicon-16.png"><link rel="icon" type="image/svg+xml" sizes="any" href="assets/favicon.svg"><link rel="apple-touch-icon" sizes="180x180" href="assets/icons/apple-touch-icon.png"><link rel="manifest" href="site.webmanifest"><link rel="preload" href="assets/fonts/archivo-latin-wght.woff2" as="font" type="font/woff2" crossorigin>${home?'<link rel="preload" href="assets/hero-sculpture.png" as="image" media="(min-width: 701px)">':''}<link rel="stylesheet" href="assets/vendor/scrollcraft.css"><link rel="stylesheet" href="assets/css/website.css"><link rel="stylesheet" href="assets/css/service-visuals.css"><link rel="stylesheet" href="assets/css/solutions.css"><link rel="stylesheet" href="assets/css/scroll-story.css"><link rel="stylesheet" href="assets/css/refinement.css"><link rel="stylesheet" href="assets/css/clarity.css">${home?'<link rel="stylesheet" href="assets/css/hero-finish.css">':''}${home?'<script defer src="assets/vendor/scrollcraft.js"></script>':''}<script defer src="assets/js/website.js"></script>${home?'<script defer src="assets/js/scroll-story.js"></script>':''}</head><body${home?' class="home-page"':''}>${header(active)}<main id="main">${body}</main>${footer()}</body></html>`;}
function homeServiceGroup({title, services}) {
  const links = services.map(({slug, description}) => {
    const service = serviceBySlug[slug];
    return `<li><a class="offer-link" id="home-service-${slug}" href="${esc(service.filename)}">
      <span class="offer-name">${esc(service.navTitle)}${arrow}</span>
      <span class="offer-description">${esc(description)}</span>
    </a></li>`;
  });
  return `<section class="offer-group"><h3>${esc(title)}</h3><ul>${links.join('')}</ul></section>`;
}
const industries=[
{id:'salons',measure:'Booking enquiries, bookings recorded by your existing system and time spent answering routine service or price questions.',name:'Salons & barbers',line:'Make it easier to choose a service and book.',copy:'Put your services, prices and work in one place. Give clients a clear route to your existing booking system.',needs:['Service and price lists','Booking links and enquiry forms','Videos that show your work'],services:['websites','marketing','automation']},
{id:'restaurants',measure:'Useful callback messages, routine questions handled correctly and visits to your menu, ordering or reservation links.',name:'Restaurants & takeaways',line:'Help customers find your menu and make an enquiry.',copy:'Show your menu, opening times and directions, with links to your ordering or reservation system. A supervised AI phone trial could also help with common questions and messages.',needs:['Menus, opening times and directions','Links to ordering or reservations','A phone-assistant trial for routine questions'],services:['websites','ai','marketing']},
{id:'car-hire',measure:'Time spent collecting enquiry details, quotes followed up and enquiries that become hires where your records show that.',name:'Car hire',line:'Get the details you need to prepare a quote.',copy:'Show your vehicles and collect the customer’s dates, preferred car and contact details. Keep each request together so someone can check availability and reply.',needs:['Vehicle pages and hire enquiry forms','Customer details in one place','A reminder to follow up on quotes'],services:['websites','automation','software']},
{id:'trades',measure:'Complete quote requests, follow-ups completed and time spent gathering job details or chasing updates.',name:'Trades & garages',line:'Keep track of enquiries while you get on with the job.',copy:'Show the work you do and give customers a way to request a quote or callback. Organise those requests so the team knows who needs a reply.',needs:['Service pages and examples of your work','Quote requests and callback messages','Job records and follow-up reminders'],services:['websites','ai','automation']},
{id:'professional',measure:'Complete initial enquiries, time to a first reply and requests handed to the right person.',name:'Accountants & legal firms',line:'Make the first enquiry straightforward.',copy:'Explain your services and collect what the team needs for an initial conversation. Keep appointment requests and client details organised; your team handles advice and decisions.',needs:['Clear service pages','Appointment and callback requests','Client records and office reminders'],services:['websites','automation','software']}
];
const industryLinks=()=>`<div class="industry-links">${industries.map(i=>`<a href="industries.html#${i.id}"><span>${i.name}</span>${arrow}</a>`).join('')}</div>`;
const process=`<ol class="process-list"><li><span>01</span><div><h3>Tell us about your business</h3><p>Show us what takes time, what gets missed and which tools you already use.</p></div></li><li><span>02</span><div><h3>Agree the work and the cost</h3><p>We set out what we will build, what it costs and who will look after it.</p></div></li><li><span>03</span><div><h3>Review it before launch</h3><p>Try it with us, check the details and approve it before it goes live.</p></div></li></ol>`;
const home = `<section class="hero" data-sc-act="flow" id="hero" aria-labelledby="home-title">
  <div class="container hero-layout">
    <div class="hero-content">
      <p class="hero-eyebrow">For trades, salons and growing teams</p>
      <h1 id="home-title">Turn enquiries<br> <span class="hero-highlight">into customers.</span></h1>
      <p>Our websites, videos and print help people find you. When you’re busy, an AI agent (a digital assistant) can take a message so your team knows who to call back.</p>
      <div class="hero-actions">
        ${btn('Tell us what you need', 'contact.html')}
        <a class="text-link" href="#business-needs">Explore services${arrow}</a>
      </div>
      <p class="hero-local">Based in Birmingham. Working across the UK.</p>
    </div>
    <div class="hero-media">
      <div class="hero-sculpture-frame">
        <figure class="hero-poster" aria-hidden="true"><img src="assets/hero-sculpture.png" width="1320" height="1016" alt="" fetchpriority="high"></figure>
        <div id="hero-3d-stage" class="hero-3d-stage" aria-hidden="true"><canvas id="hero-3d-canvas"></canvas></div>
      </div>
      <div class="hero-media-footer">
        <span><a href="#business-story">See a car hire enquiry${arrow}</a></span>
        <button type="button" class="motion-control hero-motion" aria-pressed="false">Pause animations</button>
      </div>
    </div>
  </div>
</section>
<section class="section container solutions-intro home-offers" id="business-needs" data-sc-act="flow" aria-labelledby="business-needs-heading">
  <div class="offers-heading">
    <h2 id="business-needs-heading">Where do you need a hand?</h2>
    <a class="text-link" href="solutions.html">Compare all five services${arrow}</a>
  </div>
  <div class="offer-groups">${businessNeeds.map(homeServiceGroup).join('')}</div>
  <p class="offer-help">Unsure where to start? <a class="text-link" href="contact.html">Talk it through with us${arrow}</a></p>
</section>
${storyMarkup}
<section class="section container industries-intro" data-sc-act="flow"><div class="industry-copy"><h2>Built around<br>your business.</h2><p>From salon bookings to vehicle-hire enquiries, we fit the solution to the way your customers and team work.</p><div class="page-actions"><a class="text-link" href="industries.html">See ideas for your industry${arrow}</a><a class="text-link section-contact" href="contact.html">Tell us what you need${arrow}</a></div></div><div>${industryLinks()}</div></section>
<section class="approach-preview section" data-sc-act="flow"><div class="container approach-grid"><div><h2>A small team.<br>A clear plan.</h2><p>We’re a four-person team in Birmingham. Two of us build websites, AI agents and software. Two handle filming, marketing, customer relationships and print arrangements.</p><a class="text-link" href="about.html">Get to know ClearSign${arrow}</a></div>${process}</div></section>${close('Let’s talk about<br>your business.')}`;
function pageHero(label, title, intro, {service = false, actions = '', sample = ''} = {}) {
  return `<section class="page-hero${service ? ' service-page-hero' : ''}">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a><span aria-hidden="true">/</span>
        ${service ? '<a href="solutions.html">Services</a><span aria-hidden="true">/</span>' : ''}<span>${esc(label)}</span>
      </nav>
      <h1>${title}</h1><p>${intro}</p>${actions}${sample}
    </div>
  </section>`;
}
const solutions=pageHero('Services','Help your business grow<br>and work better.','Choose help with brand visibility, customer enquiries or the way your team works. We bring websites, marketing, AI agents and software together around the problem you want to solve.')+`
<nav class="container solution-jump" aria-label="Find a service">${solutionOverview.map(item=>`<a href="#${item.slug}">${esc(item.jump)}${arrow}</a>`).join('')}</nav>
<div class="container solution-overview">${solutionOverview.map(item=>{const service=serviceBySlug[item.slug];return `<section id="${item.slug}" class="solution-detail" aria-labelledby="solution-${item.slug}"><div class="solution-explanation"><h2 id="solution-${item.slug}">${esc(item.title)}</h2><p class="solution-problem">${esc(item.problem)}</p><p>${esc(item.provision)}</p><div class="solution-actions">${btn('Discuss this service',contact(service.interest,'',service.slug),'outline')}<a class="text-link" href="${service.filename}">${esc(item.link)}${arrow}</a></div></div><div class="solution-delivery"><h3>What you get</h3><ul class="check-list">${item.items.map(text=>`<li>${esc(text)}</li>`).join('')}</ul><div class="solution-benefit"><h3>What it helps with</h3><p>${esc(item.benefit)}</p></div></div></section>`;}).join('')}
<p class="solution-scope">Your proposal sets out the problem to solve, what we will deliver, the measures we will review, the timescale and the setup and ongoing costs.</p></div>
<section class="solution-connection section"><div class="container"><div class="editorial-heading"><h2>How services can<br>work together.</h2><p>For example, a car-hire business could connect its website to its customer records and follow-up tasks. This illustrates a possible project, not a live customer system.</p></div><ol class="connection-flow"><li><h3>A website enquiry</h3><p>The customer shares their preferred vehicle, dates and contact details.</p><a class="text-link" href="service-websites.html">Website services${arrow}</a></li><li><h3>Organised customer records</h3><p>The request is saved and assigned to someone in your team.</p><a class="text-link" href="service-automation.html">Admin &amp; follow-up${arrow}</a></li><li><h3>A reminder to reply</h3><p>That person checks availability, prepares a quote and follows up.</p><a class="text-link" href="service-automation.html">Admin &amp; follow-up${arrow}</a></li></ol></div></section>
<section class="section container delivery-support"><div><h2>We plan the handover<br>before we build.</h2><p>You should know what happens after launch as well as what you are getting on day one.</p></div><dl><div><dt>Build and test</dt><dd>We agree the work and costs, then test the website or system with you before it goes live.</dd></div><div><dt>Access and handover</dt><dd>Your proposal explains access, ownership and how your team will use what we deliver.</dd></div><div><dt>Maintenance and running costs</dt><dd>Website updates and support for delivered systems are agreed for your project, along with any costs for keeping the website online and any software charges.</dd></div><div><dt>Review the difference it makes</dt><dd>Choose a few useful measures before building, such as enquiry quality, time spent on admin or work completed. Review them alongside running costs and feedback from your team.</dd></div></dl></section>`+close();
const industryPage=pageHero('Who we help','Start with the work<br>you want to improve.','Whether you need to be better known, handle enquiries or organise the team, the right starting point depends on your business. These examples show what we could provide and what you could measure.')+`<nav class="container industry-jump" aria-label="Jump to a business type">${industries.map(i=>`<a href="#${i.id}">${i.name}</a>`).join('')}</nav><div class="container">${industries.map(i=>`<section class="industry-detail" id="${i.id}"><div><p class="section-label">${i.name}</p><h2>${i.line}</h2><p>${i.copy}</p><div class="industry-service-links"><h3>Services to consider</h3>${i.services.map(slug=>`<a class="text-link" href="${serviceBySlug[slug].filename}">${esc(serviceBySlug[slug].navTitle)}${arrow}</a>`).join('')}</div></div><div><h3>How we could help</h3><ul class="check-list">${i.needs.map(n=>`<li>${n}</li>`).join('')}</ul><p class="scope-note"><strong>What we could measure:</strong> ${esc(i.measure)}</p>${btn('Talk about your business',contact('Not sure yet',i.name),'dark')}</div></section>`).join('')}<div class="other-business"><h2>Don’t see your business here?</h2><p>These are examples, not a fixed list. Tell us what you do and where you need help.</p><a class="text-link" href="contact.html">Tell us about your business${arrow}</a></div><p class="scope-note">These are possible projects. We check your existing tools, agree what matters to your business and test any AI setup before customer use. Your team keeps control of advice, pricing and confirmations.</p></div>`+close();
const about=pageHero('About','A Birmingham team.<br>Built around your business.','We’re a four-person team: two technical partners and two marketing team members. Together, we build websites, AI agents and business tools, and create the videos and printed materials that help businesses get noticed.')+`<section class="section container about-intro" id="our-goal"><h2>Our goal.</h2><div><p class="large-copy">${esc(businessPurpose.mission)}</p><p>That could mean a clearer website, an assistant for routine enquiries, less repeated admin or videos that show your work. We start with the change you need and choose the tools around it.</p></div></section><section class="section pale"><div class="container about-intro" id="our-vision"><h2>Our vision.</h2><div><p class="large-copy">${esc(businessPurpose.vision)}</p><p>You should understand what a tool does, why it is useful and what it costs to keep running. We explain the options in plain English, work with your existing systems where possible and test changes with your team.</p></div></div></section><section class="section container principles" id="business-measures"><div class="industry-copy"><h2>Measure what<br>matters.</h2><p class="scope-note">Together, we choose a few measures of success. These are sometimes called KPIs: key performance indicators. The starting figures and your team’s feedback help us judge whether a change is worthwhile.</p></div><dl>${businessPurpose.measures.map(item=>`<div><dt>${esc(item.title)}</dt><dd>${esc(item.description)}</dd></div>`).join('')}</dl></section><section class="section pale"><div class="container approach-grid"><div><h2>A clear plan.<br>A practical first step.</h2><p>Start with one problem. We agree the deliverables, costs and support, then test the result with you. Your proposal explains how we will review the agreed measures and decide what to improve next.</p></div>${process}</div></section>`+close();
const contactPage=pageHero('Contact','What would make your<br>business work better?','Tell us whether you want to attract customers, be better known, reduce repeated work or help your team stay organised. We’ll start with the problem and check what you already use.')+`<section class="section container contact-grid"><aside><h2>You don’t need<br>all the answers yet.</h2><p>Tell us what happens today and what you would like to improve. You can describe the problem without choosing a service or knowing which technology you need.</p><dl class="contact-expect"><div><dt>Based in</dt><dd>Birmingham, UK</dd></div><div><dt>What to include</dt><dd>What your business does, the task or problem and the tools you already use. Include what a useful improvement would look like.</dd></div><div><dt>What comes next</dt><dd>We discuss the options, agree the work and costs, and choose a few useful ways to check the result.</dd></div></dl></aside><div class="enquiry-panel"><p class="form-notice"><strong>Preview only.</strong> You can try the enquiry form here, but nothing will be sent.</p><p class="form-requirements">Your name, email and message are required.</p><form id="enquiry-form" method="post" action="contact.html"><fieldset disabled><legend class="sr-only">Your enquiry</legend><p id="form-feedback" class="field-error" role="alert" hidden></p><div class="form-row"><div class="form-field"><label for="enquiry-name">Your name</label><input id="enquiry-name" name="name" autocomplete="name" required maxlength="100" aria-describedby="name-error"><p id="name-error" class="field-error" data-field-error hidden></p></div><div class="form-field"><label for="enquiry-business">Business name <span class="field-optional">(optional)</span></label><input id="enquiry-business" name="business" autocomplete="organization" maxlength="150" aria-describedby="business-error"><p id="business-error" class="field-error" data-field-error hidden></p></div></div><div class="form-field"><label for="enquiry-email">Email address</label><input id="enquiry-email" type="email" name="email" autocomplete="email" required maxlength="200" aria-describedby="email-error"><p id="email-error" class="field-error" data-field-error hidden></p></div><label>What are you interested in?<select name="interest"><option>Not sure yet</option>${services.map(s=>`<option>${esc(interestLabels[s.slug])}</option>`).join('')}</select></label><div class="form-field"><label for="enquiry-message">What would you like to improve?</label><span id="message-hint" class="field-hint">For example: “We spend hours chasing updates. We want the team to see job progress in one place.”</span><textarea id="enquiry-message" name="message" rows="5" maxlength="2000" required aria-describedby="message-hint message-error"></textarea><p id="message-error" class="field-error" data-field-error hidden></p></div><div id="scenario-note" class="scope-note" hidden><label id="context-label" for="enquiry-context">Business type (optional)</label><select id="enquiry-context" name="context" disabled><option value="">Not specified</option></select></div><button class="button dark" type="submit">Preview your enquiry${arrow}</button></fieldset></form><noscript><p>The local enquiry preview needs JavaScript. No information has been sent.</p></noscript><div id="enquiry-result" hidden role="status"><h2 id="enquiry-result-heading" tabindex="-1">Your enquiry preview</h2><dl id="enquiry-summary" class="enquiry-summary"></dl><p class="form-notice">Nothing has been sent or saved. You can go back and change any detail.</p><button id="edit-enquiry" type="button" class="button dark">Edit your details</button></div></div></section><section class="faq-section container"><h2>A few things to know</h2><div>${[['Do I need a whole package?','No. You can ask for one service or discuss several together.'],['Can you work with our existing tools?','We start by checking what you use. Sometimes a small change or connection is enough.'],['Can you give us a price now?','We need to understand the work first. Your quote will set out what is included, the cost and any ongoing charges.']].map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></section>`;
function servicePage(s){return `${pageHero(s.navTitle,esc(s.title),esc(s.intro),{service:true,sample:serviceVisuals[s.slug],actions:`<div class="page-actions">${btn('Discuss this service',contact(s.interest,'',s.slug))}<a class="text-link" href="#included">See what’s included${arrow}</a></div>`})}<nav class="container service-page-nav" aria-label="On this page"><a href="#included">What’s included</a><a href="#example">An example</a><a href="#results">How it helps</a><a href="#questions">Common questions</a></nav><section class="section container service-detail" id="included"><div><h2>What you get.</h2><p>${esc(s.benefit)}</p>${btn('Discuss this service',contact(s.interest,'',s.slug),'dark')}</div><div class="deliverables">${s.included.map(i=>`<article><h3>${esc(i.title)}</h3><p>${esc(i.description)}</p></article>`).join('')}</div></section><section class="example-section" id="example"><div class="container example-layout"><div><p class="section-label">Example project</p><h2>${esc(s.example.business)}</h2><p>${esc(s.example.trigger)}</p></div><div><ol class="example-steps">${s.example.steps.map((step,i)=>`<li><span>${i+1}</span><p>${esc(step)}</p></li>`).join('')}</ol><p class="example-outcome">${esc(s.example.outcome)}</p></div></div></section><section class="section container service-detail" id="results"><div><h2>How we check<br>it helps.</h2><p>${esc(s.measureIntro)}</p></div><div class="deliverables">${s.measures.map(m=>`<article><h3>${esc(m.title)}</h3><p>${esc(m.description)}</p></article>`).join('')}</div></section><section class="section container scope-grid"><h2>What we agree<br>before starting.</h2><ul class="check-list">${s.boundaries.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></section><section class="faq-section container" id="questions"><h2>Common questions</h2><div>${s.faqs.map(f=>`<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('')}</div></section><section class="related container"><h2>Related services</h2><div>${s.related.map(slug=>serviceBySlug[slug]).filter(Boolean).map(r=>`<a href="${r.filename}">${esc(r.navTitle)}${arrow}</a>`).join('')}</div></section>${close()}`;}
const pages=[['index.html','Websites, AI agents and automation','Websites, AI agents, software and marketing for businesses. Based in Birmingham.',home,'Home',true],['solutions.html','Services','Explore practical help for business growth, brand awareness, enquiries and teamwork through websites, AI agents, software and marketing.',solutions,'Solutions'],['industries.html','Who we help','Practical examples for salons, restaurants, car hire, trades, garages and professional firms, with useful measures to review.',industryPage,'Industries'],['about.html','About','ClearSign’s goal: help businesses grow, build brand recognition and improve how they work through marketing, AI and technology.',about,'About'],['contact.html','Contact','Describe what you want to improve in your business using the unsent ClearSign enquiry preview.',contactPage,'Contact'],...services.map(s=>[s.filename,s.navTitle,s.intro,servicePage(s),'Service'])];
await writeBuild(pages.map(([filename,...pageArgs])=>[filename,layout(...pageArgs)]));
