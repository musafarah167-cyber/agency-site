(() => {
'use strict';
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 860px)');
let paused=false,engine=null,heroScene=null,queued=false;
const menu=document.querySelector('.menu-toggle'),nav=document.getElementById('main-nav');
function closeMenu(){menu?.setAttribute('aria-expanded','false');nav?.classList.remove('is-open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
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
 if(!off&&window.ScrollCraft){try{engine=window.ScrollCraft.mount(document);}catch(e){root.classList.add('motion-off');}}
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
 const result=document.getElementById('enquiry-result');const params=new URLSearchParams(location.search);const requestedInterest=params.get('interest');const interest=requestedInterest==='Marketing & branding'?'Marketing & print':requestedInterest;const interests=[...form.elements.interest.options].map(o=>o.value);if(interests.includes(interest))form.elements.interest.value=interest;
 const scenario=params.get('scenario');if(['Website enquiry','Phone enquiry','Repeated admin','Salons & barbers','Restaurants','Car hire','Professional firms'].includes(scenario)){const note=document.getElementById('scenario-note');note.textContent='Enquiry about: '+scenario;note.hidden=false;}
 form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const d=new FormData(form);document.getElementById('enquiry-summary').textContent=`${d.get('name')} · ${d.get('business')}\n${d.get('email')}\nInterested in: ${d.get('interest')}\n\n${d.get('message')}`;form.hidden=true;result.hidden=false;document.getElementById('edit-enquiry').focus();});
 document.getElementById('edit-enquiry').addEventListener('click',()=>{result.hidden=true;form.hidden=false;form.elements.name.focus();});
 form.querySelector('fieldset').disabled=false;
}
window.addEventListener('pagehide',e=>{engine?.destroy();engine=null;if(!e.persisted)heroScene?.dispose();else heroScene?.setPaused(true);});
window.addEventListener('pageshow',e=>{if(e.persisted)configureMotion();});
})();
