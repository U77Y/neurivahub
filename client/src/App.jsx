import React from 'react'
import * as ReactDOM from 'react-dom/client'
import htm from 'htm'
import * as LucideReact from 'lucide-react'
import './index.css'

const {useState,useEffect}=React, html=htm.bind(React.createElement);
const L=LucideReact;
const Ic=({n,s=24,c='var(--p)'})=>{const C=L[n]||L.Zap;return html`<span class="ib" style=${{color:c}}><${C} size=${s} color="currentColor"/></span>`};
const LS={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const COURSES=[[1,'Coding','TSh 40,000','Beginner','Code2'],[2,'AI','TSh 60,000','Intermediate','Brain'],[3,'Design','TSh 35,000','Beginner','PenTool'],[4,'Arduino','TSh 45,000','Beginner','Cpu'],[5,'Web Dev','TSh 50,000','Intermediate','Globe'],[6,'Startup','TSh 30,000','All levels','Rocket']].map(a=>({id:a[0],t:a[1],p:a[2],l:a[3],e:a[4]}));
const PROJ=[['Soko Bot','AI','Bot'],['Smart Duka','Hardware','Cpu'],['Mbeya Eats','Web','Utensils'],['Kanga UI Kit','Design','Palette'],['Solar Tracker','Hardware','Sun'],['Swahili Chat','AI','MessageCircle']];
const EVENTS=[['Hack Night Mbeya','Nov 8','Mbeya Tech Hub'],['Arduino Bootcamp','Nov 22','Dar es Salaam'],['Demo Day 2026','Dec 5','Iringa'],['Design Jam','Dec 14','Online']];
const PLANS=[['Free','0','Community access|Intro workshops|Public projects'],['Pro','25,000','All courses|Mentor sessions|Event priority|Certificate'],['Premium','60,000','Everything in Pro|1-on-1 coaching|Startup pitch slot|Hub workspace']];
const NAV=['about','courses','projects','events','pricing','contact'];
const route=()=>(location.hash.replace('#/','')||'home');
// ---- Talk to the backend (server/server.js) ----
const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api'
const api=async(path,opt={},token)=>{
  const r=await fetch(API+path,{method:opt.method||'GET',
    headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},
    body:opt.body?JSON.stringify(opt.body):undefined})
  const d=await r.json().catch(()=>({}))
  if(!r.ok)throw new Error(d.error||'Request failed')
  return d}
// Has this logged-in user registered for this event?
const has=(e,A)=>A.me&&(e.attendees||[]).includes(A.me.id)

function App(){
 const [r,setR]=useState(route());
 const [open,setOpen]=useState(false),[modal,setModal]=useState(null),[toast,setToast]=useState('');
 const [users,setUsers]=useState([]),[courses,setCourses]=useState([]),[events,setEvents]=useState([]);
 const [projects,setProjects]=useState([]),[msgs,setMsgs]=useState([]),[stats,setStats]=useState(null);
 const [me,setMe]=useState(LS.get('nv_me',null));
 const [theme,setTheme]=useState(LS.get('nv_theme',{logo:'NEURIVAHUB',p:'#FF2DA6',c:'#D4FF3F'}));
 useEffect(()=>{const f=()=>{setR(route());setOpen(false);scrollTo(0,0)};addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f)},[]);
 useEffect(()=>{document.documentElement.style.setProperty('--p',theme.p);document.documentElement.style.setProperty('--c',theme.c);LS.set('nv_theme',theme)},[theme]);
  useEffect(()=>LS.set('nv_me',me),[me]);
 const say=m=>{setToast(m);setTimeout(()=>setToast(''),2400)};
 const token=me&&me.token;
 // Load data from the API (admin gets extra data)
 const load=()=>{
  api('/courses').then(d=>setCourses(d.map(c=>({id:c._id,t:c.title,p:c.price,l:c.level,e:c.icon})))).catch(()=>say('Cannot reach the server'));
  api('/events').then(setEvents).catch(()=>{});api('/projects').then(setProjects).catch(()=>{});
  if(me&&me.role==='admin'){api('/users',{},token).then(setUsers).catch(()=>{});api('/contact',{},token).then(setMsgs).catch(()=>{});api('/stats',{},token).then(setStats).catch(()=>{})}
 };
 useEffect(load,[me]);
 const need=fn=>(...a)=>me?fn(...a):(setModal('login'),say('Please log in first'));
 const reg=need(id=>api('/events/'+id+'/register',{method:'POST'},token).then(()=>{say('Registered');load()}).catch(e=>say(e.message)));
 const A={me,token,say,users,courses,events,projects,msgs,stats,theme,setTheme,reg,need,setModal,load};
 return html`<div>
  <${Nav} r=${r} open=${open} setOpen=${setOpen} A=${A} setMe=${setMe}/>
  ${r==='admin'?html`<${Admin} A=${A}/>`:html`<main>
   ${r==='home'&&html`<${Home}/>`}
   ${(r==='home'||r==='about')&&html`<${About}/>`}
   ${(r==='home'||r==='courses')&&html`<${Courses} A=${A}/>`}
   ${(r==='home'||r==='projects')&&html`<${Projects} A=${A}/>`}
   ${(r==='home'||r==='events')&&html`<${Events} A=${A}/>`}
   ${(r==='home'||r==='pricing')&&html`<${Pricing} A=${A} setMe=${setMe}/>`}
   ${(r==='home'||r==='contact')&&html`<${Contact} A=${A}/>`}
  </main>`}
  <${Footer} A=${A}/>
  ${modal&&html`<${Auth} mode=${modal} setMode=${setModal} A=${A} setMe=${setMe}/>`}
  ${toast&&html`<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] chip text-base px-6 py-3">${toast}</div>`}
 </div>`}

function Nav({r,open,setOpen,A,setMe}){
 const NL=({to,children})=>html`<a href=${'#/'+to} class=${'font-bold uppercase text-sm hover:text-[var(--c)] '+(r===to?'ch':'')}>${children}</a>`;
 return html`<header class="sticky top-0 z-50 bg-[#0B0B0B]/90 backdrop-blur border-b border-[#222]" style=${{top:0}}>
  <div class="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
   <a href="#/" class="big text-2xl pk">${A.theme.logo}</a>
   <nav class="hidden md:flex gap-6 items-center">${NAV.map(n=>html`<${NL} to=${n}>${n}<//>`)}
    ${A.me?html`<${React.Fragment}>${A.me.role==='admin'&&html`<${NL} to="admin">Admin<//>`}<button class="btn s o" onClick=${()=>{setMe(null);A.say('Logged out')}}>Logout</button><//>`:html`<button class="btn s" onClick=${()=>A.setModal('login')}>Login</button>`}</nav>
   <button class="md:hidden text-3xl" aria-label="menu" onClick=${()=>setOpen(!open)}>${open?html`<${L.X} size=${32}/>`:html`<${L.Menu} size=${32}/>`}</button>
  </div>
  ${open&&html`<div class="md:hidden px-5 pb-5 flex flex-col gap-4">${NAV.map(n=>html`<${NL} to=${n}>${n}<//>`)}
   ${A.me?html`<${React.Fragment}>${A.me.role==='admin'&&html`<${NL} to="admin">Admin<//>`}<button class="btn s o" onClick=${()=>setMe(null)}>Logout</button><//>`:html`<button class="btn s" onClick=${()=>A.setModal('login')}>Login</button>`}</div>`}
 </header>`}

function Home(){
 const t=['BUILD','LEARN','LAUNCH','CREATE','TANZANIA','GEN Z'];
 return html`<section class="relative overflow-hidden px-5 pt-14 pb-10">
  <div class="fl absolute -top-10 -right-16 w-64 h-64 rounded-full bg-[var(--p)] opacity-40 blur-2xl"></div>
  <div class="fl absolute top-72 -left-16 w-52 h-52 bg-[var(--c)] opacity-30 blur-2xl" style=${{borderRadius:'60% 40% 55% 45%',animationDelay:'-2s'}}></div>
  <div class="fl absolute bottom-10 right-10 w-16 h-16 border-4 border-[var(--c)] rotate-12" style=${{animationDelay:'-4s'}}></div>
  <div class="relative max-w-6xl mx-auto">
   <span class="chip">TECH HUB · YOUNG CREATORS · TANZANIA</span>
   <h1 class="big mt-6" style=${{fontSize:'clamp(3.6rem,19vw,14rem)'}}>
    <span class="pk block">NEURIVA</span>
    <span class="ch block -mt-[.12em] ml-[18%] -rotate-3 mix-blend-normal">HUB</span></h1>
   <p class="big mt-8 text-3xl sm:text-5xl"><span class="pk">BUILD.</span> <span class="ch">LEARN.</span> <span class="pk">LAUNCH.</span></p>
   <p class="mt-6 max-w-xl text-lg text-neutral-300">Courses, projects and events for the next wave of Tanzanian makers, coders and designers.</p>
   <div class="mt-8 flex gap-3 flex-wrap"><a class="btn" href="#/pricing">Join NeurivaHub</a><a class="btn o" href="#/courses">See courses</a></div>
  </div>
  <div class="mt-14 -mx-5 py-4 bg-[var(--c)] text-[#0B0B0B] -rotate-1 overflow-hidden"><div class="mq big text-4xl">${[0,1].map(()=>t.map(x=>html`<span class="px-6 inline-flex items-center gap-4">${x}<${L.Sparkles} size=${30} color="#0B0B0B"/></span>`))}</div></div>
 </section>`}

function About(){return html`<section class="px-5 py-16 max-w-6xl mx-auto">
  <h2 class="big text-5xl sm:text-7xl pk">What is <span class="ch">NeurivaHub?</span></h2>
  <p class="mt-6 max-w-2xl text-lg text-neutral-300">NeurivaHub is a tech hub built for young creators in Tanzania. We teach practical skills, back real projects, and host events where ideas turn into products.</p>
  <div class="grid sm:grid-cols-3 gap-5 mt-10">${[['Zap','Learn fast','Hands-on courses taught by makers.'],['Users','Build together','Squads, mentors and a shared workspace.'],['Rocket','Launch for real','Demo days and startup support.']].map(x=>html`<div class="card p-7"><${Ic} n=${x[0]} s=${32}/><h3 class="big text-2xl mt-4 ch">${x[1]}</h3><p class="mt-3 text-neutral-300">${x[2]}</p></div>`)}</div></section>`}

function Courses({A}){
 const enroll=A.need(c=>A.say('Enrolled in '+c.t));
 return html`<section class="px-5 py-16 max-w-6xl mx-auto"><h2 class="big text-5xl sm:text-7xl ch">Courses</h2>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">${A.courses.map(c=>html`<div class="card overflow-hidden" key=${c.id}>
   <div class="h-28 grid place-items-center" style=${{background:'linear-gradient(135deg,var(--p),#7a0f50)'}}><${Ic} n=${c.e}/></div>
   <div class="p-6"><div class="flex justify-between items-center"><h3 class="big text-3xl">${c.t}</h3><span class="chip">${c.l}</span></div>
   <p class="mt-4 text-2xl font-bold pk">${c.p}</p><button class="btn s mt-4" onClick=${()=>enroll(c)}>Enroll</button></div></div>`)}</div></section>`}

function Projects({A}){
 const [f,setF]=useState('All');const cats=['All','AI','Hardware','Web','Design'];
 return html`<section class="px-5 py-16 max-w-6xl mx-auto"><h2 class="big text-5xl sm:text-7xl pk">Projects</h2>
  <div class="flex gap-2 flex-wrap mt-8">${cats.map(c=>html`<button class=${'btn s '+(f===c?'':'o')} onClick=${()=>setF(c)}>${c}</button>`)}</div>
  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">${A.projects.filter(p=>f==='All'||p.category===f).map(p=>html`<div class="card p-7" key=${p._id}><${Ic} n=${p.icon}/><h3 class="big text-2xl mt-4">${p.title}</h3><span class="chip mt-3 inline-block">${p.category}</span></div>`)}</div></section>`}

function Events({A}){return html`<section class="px-5 py-16 max-w-6xl mx-auto"><h2 class="big text-5xl sm:text-7xl ch">Events</h2>
  <div class="grid gap-4 mt-10">${A.events.map((e,i)=>html`<div class="card p-6 flex flex-wrap items-center justify-between gap-4" key=${i}>
   <div><div class="flex items-center gap-3"><${Ic} n="Calendar"/><span class="big text-3xl pk">${e.date}</span></div><div class="text-xl font-bold mt-2">${e.title}</div><div class="text-neutral-400">${e.place}</div></div>
   <button class=${'btn '+(has(e,A)?'o':'')} onClick=${()=>A.reg(e._id)}>${has(e,A)?'Registered':'Register'}</button></div>`)}</div></section>`}

function Pricing({A,setMe}){
 const pick=A.need(p=>api('/users/me/plan',{method:'PUT',body:{plan:p}},A.token).then(()=>{setMe({...A.me,plan:p});A.say(p+' plan selected')}).catch(e=>A.say(e.message)));
 return html`<section class="px-5 py-16 max-w-6xl mx-auto"><h2 class="big text-5xl sm:text-7xl pk">Pricing</h2>
  <div class="grid md:grid-cols-3 gap-5 mt-10 items-stretch">${PLANS.map(p=>{const hot=p[0]==='Pro';return html`<div key=${p[0]} class="card p-8 flex flex-col" style=${hot?{background:'var(--p)',color:'#fff'}:{}}>
   <div class="flex items-center gap-3"><${Ic} n="Zap" c="var(--c)"/><h3 class="big text-3xl">${p[0]}</h3></div><div class="big text-5xl mt-4">${p[1]}<span class="text-base"> TSh/mo</span></div>
   <ul class="mt-6 space-y-2 flex-1">${p[2].split('|').map(x=>html`<li class="flex items-center gap-2"><${L.Check} size=${20} style=${{color:hot?'#0B0B0B':'var(--c)'}}/>${x}</li>`)}</ul>
   <button class=${'btn mt-6 '+(hot?'':'o')} style=${hot?{background:'#0B0B0B',borderColor:'#0B0B0B'}:{}} onClick=${()=>pick(p[0])}>${A.me&&A.me.plan===p[0]?'Current plan':'Choose '+p[0]}</button></div>`})}</div></section>`}

function Contact({A}){
 const [f,setF]=useState({name:'',email:'',message:''});
 const go=e=>{e.preventDefault();if(!f.name||!f.email||!f.message)return A.say('Fill all fields');api('/contact',{method:'POST',body:f}).then(()=>{setF({name:'',email:'',message:''});A.say('Message sent')}).catch(x=>A.say(x.message))};
 return html`<section class="px-5 py-16 max-w-3xl mx-auto"><h2 class="big text-5xl sm:text-7xl ch">Contact</h2>
  <div class="card p-6 mt-10 space-y-4"><input placeholder="Your name" value=${f.name} onInput=${e=>setF({...f,name:e.target.value})}/>
  <input placeholder="Email" type="email" value=${f.email} onInput=${e=>setF({...f,email:e.target.value})}/>
  <textarea rows="4" placeholder="Message" value=${f.message} onInput=${e=>setF({...f,message:e.target.value})}></textarea>
  <button class="btn" onClick=${go}>Send message</button></div></section>`}

function Footer({A}){return html`<footer class="px-5 py-12 border-t border-[#222] text-center"><div class="big text-4xl pk">${A.theme.logo}</div><p class="text-neutral-400 mt-3">Build. Learn. Launch. · Tanzania · © 2026</p></footer>`}

function Auth({mode,setMode,A,setMe}){
 const [f,setF]=useState({name:'',email:'',pw:''});const su=mode==='signup';
 const go=()=>{
  if(su&&(!f.name||!f.email||f.pw.length<6))return A.say('Name, email, 6+ char password');
  api(su?'/auth/signup':'/auth/login',{method:'POST',body:{name:f.name,email:f.email,password:f.pw}})
   .then(d=>{setMe({...d.user,token:d.token});setMode(null);A.say('Welcome')}).catch(e=>A.say(e.message))};
 return html`<div class="fixed inset-0 z-[65] bg-black/80 grid place-items-center p-5" onClick=${()=>setMode(null)}>
  <div class="card p-7 w-full max-w-sm space-y-3" onClick=${e=>e.stopPropagation()} style=${{transform:'none'}}>
   <h3 class="big text-4xl pk">${su?'Sign up':'Log in'}</h3>
   ${su&&html`<input placeholder="Name" value=${f.name} onInput=${e=>setF({...f,name:e.target.value})}/>`}
   <input placeholder="Email" value=${f.email} onInput=${e=>setF({...f,email:e.target.value})}/>
   <input type="password" placeholder="Password" value=${f.pw} onInput=${e=>setF({...f,pw:e.target.value})}/>
   <button class="btn w-full" onClick=${go}>${su?'Create account':'Login'}</button>
   <button class="text-sm ch underline" onClick=${()=>setMode(su?'login':'signup')}>${su?'Have an account? Log in':'New here? Sign up'}</button>
   ${!su&&html`<button class="text-xs text-neutral-400 block" onClick=${()=>setF({name:'',email:'admin@neuriva.tz',pw:'admin123'})}>Demo admin: fill credentials</button>`}</div></div>`}

function Admin({A}){
 const [tab,setTab]=useState('Overview');const [keys,setKeys]=useState(LS.get('nv_keys',[]));
 const blank={t:'',p:'',l:'Beginner',e:'BookOpen'};const [form,setForm]=useState(blank);const [edit,setEdit]=useState(null);
 if(!A.me||A.me.role!=='admin')return html`<section class="px-5 py-24 text-center"><h2 class="big text-5xl pk">Admins only</h2><p class="mt-4 text-neutral-400">Log in with admin@neuriva.tz / admin123</p><button class="btn mt-6" onClick=${()=>A.setModal('login')}>Login</button></section>`;
 const S=A.stats||{};
 const stats=[['Users',S.users??'-'],['Courses',S.courses??'-'],['Projects',S.projects??'-'],['Revenue','TSh '+(S.revenue||0).toLocaleString()]];
 const bars=[4,7,5,9,12,(S.users||0)+6];const mx=Math.max(...bars);
 const save=()=>{if(!form.t||!form.p)return A.say('Title and price needed');
  const body={title:form.t,price:form.p,level:form.l,icon:form.e};
  api(edit?'/courses/'+edit:'/courses',{method:edit?'PUT':'POST',body},A.token).then(()=>{setEdit(null);setForm(blank);A.say('Saved');A.load()}).catch(e=>A.say(e.message))};
 const gen=()=>{const k='nv_live_'+Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b=>b.toString(16).padStart(2,'0')).join('');const n=[...keys,k];setKeys(n);LS.set('nv_keys',n)};
 const T=['Overview','Users','Courses','API Keys','Settings'];
 return html`<div class="md:flex min-h-screen">
  <aside class="md:w-56 bg-[#0B0B0B] border-r border-[#222] p-4 flex md:flex-col gap-2 overflow-x-auto"><div class="big text-xl pk hidden md:block mb-4">ADMIN</div>
   ${T.map(t=>html`<button class=${'btn s whitespace-nowrap '+(tab===t?'':'o')} onClick=${()=>setTab(t)}>${t}</button>`)}</aside>
  <section class="flex-1 p-5 min-w-0">
   <h2 class="big text-4xl ch mb-6">${tab}</h2>
   ${tab==='Overview'&&html`<div><div class="grid grid-cols-2 lg:grid-cols-4 gap-4">${stats.map(s=>html`<div class="card p-5"><div class="text-neutral-400 text-sm">${s[0]}</div><div class="big text-2xl sm:text-3xl pk mt-2">${s[1]}</div></div>`)}</div>
    <div class="card p-5 mt-5"><div class="font-bold mb-3">Signups (last 6 months)</div><svg viewBox="0 0 300 120" class="w-full">${bars.map((b,i)=>html`<rect x=${i*50+8} y=${110-b/mx*100} width="34" height=${b/mx*100} rx="8" fill=${i%2?'var(--c)':'var(--p)'}/>`)}</svg></div>
    <div class="card p-5 mt-5"><div class="font-bold mb-2">Contact messages (${A.msgs.length})</div>${A.msgs.length?A.msgs.map(m=>html`<p class="text-sm border-b border-[#2a2a2a] py-2"><b class="ch">${m.name}</b> · ${m.email}<br/>${m.message}</p>`):html`<p class="text-neutral-400 text-sm">No messages yet.</p>`}</div></div>`}
   ${tab==='Users'&&html`<div class="card p-3 overflow-x-auto"><table class="w-full text-sm"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Plan</th><th></th></tr></thead><tbody>${A.users.map(u=>html`<tr key=${u._id}><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.plan}</td><td>${u.role!=='admin'&&html`<button class="btn s o" onClick=${()=>api('/users/'+u._id,{method:'DELETE'},A.token).then(()=>{A.say('User deleted');A.load()})}>Delete</button>`}</td></tr>`)}</tbody></table></div>`}
   ${tab==='Courses'&&html`<div><div class="card p-5 grid sm:grid-cols-4 gap-3"><input placeholder="Title" value=${form.t} onInput=${e=>setForm({...form,t:e.target.value})}/><input placeholder="Price e.g. TSh 40,000" value=${form.p} onInput=${e=>setForm({...form,p:e.target.value})}/>
    <select value=${form.l} onChange=${e=>setForm({...form,l:e.target.value})}><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All levels</option></select><button class="btn s" onClick=${save}>${edit?'Update':'Add course'}</button></div>
    <div class="grid gap-3 mt-5">${A.courses.map(c=>html`<div class="card p-4 flex items-center justify-between gap-3 flex-wrap" key=${c.id}><span class="flex items-center gap-3"><${Ic} n=${c.e}/><b>${c.t}</b> · ${c.p} · ${c.l}</span><span class="flex gap-2"><button class="btn s o" onClick=${()=>{setForm(c);setEdit(c.id)}}>Edit</button><button class="btn s" onClick=${()=>api('/courses/'+c.id,{method:'DELETE'},A.token).then(()=>{A.say('Deleted');A.load()})}>Delete</button></span></div>`)}</div></div>`}
   ${tab==='API Keys'&&html`<div><button class="btn" onClick=${gen}>Generate API key</button><div class="grid gap-3 mt-5">${keys.map(k=>html`<div class="card p-4 flex gap-3 items-center justify-between flex-wrap"><code class="ch break-all text-sm">${k}</code><span class="flex gap-2"><button class="btn s o" onClick=${()=>{try{navigator.clipboard.writeText(k)}catch(e){}A.say('Copied')}}>Copy</button><button class="btn s" onClick=${()=>{const n=keys.filter(x=>x!==k);setKeys(n);LS.set('nv_keys',n)}}>Revoke</button></span></div>`)}</div></div>`}
   ${tab==='Settings'&&html`<div class="card p-6 space-y-4 max-w-md"><label class="block">Logo text<input value=${A.theme.logo} onInput=${e=>A.setTheme({...A.theme,logo:e.target.value})}/></label>
    <label class="block">Primary (pink)<input type="color" value=${A.theme.p} onInput=${e=>A.setTheme({...A.theme,p:e.target.value})}/></label>
    <label class="block">Secondary (chartreuse)<input type="color" value=${A.theme.c} onInput=${e=>A.setTheme({...A.theme,c:e.target.value})}/></label>
    <button class="btn s" onClick=${()=>A.setTheme({logo:'NEURIVAHUB',p:'#FF2DA6',c:'#D4FF3F'})}>Reset to brand colors</button></div>`}
  </section></div>`}
ReactDOM.createRoot(document.getElementById('root')).render(html`<${App}/>`);
