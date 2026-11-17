(() => {
'use strict';
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 860px)');
const motionPreferenceKey='clearsign.motion';
let paused=false,engine=null,heroScene=null,queued=false;
try{paused=localStorage.getItem(motionPreferenceKey)==='off';}catch{/* A blocked preference store must not break the page. */}
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
  'Not sure yet':'For example: “We spend hours chasing updates. We want the team to see job progress in one place.”',
  'Websites':'For example: “We want customers to understand our services and find the booking link easily.”',
  'AI agents':'For example: “Our team is busy serving customers. We need help answering routine questions and taking messages.”',
  'Admin & follow-up':'For example: “Our enquiries are spread across emails and spreadsheets. We need to keep track of who needs a reply.”',
  'Custom software':'For example: “We need one place for staff to see job details, update progress and spot overdue work.”',
  'Marketing & print':'For example: “We want people to recognise our business, with a short video and tap-to-open cards for the team.”'
 };
 const updateHint=()=>{document.getElementById('message-hint').textContent=examples[form.elements.interest.value]||examples['Not sure yet'];};
 form.elements.interest.addEventListener('change',updateHint);updateHint();
 const feedback=document.getElementById('form-feedback');
 const fields=[
  {name:'name',missing:'Enter your name.',tooLong:'Keep your name to 100 characters or fewer.'},
  {name:'business',tooLong:'Keep the business name to 150 characters or fewer.'},
  {name:'email',missing:'Enter your email address.',invalid:'Enter an email address such as name@example.com.',tooLong:'Keep your email address to 200 characters or fewer.'},
  {name:'message',missing:'Tell us what you would like to improve.',tooLong:'Keep your message to 2,000 characters or fewer.'}
 ];
 let attempted=false;
 function fieldMessage(rule){
  const field=form.elements[rule.name];
  if(field.required&&!field.value.trim())return rule.missing;
  if(rule.invalid&&field.validity.typeMismatch)return rule.invalid;
  if(field.maxLength>=0&&field.value.length>field.maxLength)return rule.tooLong;
  return '';
 }
 function validateField(rule){
  const field=form.elements[rule.name],error=document.getElementById(rule.name+'-error'),message=fieldMessage(rule);
  field.setCustomValidity(message);error.textContent=message;error.hidden=!message;
  if(message)field.setAttribute('aria-invalid','true');else field.removeAttribute('aria-invalid');
  return !message;
 }
 fields.forEach(rule=>form.elements[rule.name].addEventListener('input',()=>{
  if(!attempted)return;
  validateField(rule);
  if(fields.every(item=>!fieldMessage(item)))feedback.hidden=true;
 }));
 form.addEventListener('submit',e=>{
  e.preventDefault();attempted=true;
  const invalid=fields.filter(rule=>!validateField(rule));
  if(invalid.length){feedback.textContent='Check the highlighted details below. Nothing has been sent.';feedback.hidden=false;form.elements[invalid[0].name].focus();return;}
  feedback.hidden=true;
  const data=new FormData(form),summary=document.getElementById('enquiry-summary');
  const selectedContext=contextInput.value;
  const rows=[['Name',String(data.get('name')).trim()],['Business',String(data.get('business')||'').trim()||'Not provided'],['Email',String(data.get('email')).trim()],['Service',data.get('interest')],...(contextChoices.includes(selectedContext)?[[workflowContext?'Enquiry about':'Business type',selectedContext]]:[]),['What you need',String(data.get('message')).trim()]];
  summary.replaceChildren(...rows.map(([label,value])=>{const row=document.createElement('div'),term=document.createElement('dt'),description=document.createElement('dd');term.textContent=label;description.textContent=String(value);row.append(term,description);return row;}));
  const subject = 'ClearSign project enquiry' + (data.get('interest') === 'Not sure yet' ? '' : ' – ' + data.get('interest'));
  const body = rows.map(([label,value]) => label + ': ' + value).join('\n\n').replace(/\r?\n/g, '\r\n');
  document.getElementById('send-enquiry-email').href = 'mailto:' + form.dataset.recipient
    + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  form.hidden=true;result.hidden=false;document.getElementById('enquiry-result-heading').focus();
 });
 document.getElementById('edit-enquiry').addEventListener('click',()=>{attempted=false;feedback.hidden=true;result.hidden=true;form.hidden=false;form.elements.name.focus();});
 form.noValidate=true;
 form.querySelector('fieldset').disabled=false;
}
window.addEventListener('pagehide',e=>{engine?.destroy();engine=null;if(!e.persisted)heroScene?.dispose();else heroScene?.setPaused(true);});
window.addEventListener('pageshow',e=>{if(e.persisted){try{paused=localStorage.getItem(motionPreferenceKey)==='off';}catch{}configureMotion();}});
window.addEventListener('storage',e=>{if(e.key===motionPreferenceKey){paused=e.newValue==='off';configureMotion();}});
})();
