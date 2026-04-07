/* ========== CONSTANTS ========== */
const BOARD = [
  { id:0,  type:'start',     icon:'🚀', label:'출발',       sublabel:'START' },
  { id:1,  type:'country',   icon:'🇰🇷', label:'Korea',     sentence:"I'm from Korea.",      sentenceIdx:0 },
  { id:2,  type:'family',    icon:'👨', label:'Dad',       sublabel:'가족',  sentence:"This is my dad.",      sentenceIdx:6 },
  { id:3,  type:'country',   icon:'🇺🇸', label:'U.S.',      sentence:"I'm from the U.S.",    sentenceIdx:1 },
  { id:4,  type:'country',   icon:'🇫🇷', label:'France',    sentence:"I'm from France.",     sentenceIdx:5 },
  { id:5,  type:'character', icon:'👦🏽', label:'Ken',       sublabel:'friend',  country:'India',   sentence:"I'm from India.",   sentenceIdx:2 },
  { id:6,  type:'family',    icon:'👩', label:'Mom',       sublabel:'가족',  sentence:"This is my mom.",      sentenceIdx:7 },
  { id:7,  type:'country',   icon:'🇮🇳', label:'India',     sentence:"I'm from India.",      sentenceIdx:2 },
  { id:8,  type:'rollAgain', icon:'🎲', label:'한 번 더!',  sublabel:'Roll Again' },
  { id:9,  type:'country',   icon:'🇻🇳', label:'Vietnam',   sentence:"I'm from Vietnam.",    sentenceIdx:4 },
  { id:10, type:'country',   icon:'🇺🇸', label:'U.S.',      sentence:"I'm from the U.S.",    sentenceIdx:1 },
  { id:11, type:'family',    icon:'👦', label:'Brother',   sublabel:'가족',  sentence:"This is my brother.",  sentenceIdx:8 },
  { id:12, type:'country',   icon:'🇨🇦', label:'Canada',    sentence:"I'm from Canada.",     sentenceIdx:3 },
  { id:13, type:'rollAgain', icon:'🎲', label:'한 번 더!',  sublabel:'Roll Again' },
  { id:14, type:'character', icon:'👦🏾', label:'Rahul',     sublabel:'friend',  country:'India',   sentence:"I'm from India.",   sentenceIdx:2 },
  { id:15, type:'country',   icon:'🇰🇷', label:'Korea',     sentence:"I'm from Korea.",      sentenceIdx:0 },
  { id:16, type:'rollAgain', icon:'🎲', label:'한 번 더!',  sublabel:'Roll Again' },
  { id:17, type:'character', icon:'👩🏻‍🏫', label:'Ms. Green', sublabel:'teacher', country:'the U.S.', sentence:"I'm from the U.S.", sentenceIdx:1 },
  { id:18, type:'family',    icon:'👧', label:'Sister',    sublabel:'가족',  sentence:"This is my sister.",   sentenceIdx:9 },
  { id:19, type:'character', icon:'👧🏻', label:'Marie',     sublabel:'cousin',  country:'France',  sentence:"I'm from France.",  sentenceIdx:5 },
];

const GRID_POS = [
  {r:1,c:1},{r:1,c:2},{r:1,c:3},{r:1,c:4},{r:1,c:5},{r:1,c:6},  // 0-5  top
  {r:2,c:6},{r:3,c:6},{r:4,c:6},{r:5,c:6},                        // 6-9  right
  {r:6,c:6},{r:6,c:5},{r:6,c:4},{r:6,c:3},{r:6,c:2},{r:6,c:1},    // 10-15 bottom
  {r:5,c:1},{r:4,c:1},{r:3,c:1},{r:2,c:1},                        // 16-19 left
];

const SENTENCES = [
  { id:0, text:"I'm from Korea.",       flag:'🇰🇷' },
  { id:1, text:"I'm from the U.S.",     flag:'🇺🇸' },
  { id:2, text:"I'm from India.",       flag:'🇮🇳' },
  { id:3, text:"I'm from Canada.",      flag:'🇨🇦' },
  { id:4, text:"I'm from Vietnam.",     flag:'🇻🇳' },
  { id:5, text:"I'm from France.",      flag:'🇫🇷' },
  { id:6, text:"This is my dad.",       flag:'👨' },
  { id:7, text:"This is my mom.",       flag:'👩' },
  { id:8, text:"This is my brother.",   flag:'👦' },
  { id:9, text:"This is my sister.",    flag:'👧' },
];

const PCOLORS = ['#F44336','#2196F3','#4CAF50','#FF9800'];
const PNAMES_DEFAULT = ['Player 1','Player 2','Player 3','Player 4'];
const DICE_DOTS = {
  1:['mc'], 2:['tr','bl'], 3:['tr','mc','bl'],
  4:['tl','tr','bl','br'], 5:['tl','tr','mc','bl','br'],
  6:['tl','tr','ml','mr','bl','br']
};

/* ========== STATE ========== */
let players = [];
let curIdx = 0;
let rolling = false;
let gameOver = false;
let playerCount = 2;
let audioCtx = null;

/* ========== DOM ========== */
const $ = id => document.getElementById(id);
const setupScreen = $('setup-screen');
const gameScreen  = $('game-screen');
const board       = $('game-board');
const rollBtn     = $('roll-btn');
const diceVisual  = $('dice-visual');
const diceText    = $('dice-result-text');
const sentList    = $('sentence-list');
const playersBar  = $('players-bar');
const curPlayerEl = $('current-player');

/* ========== INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  createFloatingDecorations();
  renderNameInputs(2);
  /* count buttons */
  document.querySelectorAll('.count-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.count-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      playerCount = +btn.dataset.count;
      renderNameInputs(playerCount);
      playTone(500,.08,'triangle');
    });
  });
  $('start-btn').addEventListener('click', startGame);
  rollBtn.addEventListener('click', onRoll);
  $('rules-btn').addEventListener('click', ()=> showModal('rules-modal'));
  $('rules-close-btn').addEventListener('click', ()=> hideModal('rules-modal'));
  $('event-close-btn').addEventListener('click', onEventClose);
  $('event-speak-btn').addEventListener('click', ()=>{
    const question = $('event-question').textContent;
    const answer = $('event-sentence').textContent;
    speakConversation(question, answer);
  });
  $('rollAgain-close-btn').addEventListener('click', ()=>{
    hideModal('rollAgain-modal');
    rolling = false;
    rollBtn.disabled = false;
  });
  $('restart-btn').addEventListener('click', ()=> location.reload());
});

/* ========== SETUP ========== */
function renderNameInputs(n){
  const c = $('player-names');
  c.innerHTML = '';
  for(let i=0;i<n;i++){
    const row = document.createElement('div');
    row.className = 'player-name-row';
    row.innerHTML = `<div class="player-color-dot" style="background:${PCOLORS[i]}"></div>
      <input type="text" placeholder="${PNAMES_DEFAULT[i]}" data-idx="${i}" maxlength="10">`;
    c.appendChild(row);
  }
}

function startGame(){
  players = [];
  for(let i=0;i<playerCount;i++){
    const inp = document.querySelector(`input[data-idx="${i}"]`);
    players.push({
      idx: i,
      name: inp.value.trim() || PNAMES_DEFAULT[i],
      color: PCOLORS[i],
      pos: 0,
      checked: new Set(),
      tokenEl: null
    });
  }
  curIdx = 0;
  gameOver = false;
  rolling = false;
  setupScreen.classList.remove('active');
  gameScreen.classList.add('active');
  buildBoard();
  buildSentenceList();
  buildPlayersBar();
  updateTurnUI();
}

/* ========== BOARD ========== */
function buildBoard(){
  /* Remove old squares (keep center-area) */
  board.querySelectorAll('.square').forEach(s=>s.remove());
  board.querySelectorAll('.token').forEach(t=>t.remove());

  BOARD.forEach((sq,i) => {
    const div = document.createElement('div');
    div.className = `square ${sq.type}`;
    div.dataset.index = i;
    div.style.gridRow = GRID_POS[i].r;
    div.style.gridColumn = GRID_POS[i].c;
    div.innerHTML = `<span class="sq-icon">${sq.icon}</span>
      <span class="sq-label">${sq.label}</span>
      ${sq.sublabel ? `<span class="sq-sublabel">${sq.sublabel}</span>` : ''}
      <div class="tokens"></div>`;
    board.appendChild(div);
  });

  /* create tokens */
  players.forEach(p => {
    const tk = document.createElement('div');
    tk.className = 'token';
    tk.style.background = p.color;
    tk.textContent = p.idx+1;
    p.tokenEl = tk;
    placeToken(p);
  });
}

function placeToken(p){
  const sq = board.querySelector(`.square[data-index="${p.pos}"] .tokens`);
  if(sq) sq.appendChild(p.tokenEl);
}

/* ========== SENTENCE LIST ========== */
function buildSentenceList(){
  sentList.innerHTML = '';
  SENTENCES.forEach(s => {
    const li = document.createElement('li');
    li.className = 'sentence-item';
    li.id = `sent-${s.id}`;
    li.innerHTML = `<span class="check-icon">⬜</span><span class="sentence-text">${s.flag} ${s.text}</span>`;
    sentList.appendChild(li);
  });
  refreshChecklist();
}

function refreshChecklist(){
  const cur = players[curIdx];
  SENTENCES.forEach(s => {
    const li = $(`sent-${s.id}`);
    if(!li) return;
    const done = cur.checked.has(s.id);
    const anyDone = players.some(p => p.checked.has(s.id));
    li.classList.toggle('checked', done);
    if(done){
      li.querySelector('.check-icon').textContent = '✅';
    } else if(anyDone){
      li.querySelector('.check-icon').textContent = '☑️';
    } else {
      li.querySelector('.check-icon').textContent = '⬜';
    }
  });
}

/* ========== PLAYERS BAR ========== */
function buildPlayersBar(){
  playersBar.innerHTML = '';
  players.forEach(p => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.id = `pcard-${p.idx}`;
    card.innerHTML = `<div class="p-dot" style="background:${p.color}"></div>
      <div class="p-info">
        <span class="p-name">${p.name}</span>
        <span class="p-progress">${p.checked.size}/10</span>
        <div class="progress-bar"><div class="progress-fill" style="width:${(p.checked.size/10)*100}%"></div></div>
      </div>`;
    playersBar.appendChild(card);
  });
  highlightCard();
}

function refreshBar(){
  players.forEach(p => {
    const card = $(`pcard-${p.idx}`);
    if(!card) return;
    card.querySelector('.p-progress').textContent = `${p.checked.size}/10`;
    card.querySelector('.progress-fill').style.width = `${(p.checked.size/10)*100}%`;
  });
  highlightCard();
}

function highlightCard(){
  document.querySelectorAll('.player-card').forEach(c=>c.classList.remove('active'));
  const c = $(`pcard-${curIdx}`);
  if(c) c.classList.add('active');
}

/* ========== TURN UI ========== */
function updateTurnUI(){
  const p = players[curIdx];
  curPlayerEl.innerHTML = `<span class="dot" style="background:${p.color}"></span> ${p.name}의 차례`;
  refreshChecklist();
  highlightCard();
  highlightSquare(p.pos);
  rollBtn.disabled = false;
}

function highlightSquare(idx){
  board.querySelectorAll('.square').forEach(s=>s.classList.remove('active-square'));
  const sq = board.querySelector(`.square[data-index="${idx}"]`);
  if(sq) sq.classList.add('active-square');
}

/* ========== DICE ========== */
function onRoll(){
  if(rolling || gameOver) return;
  rolling = true;
  rollBtn.disabled = true;
  diceText.textContent = '';
  initAudio();
  const result = Math.floor(Math.random()*6)+1;
  animateDice(result, ()=>{
    diceText.textContent = `${result} 칸 이동!`;
    movePlayer(players[curIdx], result);
  });
}

function animateDice(final, cb){
  let count = 0;
  const total = 14;
  diceVisual.classList.add('shaking');
  const iv = setInterval(()=>{
    const v = Math.floor(Math.random()*6)+1;
    showDiceFace(v);
    playTone(300 + v*80, .05);
    count++;
    if(count >= total){
      clearInterval(iv);
      diceVisual.classList.remove('shaking');
      diceVisual.classList.add('result-bounce');
      setTimeout(()=> diceVisual.classList.remove('result-bounce'), 500);
      showDiceFace(final);
      playTone(523,.1,'triangle');
      setTimeout(()=> playTone(784,.15,'triangle'), 100);
      setTimeout(cb, 450);
    }
  }, 70);
}

function showDiceFace(v){
  const dots = diceVisual.querySelectorAll('.dice-dot');
  const show = DICE_DOTS[v];
  dots.forEach(d => {
    d.classList.toggle('show', show.includes(d.dataset.pos));
  });
}

/* ========== MOVEMENT ========== */
async function movePlayer(p, steps){
  for(let i=0;i<steps;i++){
    p.pos = (p.pos + 1) % BOARD.length;
    placeToken(p);
    p.tokenEl.classList.remove('pop');
    void p.tokenEl.offsetWidth;
    p.tokenEl.classList.add('pop');
    highlightSquare(p.pos);
    playTone(400 + i*60, .05);
    await wait(220);
  }
  /* sparkle on landing */
  const landedSq = board.querySelector(`.square[data-index="${p.pos}"]`);
  if(landedSq) createSparkles(landedSq);
  await wait(200);
  handleLanding(p);
}

function handleLanding(p){
  const sq = BOARD[p.pos];
  if(sq.type === 'country' || sq.type === 'character' || sq.type === 'family'){
    showEventModal(sq, p);
  } else if(sq.type === 'rollAgain'){
    showModal('rollAgain-modal');
    playTone(800,.1);
    playTone(1000,.1);
    /* after modal close, player rolls again (handled in close handler) */
  } else {
    /* start square - just next turn */
    nextTurn();
  }
}

/* ========== EVENT MODAL ========== */
let pendingRollAgain = false;

function showEventModal(sq, p){
  const isChar = sq.type === 'character';
  const isFamily = sq.type === 'family';
  $('event-icon').textContent = sq.icon;

  if(isFamily){
    $('event-title').textContent = sq.label;
    $('event-subtitle').textContent = '';
    $('q-label').textContent = '👋 소개해요';
    $('event-question').textContent = sq.sentence;
    $('a-label').textContent = '😊 인사해요';
    $('event-sentence').textContent = 'Nice to meet you.';
  } else {
    $('event-title').textContent = isChar ? `${sq.sublabel}, ${sq.label}` : sq.label;
    $('event-subtitle').textContent = isChar ? `"Hi, I'm ${sq.label}!"` : '';
    $('q-label').textContent = '🗣️ Question';
    $('event-question').textContent = 'Where are you from?';
    $('a-label').textContent = '💬 Answer';
    $('event-sentence').textContent = sq.sentence;
  }

  showModal('event-modal');
  if(sq.sentenceIdx !== undefined){
    p.checked.add(sq.sentenceIdx);
    refreshChecklist();
    refreshBar();
  }
  playMelody([523,659,784], .1, 100);
}

function onEventClose(){
  hideModal('event-modal');
  const p = players[curIdx];
  if(checkWin(p)) return;
  nextTurn();
}

/* ========== WIN ========== */
function checkWin(p){
  if(p.checked.size >= 10){
    gameOver = true;
    $('win-title').textContent = '🎉 축하합니다!';
    $('win-message').textContent = `${p.name}이(가) 모든 문장을 완성했어요!`;
    showModal('win-modal');
    createConfetti();
    playWinSound();
    return true;
  }
  return false;
}

/* ========== TURNS ========== */
function nextTurn(){
  rolling = false;
  curIdx = (curIdx + 1) % players.length;
  updateTurnUI();
}

/* ========== MODALS ========== */
function showModal(id){ $(id).classList.add('active'); }
function hideModal(id){ $(id).classList.remove('active'); }

/* ========== AUDIO ========== */
function initAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playTone(freq, dur, type='sine'){
  if(!audioCtx) return;
  try{
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = 0.15;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    o.stop(audioCtx.currentTime + dur + 0.05);
  } catch(e){}
}

function playMelody(notes, dur, gap){
  notes.forEach((n,i) => setTimeout(()=> playTone(n, dur, 'triangle'), i*gap));
}

function playWinSound(){
  playMelody([523,659,784,1047,784,1047], .2, 150);
}

/* ========== TTS ========== */
let bestVoice = null;

function loadVoices(){
  const voices = speechSynthesis.getVoices();
  if(!voices.length) return;
  /* Priority: Samantha (macOS best) > any en-US premium > any en-US > any en */
  const preferred = ['Samantha','Karen','Daniel','Google US English','Microsoft Zira'];
  for(const name of preferred){
    const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
    if(v){ bestVoice = v; return; }
  }
  bestVoice = voices.find(v => v.lang === 'en-US')
           || voices.find(v => v.lang.startsWith('en'))
           || null;
}

/* Voices load async on some browsers */
if(window.speechSynthesis){
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}

function speak(text, cb){
  if(!window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.75;
  u.pitch = 1.1;
  u.volume = 1.0;
  if(bestVoice) u.voice = bestVoice;
  if(cb) u.onend = cb;
  speechSynthesis.speak(u);
}

function speakConversation(question, answer){
  if(!window.speechSynthesis) return;
  speechSynthesis.cancel();
  /* highlight question bubble */
  const qBubble = document.querySelector('.question-bubble');
  const aBubble = document.querySelector('.answer-bubble');
  if(qBubble) qBubble.style.boxShadow = '0 0 15px rgba(84,160,255,.4)';
  speak(question, ()=>{
    if(qBubble) qBubble.style.boxShadow = '';
    /* pause between Q and A */
    setTimeout(()=>{
      if(aBubble) aBubble.style.boxShadow = '0 0 15px rgba(124,107,255,.4)';
      speak(answer, ()=>{
        if(aBubble) aBubble.style.boxShadow = '';
      });
    }, 400);
  });
}

/* ========== CONFETTI ========== */
function createConfetti(){
  const c = $('confetti');
  c.innerHTML = '';
  const colors = ['#FF6B6B','#54a0ff','#5f27cd','#ffa502','#2ed573','#ff6348','#eccc68','#ff4757','#7bed9f','#70a1ff'];
  const shapes = ['circle','rect','star'];
  for(let i=0;i<120;i++){
    const p = document.createElement('div');
    const shape = shapes[Math.floor(Math.random()*shapes.length)];
    p.className = `confetti-piece ${shape}`;
    p.style.left = Math.random()*100+'%';
    p.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDelay = Math.random()*3+'s';
    p.style.animationDuration = (2.5+Math.random()*2.5)+'s';
    p.style.width = (6+Math.random()*10)+'px';
    p.style.height = (6+Math.random()*10)+'px';
    c.appendChild(p);
  }
}

/* ========== FLOATING DECORATIONS ========== */
function createFloatingDecorations(){
  const container = $('floating-deco');
  if(!container) return;
  const emojis = ['⭐','✨','🌈','☁️','🎈','💫','🌟','🎵','❤️','🦋','🌸','🍀'];
  for(let i=0;i<18;i++){
    const el = document.createElement('span');
    el.className = 'float-emoji';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    el.style.left = Math.random()*100+'%';
    el.style.fontSize = (1.2+Math.random()*1.8)+'rem';
    el.style.animationDuration = (10+Math.random()*15)+'s';
    el.style.animationDelay = Math.random()*12+'s';
    container.appendChild(el);
  }
}

/* ========== SPARKLE EFFECT ========== */
function createSparkles(element){
  const rect = element.getBoundingClientRect();
  const colors = ['#FFD700','#FF6B6B','#54a0ff','#2ed573','#ff4757','#eccc68'];
  for(let i=0;i<10;i++){
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.left = (rect.left + rect.width/2 + (Math.random()-0.5)*60)+'px';
    s.style.top = (rect.top + rect.height/2 + (Math.random()-0.5)*60)+'px';
    s.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
    s.style.width = s.style.height = (4+Math.random()*8)+'px';
    s.style.setProperty('--tx', (Math.random()-0.5)*80+'px');
    s.style.setProperty('--ty', (Math.random()-0.5)*80+'px');
    document.body.appendChild(s);
    setTimeout(()=> s.remove(), 800);
  }
}

/* ========== UTILS ========== */
function wait(ms){ return new Promise(r=>setTimeout(r,ms)); }
