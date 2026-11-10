'use strict';
const INITIAL='2026-10-31T23:55:19+05:30', KEY='myjourney.tracker.v2', LEGACY_KEY='nonut.tracker.v1', DAY=86400000;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const dateFormat=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Colombo',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
const fmt=t=>dateFormat.format(new Date(t));
function elapsed(start,now=Date.now()){const total=Math.max(0,Math.floor((now-new Date(start).getTime())/1000));return {days:Math.floor(total/86400),hours:Math.floor(total/3600)%24,minutes:Math.floor(total/60)%60,seconds:total%60};}
function migrate(s){if(!s||typeof s.start!=='string'||!Number.isFinite(Date.parse(s.start))||!Array.isArray(s.history)||!s.history.every(h=>h&&Number.isFinite(h.start)&&Number.isFinite(h.end)&&h.end>=h.start))throw Error('Invalid journey data');return {version:2,start:s.start,history:s.history.map(h=>({start:h.start,end:h.end})),reflection:typeof s.reflection==='string'?s.reflection.slice(0,4000):'',paused:s.paused===true,animations:s.animations!==false,rewards:JourneyRewards.normalize(s.rewards,s.start)};}
let state=migrate({start:INITIAL,history:[]}),storageWarning=false;
try{const current=localStorage.getItem(KEY),legacy=localStorage.getItem(LEGACY_KEY);if(current||legacy)state=migrate(JSON.parse(current||legacy));if(!current){localStorage.setItem(KEY,JSON.stringify(state));if(legacy)localStorage.removeItem(LEGACY_KEY);}}catch(e){storageWarning=true;}
function toast(message){$('#toast').textContent=message;$('#toast').style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').style.display='none',5000);}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));return true;}catch(e){toast('Browser storage is unavailable. Download a backup to keep your progress.');return false;}}
function duration(ms){const e=elapsed(0,ms);return `${e.days}d ${e.hours}h ${e.minutes}m`;}
function updateCounterValue(key,value){
  const node=$('#'+key),text=key==='days'?value.toLocaleString('en-US',{minimumIntegerDigits:2}):String(value).padStart(2,'0');
  const initialized=node.dataset.initialized==='true';
  node.dataset.initialized='true';
  if(node.textContent===text)return;
  node.textContent=text;
  if(key==='days')node.style.setProperty('--day-digits',String(text.length));
  node.classList.remove('number-changed');
  if(initialized&&state.animations&&!motion.matches&&!document.hidden&&!$('#home').hidden){
    void node.offsetWidth;
    node.classList.add('number-changed');
  }
}
function refresh(){window.rewardUI?.tick();const now=Date.now(),e=elapsed(state.start,now);for(const k of ['days','hours','minutes','seconds'])updateCounterValue(k,e[k]);$('#clock').textContent=fmt(now);$('#clock').dateTime=new Date(now).toISOString();$('#since').textContent='Since '+fmt(state.start);$('#settings-start').textContent=fmt(state.start);const current=Math.max(0,now-Date.parse(state.start)),best=state.history.reduce((v,h)=>Math.max(v,h.end-h.start),current);$('#stats').innerHTML=[[e.days,'Current streak · days'],[Math.floor(best/DAY),'Personal best · days'],[state.history.length,'Previous journeys']].map(([v,l])=>`<div class="stat"><strong>${v}</strong><span>${l}</span></div>`).join('');$('#history').innerHTML=state.history.slice().reverse().map(h=>`<div class="row"><div>${fmt(h.start)}<small>Ended ${fmt(h.end)}</small></div><strong>${duration(h.end-h.start)}</strong></div>`).join('')||'<p>Your journey is unfolding. Previous streaks will appear here after a reset.</p>';const ranked=[...state.history.map(h=>({...h,current:false})),{start:Date.parse(state.start),end:Math.max(Date.parse(state.start),now),current:true}].sort((a,b)=>(b.end-b.start)-(a.end-a.start));$('#rankings').innerHTML=ranked.map((h,i)=>`<div class="row"><strong>#${i+1}</strong><div style="flex:1">${h.current?'Current streak':'Previous journey'}<small>Since ${fmt(h.start)}</small></div><strong>${duration(h.end-h.start)}</strong></div>`).join('');$('#reflection-display').textContent=state.reflection||'Your next reflection starts with a single thought.';}
function route(){const page=['home','statistics','leaderboard','rewards','settings'].includes(location.hash.slice(1))?location.hash.slice(1):'home';$$('.page').forEach(p=>p.hidden=p.id!==page);$$('nav a').forEach(a=>{a.classList.toggle('active',a.dataset.page===page);if(a.dataset.page===page)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
window.addEventListener('hashchange',()=>{route();window.scrollTo(0,0);});
$$('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('#edit-start').onclick=()=>{$('#start-input').value=new Date(Date.parse(state.start)+19800000).toISOString().slice(0,19);$('#edit-error').textContent='';$('#editor').showModal();};
$('#edit-form').onsubmit=e=>{e.preventDefault();const value=$('#start-input').value,stamp=(value.length===16?value+':00':value)+'+05:30';if(!Number.isFinite(Date.parse(stamp))||Date.parse(stamp)>Date.now()){$('#edit-error').textContent='Choose a valid starting time in the past.';return;}JourneyRewards.reconcile(state.rewards,state.start,Date.now());state.start=stamp;const ok=save();refresh();$('#editor').close();if(ok)toast('Your starting point has been saved.');};
function openReflection(){$('#reflection-input').value=state.reflection;$('#reflection').showModal();}
$('#reflect').onclick=openReflection;$('#edit-reflection').onclick=openReflection;
$('#reflection-form').onsubmit=e=>{e.preventDefault();state.reflection=$('#reflection-input').value.trim();const ok=save();refresh();$('#reflection').close();if(ok)toast('Your reflection has been saved.');};
$('#reset').onclick=()=>{if(!confirm('Begin a fresh chapter? Your streak history, stars, and all earned gifts will stay with you.'))return;const now=Date.now();JourneyRewards.reconcile(state.rewards,state.start,now);state.history.push({start:Math.min(now,Date.parse(state.start)),end:now});state.start=new Date(now).toISOString();JourneyRewards.restart(state.rewards,state.start);const ok=save();refresh();if(ok)toast('Your progress still belongs to you. A fresh chapter starts here.');};
$('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='my-journey-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('#import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const incoming=migrate(JSON.parse(await f.text()));if(Date.parse(incoming.start)>Date.now())throw Error();if(confirm('Replace your saved journey with this backup?')){state=incoming;const ok=save();refresh();syncPause();scheduleScene();if(ok)toast('Your journey has been restored.');}}catch(e){toast('Please choose a valid journey backup.');}finally{$('#import').value='';}};
const quotes=[
'Become someone you’re proud of, one quiet choice at a time.',
'A small step forward is still a step forward.',
'You don’t need to see the whole path to take the next step.',
'Discipline is a promise you keep to yourself.',
'Let today be shaped by the person you want to become.',
'Your pace is your own. Keep moving.',
'The little things you repeat become the life you build.',
'A difficult moment is a moment, not your whole story.',
'Choose the next right thing. Then choose it again.',
'Make room for the future you’re working toward.',
'Breathe deeply. Begin again. Keep going.',
'Quiet effort has a way of becoming visible progress.',
'You can be a work in progress and still be proud.',
'Give your attention to what you want to grow.',
'Every sunrise brings space for a new choice.',
'Let patience be part of your strength.',
'Build a life that feels good to come home to.',
'The journey grows with every ordinary day.',
'You are allowed to grow at a human pace.',
'Today is a chance to practice who you want to be.',
'Consistency begins with what you choose right now.',
'Be gentle with yourself. Be steady with your intention.',
'There is strength in returning to what matters.',
'Your next chapter is written in today’s choices.'
];
const scenes=[{file:'mountains',label:'ABOVE THE NOISE'},{file:'forest',label:'ROOTED IN THE PRESENT'},{file:'ocean',label:'ROOM TO BREATHE'},{file:'night',label:'A WIDER PERSPECTIVE'}];
const motion=window.matchMedia('(prefers-reduced-motion: reduce)');let sceneIndex=0,activeLayer=0,sceneTimer,sceneBusy=false;
function fillScene(layer,index){const scene=scenes[index%scenes.length];layer.style.backgroundImage=`linear-gradient(180deg,rgba(0,0,0,.40),rgba(0,0,0,.48) 30%,rgba(0,0,0,.80)),url("assets/${scene.file}.jpg")`;layer.replaceChildren();const quote=document.createElement('blockquote');quote.textContent=quotes[index%quotes.length];layer.append(quote);}
function sceneMeta(){$('#scene-name').textContent=scenes[sceneIndex%scenes.length].label;$('#scene-count').textContent=String(sceneIndex%quotes.length+1).padStart(2,'0')+' / '+quotes.length;}
function scheduleScene(){clearTimeout(sceneTimer);if(!state.paused&&!motion.matches&&state.animations&&!document.hidden)sceneTimer=setTimeout(nextScene,30000);}
function nextScene(){if(sceneBusy)return;sceneBusy=true;sceneIndex=(sceneIndex+1)%quotes.length;const layers=[$('#scene-a'),$('#scene-b')],next=1-activeLayer;fillScene(layers[next],sceneIndex);layers[next].classList.add('visible');layers[next].removeAttribute('aria-hidden');layers[activeLayer].classList.remove('visible');layers[activeLayer].setAttribute('aria-hidden','true');activeLayer=next;sceneMeta();setTimeout(()=>sceneBusy=false,(motion.matches||!state.animations)?0:1450);scheduleScene();}
function syncPause(){document.documentElement.classList.toggle('no-animations',!state.animations);const stopped=state.paused||motion.matches||!state.animations;$('#pause').textContent=stopped?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',motion.matches?'Automatic rotation disabled by reduced-motion preference':stopped?'Resume automatic inspiration':'Pause automatic inspiration');$('#pause').disabled=motion.matches||!state.animations;$('#pause').setAttribute('aria-pressed',String(stopped));}
$('#next').onclick=nextScene;$('#pause').onclick=()=>{state.paused=!state.paused;save();syncPause();scheduleScene();};motion.addEventListener('change',()=>{syncPause();scheduleScene();});
for(const s of scenes){const img=new Image();img.src=`assets/${s.file}.jpg`;}
fillScene($('#scene-a'),0);$('#scene-b').setAttribute('aria-hidden','true');sceneMeta();syncPause();scheduleScene();
function resume(){refresh();scheduleScene();}
document.addEventListener('visibilitychange',resume);window.addEventListener('pageshow',resume);window.addEventListener('focus',refresh);window.addEventListener('storage',e=>{if(e.key===KEY&&e.newValue){try{state=migrate(JSON.parse(e.newValue));refresh();syncPause();scheduleScene();}catch(e){}}});
route();refresh();setInterval(refresh,1000);if(storageWarning)toast('Saved data could not be loaded. Restore a backup before changing your starting point.');
