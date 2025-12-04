// App logic: levels, UI and sounds

const levels = {
  "COLORS": [
    {emoji: '🔴', word: 'red'},
    {emoji: '🟠', word: 'orange'},
    {emoji: '🟡', word: 'yellow'},
    {emoji: '🟢', word: 'green'},
    {emoji: '🔵', word: 'blue'},
    {emoji: '🟣', word: 'purple'}
  ],
  "ANIMALS": [
    {emoji: '🐶', word: 'dog'},
    {emoji: '🐱', word: 'cat'},
    {emoji: '🐵', word: 'monkey'},
    {emoji: '🐮', word: 'cow'},
    {emoji: '🐔', word: 'chicken'},
    {emoji: '🐸', word: 'frog'}
  ],
  "NUMBERS": [
    {emoji: '1️⃣', word: 'one'},
    {emoji: '2️⃣', word: 'two'},
    {emoji: '3️⃣', word: 'three'},
    {emoji: '4️⃣', word: 'four'},
    {emoji: '5️⃣', word: 'five'},
    {emoji: '6️⃣', word: 'six'}
  ],
  "FAMILY": [
    {emoji: '👨‍👩‍👧‍👦', word: 'family'},
    {emoji: '👩‍👧', word: 'mother'},
    {emoji: '👨‍👦', word: 'father'},
    {emoji: '👶', word: 'baby'}
  ],
  "ACTIONS": [
    {emoji: '🏃‍♂️', word: 'run'},
    {emoji: '🤸‍♀️', word: 'jump'},
    {emoji: '🧍', word: 'stand'},
    {emoji: '🛌', word: 'sleep'}
  ]
};

// --- UI elements
const levelGrid = document.getElementById('levelGrid');
const game = document.getElementById('game');
const levelsSection = document.getElementById('levels');
const levelTitle = document.getElementById('levelTitle');
const emojiEl = document.getElementById('emoji');
const choicesEl = document.getElementById('choices');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('next');
const backBtn = document.getElementById('back');
const speakBtn = document.getElementById('speakBtn');
const audioToggle = document.getElementById('audioToggle');
const musicToggle = document.getElementById('musicToggle');
const volumeRange = document.getElementById('volume');

let currentLevel = null;
let round = null;
let audioEnabled = true;
let musicEnabled = false;
let masterVolume = parseFloat(volumeRange.value) || 0.8;
let score = 0;
let roundsPlayed = 0;
let selectedSong = 'synth';

// Simple public-domain song arrangements (note names and relative durations)
const SONGS = {
  twinkle: [
    {n:'C4',d:1},{n:'C4',d:1},{n:'G4',d:1},{n:'G4',d:1},{n:'A4',d:1},{n:'A4',d:1},{n:'G4',d:2},
    {n:'F4',d:1},{n:'F4',d:1},{n:'E4',d:1},{n:'E4',d:1},{n:'D4',d:1},{n:'D4',d:1},{n:'C4',d:2}
  ],
  oldmac: [
    {n:'C4',d:1},{n:'E4',d:1},{n:'G4',d:1},{n:'C5',d:1},{n:'G4',d:2},
    {n:'C4',d:1},{n:'E4',d:1},{n:'G4',d:1},{n:'C5',d:1},{n:'G4',d:2}
  ],
  wheels: [
    {n:'C4',d:1},{n:'C4',d:1},{n:'C4',d:1},{n:'G4',d:1},{n:'A4',d:2},{n:'G4',d:2},
    {n:'F4',d:2},{n:'E4',d:2},{n:'D4',d:2},{n:'C4',d:4}
  ]
  ,
  // cheerful, upbeat loop suitable for kids
  happy: [
    {n:'C4',d:1},{n:'E4',d:1},{n:'G4',d:1},{n:'C5',d:1},
    {n:'G4',d:1},{n:'E4',d:1},{n:'C4',d:2},
    {n:'D4',d:1},{n:'F4',d:1},{n:'A4',d:1},{n:'D5',d:1},
    {n:'A4',d:1},{n:'F4',d:1},{n:'D4',d:2}
  ]
};

function noteToFreq(note){
  const map = { C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392.00,A4:440.00,B4:493.88,C5:523.25 };
  return map[note] || 440;
}

// --- Sound engine using WebAudio
class SfxEngine {
  constructor(){
    this.ctx = null;
    this.bgOsc = null;
    this.bgGain = null;
    this.volume = masterVolume;
  }
  ensureCtx(){
    if(!this.ctx){
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }
  setVolume(v){
    this.volume = v;
  }
  playTone(freq=440, type='sine', time=0.14, gain=0.12){
    if(!audioEnabled) return;
    this.ensureCtx();
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = gain * this.volume;
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + time);
    o.stop(this.ctx.currentTime + time + 0.02);
  }
  playChord(base=440){
    this.playTone(base, 'sine', 0.2, 0.12);
    this.playTone(base*1.26, 'triangle', 0.22, 0.08);
    this.playTone(base*1.5, 'sawtooth', 0.24, 0.06);
  }
  playCorrect(){ this.playChord(660); }
  playWrong(){ this.playTone(160, 'square', 0.25, 0.18); this.playTone(110, 'sine', 0.25, 0.06); }
  playClick(){ this.playTone(880, 'sine', 0.08, 0.06); }
  playHover(){ this.playTone(1200, 'triangle', 0.06, 0.04); }
  playPop(){
    if(!audioEnabled) return;
    this.ensureCtx();
    const ctx = this.ctx;
    const bufferSize = Math.floor(ctx.sampleRate * 0.04);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++){ data[i] = (Math.random()*2-1) * Math.exp(-i/(bufferSize*0.02)); }
    const src = ctx.createBufferSource(); src.buffer = buffer;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
    const g = ctx.createGain(); g.gain.value = 0.0001;
    src.connect(hp); hp.connect(g); g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.12 * this.volume, now + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    src.start(now); src.stop(now + 0.09);
  }
  startBackground(){
    if(!audioEnabled) return;
    this.ensureCtx();
    if(this._bgLoop) return; // already running
    const ctx = this.ctx;
    // background master gain
    this.bgGain = ctx.createGain();
    this.bgGain.gain.value = 0.0; // start silent, will ramp
    this.bgGain.connect(ctx.destination);
    // simple rhythmic sequencer using setInterval
    const bpm = 100;
    const beatMs = (60 / bpm) * 1000;
    const pattern = [1,0,0,0,1,0,0,0]; // kick on 1 and 5
    const hihatPattern = [1,0,1,0,1,0,1,0];
    const melody = [0,2,4,5,4,2,0,0];
    let step = 0;
    const playKick = ()=>{
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 100;
      g.gain.value = 0.0001;
      o.connect(g); g.connect(this.bgGain);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.6 * this.volume, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      o.frequency.setValueAtTime(120, now);
      o.frequency.exponentialRampToValueAtTime(60, now + 0.3);
      o.start(now); o.stop(now + 0.34);
    };
    const playHihat = ()=>{
      const bufferSize = 2 * ctx.sampleRate;
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0;i<bufferSize;i++){ data[i] = (Math.random()*2-1) * Math.exp(-i/(ctx.sampleRate*0.02)); }
      noise.buffer = buffer;
      const f = ctx.createBiquadFilter(); f.type='highpass'; f.frequency.value = 8000;
      const g = ctx.createGain(); g.gain.value = 0.0001;
      noise.connect(f); f.connect(g); g.connect(this.bgGain);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.25 * this.volume, now + 0.001);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      noise.start(now); noise.stop(now + 0.14);
    };
    const playMelody = (n)=>{
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = 'sawtooth';
      const base = 440; // A4
      const note = base * Math.pow(2, (n-9)/12); // offset to get pleasant range
      o.frequency.value = note;
      g.gain.value = 0.0001;
      o.connect(g); g.connect(this.bgGain);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.12 * this.volume, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      o.start(now); o.stop(now + 0.36);
    };
    // ramp up master
    const startTime = ctx.currentTime;
    this.bgGain.gain.cancelScheduledValues(startTime);
    this.bgGain.gain.setValueAtTime(0.0, startTime);
    this.bgGain.gain.linearRampToValueAtTime(0.25 * this.volume, startTime + 0.6);

    this._bgLoop = setInterval(()=>{
      if(!audioEnabled){ return; }
      const p = step % pattern.length;
      if(pattern[p]) playKick();
      if(hihatPattern[p]) playHihat();
      // melody selection: either simple synth melody or arranged song
      if(selectedSong === 'synth'){
        const m = melody[step % melody.length];
        if(m!==undefined && m!==null) playMelody(60 + m);
      } else {
        const song = SONGS[selectedSong] || SONGS.twinkle;
        const idx = step % song.length;
        const note = song[idx];
        if(note && note.n){ playMelody(noteToFreq(note.n)); }
      }
      step++;
    }, beatMs / 2); // 8th notes
    // store for stop
    this._bgLoopStep = 0;
  }
  stopBackground(){
    if(this._bgLoop){ clearInterval(this._bgLoop); this._bgLoop = null; }
    if(this.bgGain){ try{ this.bgGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6); setTimeout(()=>{ try{ this.bgGain.disconnect(); }catch(e){} }, 700); }catch(e){} }
    this.bgGain = null;
  }
}

const sfx = new SfxEngine();

// --- Background animator (floating bubbles / balloons)
class BGAnimator {
  constructor(canvasId){
    this.canvas = document.getElementById(canvasId);
    if(!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.items = [];
    this.pops = [];
    this.running = false;
    this.resize();
    this._tick = this._tick.bind(this);
  }
  resize(){
    if(!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.w = this.canvas.width = Math.floor(window.innerWidth * dpr);
    this.h = this.canvas.height = Math.floor(window.innerHeight * dpr);
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);
    // regenerate items sized to viewport
    this.items = [];
    const count = Math.max(12, Math.floor(window.innerWidth / 80));
    const colors = ['#ffd93d','#ff6b6b','#7bed9f','#6bafff','#a29bfe'];
    for(let i=0;i<count;i++){
      this.items.push({
        x: Math.random()*window.innerWidth,
        y: Math.random()*window.innerHeight,
        r: 12 + Math.random()*28,
        vx: (-0.2 + Math.random()*0.4),
        vy: (0.2 + Math.random()*0.6) * -1,
        sway: (Math.random()*0.6)+0.2,
        phase: Math.random()*Math.PI*2,
        color: colors[Math.floor(Math.random()*colors.length)],
        alpha: 0.4 + Math.random()*0.5
      });
    }
  }
  handleClick(clientX, clientY){
    if(!this.items || this.items.length===0) return false;
    // find the top-most bubble hit (iterate reverse)
    for(let i=this.items.length-1;i>=0;i--){
      const it = this.items[i];
      const dx = clientX - it.x; const dy = clientY - it.y; const d = Math.sqrt(dx*dx + dy*dy);
      if(d <= it.r){ this.popBubble(i); return true; }
    }
    return false;
  }
  popBubble(index){
    const it = this.items[index];
    if(!it) return;
    // spawn particle pops
    const parts = 8 + Math.floor(Math.random()*6);
    for(let i=0;i<parts;i++){
      const angle = Math.random()*Math.PI*2;
      const speed = 1 + Math.random()*3;
      this.pops.push({ x: it.x, y: it.y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, r: 3+Math.random()*4, life: 0.45 + Math.random()*0.4, age:0, color: it.color });
    }
    // remove the bubble and respawn one later
    this.items.splice(index,1);
    setTimeout(()=>{ this.items.push({ x: Math.random()*window.innerWidth, y: window.innerHeight + 40, r: 12 + Math.random()*28, vx:(-0.2 + Math.random()*0.4), vy: - (0.6 + Math.random()*0.6), sway:(Math.random()*0.6)+0.2, phase: Math.random()*Math.PI*2, color: it.color, alpha: 0.4 + Math.random()*0.5 }); }, 700 + Math.random()*800);
    try{ sfx.playPop(); }catch(e){}
  }
  start(){ if(!this.canvas || this.running) return; this.running=true; this._last=performance.now(); requestAnimationFrame(this._tick); }
  stop(){ this.running=false; }
  _tick(now){ if(!this.running) return; const dt = Math.min(40, now - (this._last||now)) / 1000; this._last = now; this._update(dt); this._draw(); requestAnimationFrame(this._tick); }
  _update(dt){ for(const it of this.items){ it.phase += dt * it.sway; it.x += it.vx + Math.sin(it.phase) * 0.4; it.y += it.vy * (0.6 + Math.sin(it.phase)*0.2); if(it.y + it.r < -60){ it.y = window.innerHeight + 40; it.x = Math.random()*window.innerWidth; } if(it.x < -80) it.x = window.innerWidth + 80; if(it.x > window.innerWidth + 80) it.x = -80; } }
  _update(dt){ for(const it of this.items){ it.phase += dt * it.sway; it.x += it.vx + Math.sin(it.phase) * 0.4; it.y += it.vy * (0.6 + Math.sin(it.phase)*0.2); if(it.y + it.r < -60){ it.y = window.innerHeight + 40; it.x = Math.random()*window.innerWidth; } if(it.x < -80) it.x = window.innerWidth + 80; if(it.x > window.innerWidth + 80) it.x = -80; }
    // update pops
    for(let i=this.pops.length-1;i>=0;i--){ const p = this.pops[i]; p.age += dt; p.x += p.vx * 60 * dt; p.y += p.vy * 60 * dt + (60*dt*0.2); p.vy += 60*dt*0.02; if(p.age >= p.life) this.pops.splice(i,1); }
  }
  _draw(){ const ctx = this.ctx; ctx.clearRect(0,0,window.innerWidth,window.innerHeight); for(const it of this.items){ ctx.beginPath(); ctx.fillStyle = it.color; ctx.globalAlpha = it.alpha * 0.95; const gx = it.x; const gy = it.y; // draw soft circle with radial gradient
      const g = ctx.createRadialGradient(gx, gy, it.r*0.2, gx, gy, it.r);
      g.addColorStop(0, this._fade(it.color,0.95));
      g.addColorStop(1, this._fade(it.color,0.35));
      ctx.fillStyle = g; ctx.arc(gx, gy, it.r, 0, Math.PI*2); ctx.fill(); ctx.closePath(); }
    // draw pops
    for(const p of this.pops){ ctx.beginPath(); const g2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*2); g2.addColorStop(0, this._fade(p.color,0.95)); g2.addColorStop(1, this._fade(p.color,0.15)); ctx.fillStyle = g2; ctx.globalAlpha = Math.max(0, 1 - (p.age / p.life)); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill(); ctx.closePath(); }
    ctx.globalAlpha = 1;
  }
  _fade(hex, a){ // hex like #rrggbb
    return hex + Math.floor(a*255).toString(16).padStart(2,'0');
  }
}

// create and start background animation if canvas is present
const bgAnim = new BGAnimator('bgCanvas');
if(bgAnim && typeof bgAnim.start === 'function'){
  bgAnim.start();
  window.addEventListener('resize', ()=>{ try{ bgAnim.resize(); }catch(e){} });
  // pointer interactions: pop bubbles on click/tap on canvas
  try{
    const cvs = document.getElementById('bgCanvas');
    cvs && cvs.addEventListener('click', (ev)=>{
      const rect = cvs.getBoundingClientRect();
      const x = ev.clientX - rect.left; const y = ev.clientY - rect.top;
      if(bgAnim.handleClick(x,y)){ ev.stopPropagation(); ev.preventDefault(); }
    });
    cvs && cvs.addEventListener('touchstart', (ev)=>{
      const t = ev.touches[0]; if(!t) return;
      const rect = cvs.getBoundingClientRect(); const x = t.clientX - rect.left; const y = t.clientY - rect.top;
      if(bgAnim.handleClick(x,y)){ ev.stopPropagation(); ev.preventDefault(); }
    }, {passive:false});
  }catch(e){}
}

// --- Helpers
function speak(text){
  if(!audioEnabled) return;
  if('speechSynthesis' in window){
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
}

// device identity for binding keys
function getDeviceId(){
  try{
    let id = localStorage.getItem('ruben_device_id');
    if(!id){ id = 'd_' + Math.random().toString(36).slice(2,12); localStorage.setItem('ruben_device_id', id); }
    return id;
  }catch(e){ return 'd_unknown'; }
}

async function redeemKeyUI(key){
  const deviceId = getDeviceId();
  try{
    const r = await fetch('/api/redeemKey', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ key, deviceId }) });
    const j = await r.json();
    if(r.status===200){ localStorage.setItem('ruben_activation', JSON.stringify({ key, deviceId })); return { ok:true }; }
    return { ok:false, error: j.error || 'error' };
  }catch(e){ return { ok:false, error: e.message }; }
}

function showActivationIfNeeded(){
  try{
    const a = localStorage.getItem('ruben_activation');
    if(a) return; // already activated
  }catch(e){}
  // show modal
  const modal = document.getElementById('activationModal'); if(!modal) return;
  modal.classList.remove('hidden');
  const close = document.getElementById('activationClose'); const actBtn = document.getElementById('activateBtn'); const input = document.getElementById('activationInput'); const msg = document.getElementById('activationMsg');
  close.onclick = ()=>{ modal.classList.add('hidden'); };
  actBtn.onclick = async ()=>{
    const key = (input.value||'').trim(); if(!key) { msg.textContent='Please enter a key'; return; }
    msg.textContent = 'Checking...';
    const res = await redeemKeyUI(key);
    if(res.ok){ msg.textContent = 'Activated! Enjoy.'; setTimeout(()=>modal.classList.add('hidden'),800); }
    else { msg.textContent = 'Error: ' + (res.error||'invalid'); }
  };
}

// --- Admin generate key UI
function setupAdminUI(){
  const badge = document.getElementById('adminBadge');
  const modal = document.getElementById('adminModal');
  if(!badge || !modal) return;
  const close = document.getElementById('adminClose');
  const genBtn = document.getElementById('genKeyBtn');
  const input = document.getElementById('adminSecretInput');
  const result = document.getElementById('genResult');
  badge.addEventListener('click', ()=>{ modal.classList.remove('hidden'); result.textContent=''; input.value=''; });
  close.addEventListener('click', ()=>{ modal.classList.add('hidden'); });
  genBtn.addEventListener('click', async ()=>{
    const secret = (input.value||'').trim(); if(!secret){ result.textContent='Enter secret'; return; }
    result.textContent = 'Generating...';
    try{
      const r = await fetch('/api/generateKey', { method: 'POST', headers: { 'x-gen-secret': secret } });
      const j = await r.json();
      if(r.status===200 && j.key){ result.innerHTML = `<div>Key: <strong>${j.key}</strong></div><div style="margin-top:8px"><button id="copyKey">Copy</button></div>`;
        const copyBtn = document.getElementById('copyKey'); copyBtn.addEventListener('click', ()=>{ navigator.clipboard && navigator.clipboard.writeText(j.key); });
      } else {
        result.textContent = 'Error: ' + (j.error || 'failed');
      }
    }catch(e){ result.textContent = 'Error: ' + e.message; }
  });
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function pickRound(items){
  const target = items[Math.floor(Math.random()*items.length)];
  const others = items.filter(i=>i.word!==target.word);
  shuffle(others);
  const choices = [target, others[0], others[1] || others[0]]; // keep 3 choices for clarity
  shuffle(choices);
  return {target, choices};
}

// --- UI rendering
function buildLevels(){
  levelGrid.innerHTML='';
  Object.keys(levels).forEach(key=>{
    const card = document.createElement('button');
    card.className='level';
    card.setAttribute('data-level',key);
    card.innerHTML = `<div class="icon">${levels[key][0].emoji}</div><div class="name">${key}</div>`;
    card.addEventListener('click',()=>startLevel(key));
    // hover sound and tactile feedback
    card.addEventListener('mouseenter', ()=>{ sfx.playHover(); });
    card.addEventListener('touchstart', ()=>{ sfx.playHover(); }, {passive:true});
    levelGrid.appendChild(card);
  });
}

function startLevel(key){
  currentLevel = key;
  levelsSection.classList.add('hidden');
  game.classList.remove('hidden');
  levelTitle.textContent = key;
  nextRound();
}

function nextRound(){
  feedbackEl.textContent='';
  round = pickRound(levels[currentLevel]);
  renderRound();
}

function renderRound(){
  emojiEl.textContent = round.target.emoji;
  choicesEl.innerHTML = '';
  round.choices.forEach(c=>{
    const b = document.createElement('button');
    b.className='choice';
    b.textContent = c.word;
    b.addEventListener('click',()=>onChoice(b,c));
    b.addEventListener('mouseenter', ()=>{ sfx.playHover(); });
    b.addEventListener('touchstart', ()=>{ sfx.playHover(); }, {passive:true});
    choicesEl.appendChild(b);
  });
  // update progress UI
  updateProgressUI();
}

function onChoice(btn, choice){
  if(!round) return;
  const correct = choice.word === round.target.word;
  Array.from(choicesEl.children).forEach(ch=>ch.disabled=true);
  if(correct){
    btn.classList.add('correct');
    feedbackEl.textContent = '✔ Correct!';
    sfx.playCorrect();
    speak(round.target.word);
    // reward
    score += 1;
    triggerStickerIfNeeded();
  } else {
    btn.classList.add('wrong');
    feedbackEl.textContent = '✖ Try again';
    sfx.playWrong();
    // reveal correct choice
    Array.from(choicesEl.children).forEach(ch=>{
      if(ch.textContent===round.target.word) ch.classList.add('correct');
    });
    speak(round.target.word);
  }
}

// --- Events
nextBtn.addEventListener('click',()=>{ sfx.playClick(); nextRound(); });
backBtn.addEventListener('click',()=>{ sfx.playClick(); game.classList.add('hidden'); levelsSection.classList.remove('hidden'); currentLevel=null; });
speakBtn.addEventListener('click',()=>{ sfx.playClick(); speak(round.target.word); });

audioToggle.addEventListener('click',()=>{
  audioEnabled = !audioEnabled;
  audioToggle.setAttribute('aria-pressed', String(audioEnabled));
  audioToggle.textContent = audioEnabled? '🔊 Sound' : '🔈 Muted';
  if(!audioEnabled){ try{ window.speechSynthesis.cancel(); }catch(e){} sfx.stopBackground(); }
  else if(musicEnabled){ sfx.startBackground(); }
});

musicToggle.addEventListener('click',()=>{
  musicEnabled = !musicEnabled;
  musicToggle.setAttribute('aria-pressed', String(musicEnabled));
  musicToggle.textContent = musicEnabled? '🎵 Music' : '🎶 No Music';
  if(musicEnabled && audioEnabled) sfx.startBackground(); else sfx.stopBackground();
});

volumeRange.addEventListener('input',(e)=>{
  masterVolume = parseFloat(e.target.value);
  sfx.setVolume(masterVolume);
});

// music selector wiring
const musicSelect = document.getElementById('musicSelect');
if(musicSelect){
  musicSelect.value = selectedSong;
  musicSelect.addEventListener('change', (e)=>{
    selectedSong = e.target.value || 'synth';
    sfx.playClick();
    if(musicEnabled && audioEnabled){ sfx.stopBackground(); sfx.startBackground(); }
  });
}

// --- Init
buildLevels();

// show activation modal if not activated
setTimeout(()=>{ showActivationIfNeeded(); }, 700);
// setup admin UI
setTimeout(()=>{ setupAdminUI(); }, 800);

// auto-run a friendly chime once page is interacted with
window.addEventListener('click',function onFirst(){ sfx.playChord(520); window.removeEventListener('click', onFirst); },{once:true});

// accessibility: keyboard click for choices
choicesEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.target.click(); } });

// show basic hint when no interaction
setTimeout(()=>{
  if(!currentLevel){
    const first = document.querySelector('.level');
    first && first.classList.add('pulse');
  }
},4000);

console.log('Ruben English Game (sound version) loaded');

// Progress and stickers
const progressBar = document.getElementById('progressBar');
const stickersEl = document.getElementById('stickers');
const confettiCanvas = document.getElementById('confettiCanvas');
const stickerModal = document.getElementById('stickerModal');
const stickerShow = document.getElementById('stickerShow');
const closeSticker = document.getElementById('closeSticker');

function updateProgressUI(){
  roundsPlayed += 0; // placeholder, we can base on score
  const percent = Math.min(100, Math.round((score / 6) * 100));
  progressBar.style.width = percent + '%';
  // show small stickers for each 2 points
  stickersEl.innerHTML = '';
  const count = Math.min(6, Math.floor(score/2));
  for(let i=0;i<count;i++){
    const s = document.createElement('div'); s.className='sticker'; s.textContent='⭐';
    s.style.animationDelay = (i*80)+'ms';
    stickersEl.appendChild(s);
  }
}

function triggerStickerIfNeeded(){
  // give a sticker at scores 2,4,6...
  if([2,4,6,8,10].includes(score)){
    const sticker = ['🏅','🌟','🎖️','🏆','🦄'][Math.floor(Math.random()*5)];
    showStickerModal(sticker);
    fireConfetti();
  }
  updateProgressUI();
}

function showStickerModal(st){
  stickerShow.textContent = st;
  stickerModal.classList.remove('hidden');
}
closeSticker.addEventListener('click',()=>{ stickerModal.classList.add('hidden'); });

// Simple confetti effect
function fireConfetti(){
  const w = confettiCanvas.width = window.innerWidth;
  const h = confettiCanvas.height = window.innerHeight;
  const ctx = confettiCanvas.getContext('2d');
  const pieces = [];
  const colors = ['#ff6b6b','#ffd93d','#6bf','#7bed9f','#a29bfe'];
  for(let i=0;i<120;i++){
    pieces.push({x:Math.random()*w,y:Math.random()*-h*1.2,vy:2+Math.random()*6,vx:(-3+Math.random()*6),r:2+Math.random()*6,color:colors[Math.floor(Math.random()*colors.length)],rot:Math.random()*360});
  }
  let run=0;
  function frame(){
    run++;
    ctx.clearRect(0,0,w,h);
    for(const p of pieces){
      p.x += p.vx; p.y += p.vy; p.rot += 6;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.r/2,-p.r/2,p.r, p.r*1.8);
      ctx.restore();
    }
    if(run<120) requestAnimationFrame(frame); else ctx.clearRect(0,0,w,h);
  }
  requestAnimationFrame(frame);
}

// Persist score locally
window.addEventListener('beforeunload',()=>{ try{ localStorage.setItem('ruben_score', String(score)); }catch(e){} });
window.addEventListener('load',()=>{ try{ const s = parseInt(localStorage.getItem('ruben_score')||'0',10); if(!isNaN(s)){ score=s; updateProgressUI(); } }catch(e){} });
