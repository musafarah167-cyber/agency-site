(() => {
'use strict';
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 860px)');
let paused=false,engine=null,heroScene=null,queued=false;
const menu=document.querySelector('.menu-toggle'),nav=document.getElementById('main-nav');
const header=menu?.closest('.site-header');
function closeMenu(){menu?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
header?.addEventListener('focusout',e=>{if(!header.contains(e.relatedTarget))closeMenu();});
document.addEventListener('pointerdown',e=>{if(header&&!header.contains(e.target))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
root.classList.add('js-enhanced');
mobile.addEventListener('change',()=>{if(!mobile.matches)closeMenu();configureMotion();});
function configureMotion(){
 const off=paused||reduced.matches;
 engine?.destroy();engine=null;
 root.classList.toggle('motion-off',off);
 const journey=document.getElementById('connected-work');
 if(journey){journey.dataset.scAct='flow';journey.style.height='';}
 document.querySelectorAll('.motion-control').forEach(b=>{b.textContent=reduced.matches?'Reduced motion':paused?'Motion off':'Motion on';b.setAttribute('aria-pressed',String(off));b.setAttribute('aria-label',reduced.matches?'Reduced motion enabled':paused?'Turn motion on':'Turn motion off');b.disabled=reduced.matches;});
 if(!off&&window.ScrollCraft&&document.querySelector('[data-sc-act]')){try{engine=window.ScrollCraft.mount(document);}catch(e){root.classList.add('motion-off');}}
 // Readable static mode is also ready, with no hidden content or extra pinned space.
 if(off)root.classList.add('sc-ready');
 heroScene?.setPaused(off);
 updateProgress();
}
function updateProgress(){
 queued=false;
 const hero=document.getElementById('hero');
 if(hero&&heroScene)heroScene.setProgress(Math.max(0,Math.min(1,scrollY/Math.max(hero.offsetHeight,1))));
 const journey=document.getElementById('connected-work');
 if(journey){const act=engine?.acts?.find(a=>a.el===journey);const progress=paused||reduced.matches||mobile.matches?1:Math.max(.05,Math.min(1,((act?.p??0)-.18)/.64));journey.style.setProperty('--journey-progress',String(progress));journey.dataset.progress=progress.toFixed(3);journey.querySelectorAll('#journey-steps li').forEach((li,i)=>li.classList.toggle('is-active',progress>=i/3));}
}
window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateProgress);}},{passive:true});
document.querySelectorAll('.motion-control').forEach(b=>b.addEventListener('click',()=>{paused=!paused;configureMotion();}));
reduced.addEventListener('change',configureMotion);
configureMotion();
const heroStage=document.getElementById('hero-3d-stage');
if(heroStage){import('./hero-3d.js').then(async m=>{heroScene=await m.initHeroScene({canvas:document.getElementById('hero-3d-canvas'),stage:heroStage,onReady:ready=>document.getElementById('hero').classList.toggle('has-3d',ready!==false)});heroScene.setPaused(paused||reduced.matches);updateProgress();}).catch(()=>{heroStage.dataset.hero3d='fallback';document.getElementById('hero').classList.remove('has-3d');});}
const form=document.getElementById('enquiry-form');
if(form){
 const result=document.getElementById('enquiry-result');
 const params=new URLSearchParams(location.search);
 const scenario=params.get('scenario');
 const aliases={'Website & enquiries':'Websites','Marketing & branding':'Marketing & print','AI & automation':scenario==='Phone enquiry'?'AI agents':'Admin & follow-up'};
 const requested=params.get('interest');
 const interest=aliases[requested]||requested;
 const interests=[...form.elements.interest.options].map(o=>o.value);
 if(interests.includes(interest))form.elements.interest.value=interest;
 const topics=['Website enquiry','Phone enquiry','Repeated admin'];
 const businesses=['Salons & barbers','Restaurants & takeaways','Car hire','Trades & garages','Accountants & legal firms'];
 const contexts=[...topics,...businesses,'Restaurants','Professional firms'];
 const workflowContext=topics.includes(scenario);
 const contextInput=form.elements.context;
 let contextChoices=[];
 if(contexts.includes(scenario)){
  const note=document.getElementById('scenario-note');
  contextChoices=workflowContext?[...topics]:[...businesses];
  if(!contextChoices.includes(scenario))contextChoices.push(scenario);
  contextInput.replaceChildren(...['',...contextChoices].map(value=>{const option=document.createElement('option');option.value=value;option.textContent=value||'Not specified';return option;}));
  contextInput.value=scenario;contextInput.disabled=false;
  document.getElementById('context-label').textContent=workflowContext?'Enquiry topic (optional)':'Business type (optional)';
  note.hidden=false;
 }
 const examples={
  'Not sure yet':'For example: “We miss calls while working and need a better way to take messages.”',
  'Websites':'For example: “We need a website where people can see our services and request a booking.”',
  'AI agents':'For example: “Our team is busy serving customers. We need help answering routine questions and taking messages.”',
  'Admin & follow-up':'For example: “Our enquiries are spread across emails and spreadsheets. We need to keep track of who needs a reply.”',
  'Custom software':'For example: “We need one place for staff to see job details and update their progress.”',
  'Marketing & print':'For example: “We would like a short video of our work and tap-to-share cards for the team.”'
 };
 const updateHint=()=>{document.getElementById('message-hint').textContent=examples[form.elements.interest.value]||examples['Not sure yet'];};
 form.elements.interest.addEventListener('change',updateHint);updateHint();
 const requiredText=[['name','Enter your name.'],['message','Tell us what you would like to improve.']];
 const validateText=(field,message)=>field.setCustomValidity(field.value.trim()?'':message);
 requiredText.forEach(([name,message])=>form.elements[name].addEventListener('input',()=>validateText(form.elements[name],message)));
 form.addEventListener('submit',e=>{
  e.preventDefault();requiredText.forEach(([name,message])=>validateText(form.elements[name],message));if(!form.reportValidity())return;
  const data=new FormData(form),summary=document.getElementById('enquiry-summary');
  const selectedContext=contextInput.value;
  const rows=[['Name',String(data.get('name')).trim()],['Business',String(data.get('business')||'').trim()||'Not provided'],['Email',data.get('email')],['Service',data.get('interest')],...(contextChoices.includes(selectedContext)?[[workflowContext?'Enquiry about':'Business type',selectedContext]]:[]),['What you need',String(data.get('message')).trim()]];
  summary.replaceChildren(...rows.map(([label,value])=>{const row=document.createElement('div'),term=document.createElement('dt'),description=document.createElement('dd');term.textContent=label;description.textContent=String(value);row.append(term,description);return row;}));
  form.hidden=true;result.hidden=false;document.getElementById('enquiry-result-heading').focus();
 });
 document.getElementById('edit-enquiry').addEventListener('click',()=>{result.hidden=true;form.hidden=false;form.elements.name.focus();});
 form.querySelector('fieldset').disabled=false;
}
window.addEventListener('pagehide',e=>{engine?.destroy();engine=null;if(!e.persisted)heroScene?.dispose();else heroScene?.setPaused(true);});
window.addEventListener('pageshow',e=>{if(e.persisted)configureMotion();});
})();
