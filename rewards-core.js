/* Pure reward rules. No network, purchases, or expiring rewards. */
(function(root){
'use strict';
const DAY=86400000,MILESTONES=[30,50,100,180,365,500,1000];
const ITEMS=[
{id:'summit',type:'illustration',name:'The quiet summit',scene:'mountains',symbol:'△',color:'#ed9a60'},
{id:'grove',type:'illustration',name:'A place to grow',scene:'forest',symbol:'♧',color:'#b2d2af'},
{id:'orbit',type:'illustration',name:'Your own orbit',scene:'night',symbol:'☾',color:'#c6b5ef'},
{id:'tide',type:'illustration',name:'Steady as the tide',scene:'ocean',symbol:'≈',color:'#8dc8da'},
{id:'wall-summit',type:'wallpaper',name:'Keep climbing',scene:'mountains',quote:'One quiet step. A wider horizon.'},
{id:'wall-forest',type:'wallpaper',name:'Deep roots',scene:'forest',quote:'Give your attention to what you want to grow.'},
{id:'wall-ocean',type:'wallpaper',name:'Endless possibility',scene:'ocean',quote:'There is room for your next chapter.'},
{id:'wall-night',type:'wallpaper',name:'A thousand lights',scene:'night',quote:'Small lights make a remarkable sky.'},
{id:'sage',type:'theme',name:'Forest sage',color:'#aed1af'},
{id:'lavender',type:'theme',name:'Twilight lavender',color:'#c6b5ef'},
{id:'sea',type:'theme',name:'Ocean mist',color:'#8dc8da'},
{id:'ember',type:'badge',name:'Steady spark',symbol:'✦',color:'#ed9a60'},
{id:'lunar',type:'badge',name:'Night voyager',symbol:'☾',color:'#c6b5ef'},
{id:'compass',type:'badge',name:'True north',symbol:'✧',color:'#b2d2af'}];
function fresh(start){return {version:1,seed:String(start),run:'journey-0',serial:0,runs:[{id:'journey-0',start,awarded:0}],stars:[],gifts:[],theme:'default',featured:null,badge:null};}
function normalize(raw,start){if(!raw)return fresh(start);if(raw.version!==1||typeof raw.seed!=='string'||typeof raw.run!=='string'||!Number.isInteger(raw.serial)||!Array.isArray(raw.runs)||!Array.isArray(raw.stars)||!Array.isArray(raw.gifts))throw Error('Invalid rewards');const r=JSON.parse(JSON.stringify(raw));if(!r.runs.every(x=>typeof x.id==='string'&&Number.isFinite(Date.parse(x.start))&&Number.isInteger(x.awarded)&&x.awarded>=0)||!r.runs.some(x=>x.id===r.run)||!r.stars.every(x=>typeof x.id==='string'&&Number.isFinite(x.at))||!r.gifts.every(x=>typeof x.id==='string'&&Number.isFinite(x.at)&&Number.isInteger(x.day)&&x.day>0&&['weekly','milestone'].includes(x.kind)&&typeof x.opened==='boolean'&&((!x.opened&&x.item===null)||(typeof x.item==='string'&&!!item(x.item)))))throw Error('Invalid rewards');r.stars=[...new Map(r.stars.map(x=>[x.id,x])).values()];r.gifts=[...new Map(r.gifts.map(x=>[x.id,x])).values()];return r;}
function item(id){if(id.startsWith('milestone-')){const n=Number(id.slice(10));return MILESTONES.includes(n)?{id,type:'badge',name:`${n.toLocaleString()} days · ${n>=365?'Legacy':'Constellation'}`,symbol:n>=500?'♛':n>=100?'✺':'✦',color:n>=365?'#e8cc84':'#ed9a60',milestone:n}:null;}return ITEMS.find(x=>x.id===id);}
function hash(s){let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
function deck(seed,cycle){const a=ITEMS.map(x=>x.id);let n=hash(seed+':'+cycle);function rand(){n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;}for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function reconcile(r,start,now){const run=r.runs.find(x=>x.id===r.run);run.start=start;const days=Math.max(0,Math.floor((now-Date.parse(start))/DAY)),before=run.awarded;let weekly=r.gifts.filter(x=>x.kind==='weekly').length;const ids=new Set(r.gifts.map(x=>x.id));for(let d=before+1;d<=days;d++){const at=Date.parse(start)+d*DAY;r.stars.push({id:run.id+':day:'+d,at});for(const kind of [ ...(d%7===0?['weekly']:[]),...(MILESTONES.includes(d)?['milestone']:[])]){const id=run.id+':'+kind+':'+d;if(!ids.has(id)){const reward=kind==='milestone'?'milestone-'+d:null;r.gifts.push({id,kind,day:d,at,item:reward,opened:false});ids.add(id);}}}run.awarded=Math.max(before,days);return Math.max(0,days-before);}
function restart(r,start){r.serial++;r.run='journey-'+r.serial;r.runs.push({id:r.run,start,awarded:0});}
function open(r,id){const g=r.gifts.find(x=>x.id===id);if(!g||g.opened)return null;if(g.kind==='weekly'){const count=r.gifts.filter(x=>x.kind==='weekly'&&x.opened).length;g.item=deck(r.seed,Math.floor(count/ITEMS.length))[count%ITEMS.length];}g.opened=true;return item(g.item);}
function owns(r,id){return r.gifts.some(g=>g.opened&&g.item===id);}
const api={DAY,MILESTONES,ITEMS,fresh,normalize,item,deck,reconcile,restart,open,owns};root.JourneyRewards=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);

