/* =============================================
   HELPERS
============================================= */
function scrollTo(sel){
  const el=document.querySelector(sel);
  if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
}

/* =============================================
   CURSOR  (desktop only)
============================================= */
const cur=document.getElementById('cur');
const curR=document.getElementById('curR');
let mx=0,my=0,rx=0,ry=0;
const isTouchDev=window.matchMedia('(hover:none)').matches;

if(!isTouchDev){
  document.addEventListener('mousemove',e=>{
    mx=e.clientX; my=e.clientY;
    cur.style.left=mx+'px'; cur.style.top=my+'px';
  });
  (function tick(){
    rx+=(mx-rx)*0.12; ry+=(my-ry)*0.12;
    curR.style.left=rx+'px'; curR.style.top=ry+'px';
    requestAnimationFrame(tick);
  })();
  document.querySelectorAll('a,button,.stag,.svc-card,.proj-card,.testi-card,label').forEach(el=>{
    el.addEventListener('mouseenter',()=>{cur.classList.add('hov');curR.classList.add('hov');});
    el.addEventListener('mouseleave',()=>{cur.classList.remove('hov');curR.classList.remove('hov');});
  });
}

/* =============================================
   NAVBAR SHRINK
============================================= */
window.addEventListener('scroll',()=>{
  document.getElementById('nav').classList.toggle('scrolled',window.scrollY>60);
},{passive:true});

/* =============================================
   HERO NAME REVEAL
============================================= */
setTimeout(()=>document.getElementById('hl').classList.add('revealed'),500);

/* =============================================
   SCROLL REVEAL
============================================= */
const rvObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('vis');rvObs.unobserve(e.target);}
  });
},{threshold:0.1});
document.querySelectorAll('.rv').forEach(el=>rvObs.observe(el));

/* =============================================
   SKILL BARS
============================================= */
const sbObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('.sb-fill').forEach(b=>{
        setTimeout(()=>{ b.style.width=b.dataset.w+'%'; },180);
      });
      sbObs.unobserve(e.target);
    }
  });
},{threshold:0.25});
document.querySelectorAll('.skill-bars').forEach(el=>sbObs.observe(el));

/* =============================================
   MOBILE NAV
============================================= */
function openMob(){ document.getElementById('mobNav').classList.add('open'); }
function closeMob(){ document.getElementById('mobNav').classList.remove('open'); }
document.getElementById('mobClose').addEventListener('click',closeMob);

/* =============================================
   SMOOTH INTERNAL LINKS
============================================= */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',function(e){
    const t=document.querySelector(this.getAttribute('href'));
    if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); }
  });
});

/* =============================================
   CONTACT FORM
============================================= */
function sendMsg(btn){
  const orig = btn.innerHTML;
  btn.innerHTML='<i class="fas fa-check"></i> Message Sent!';
  btn.style.cssText='background:#00e676;border-color:#00e676;color:#000;cursor:none;'+btn.style.cssText;
  setTimeout(()=>{
    btn.innerHTML=orig;
    btn.style.background='';btn.style.borderColor='';btn.style.color='';
  },3000);
}

/* =============================================
   GSAP HERO ENTRANCE
============================================= */
gsap.registerPlugin(ScrollTrigger);
const heroSeq=[
  {target:'.hero-eyebrow', y:18, delay:.18},
  {target:'.hero-name .first', y:46, delay:.32},
  {target:'.hero-name .last',  y:46, delay:.46},
  {target:'.hero-role',        y:18, delay:.62},
  {target:'.hero-desc',        y:18, delay:.76},
  {target:'.hero-actions',     y:18, delay:.90},
  {target:'.hero-stats',       y:18, delay:1.04},
];
heroSeq.forEach(({target,y,delay})=>{
  gsap.from(target,{y,opacity:0,duration:.75,delay,ease:'power3.out'});
});
gsap.from('.profile-col',{x:55,opacity:0,duration:1,delay:.46,ease:'power3.out'});

console.log('%c MU · Muhammad Umar Portfolio ','background:#e8001d;color:#fff;font-family:monospace;font-size:13px;padding:4px 10px;');
console.log('%c Code with Purpose · Design with Passion · Build for the Future','color:#0050ff;font-family:monospace;');
