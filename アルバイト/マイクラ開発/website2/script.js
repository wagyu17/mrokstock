/* =========================================================
   ONELIFE Drill & Programming — pixel/minecraft style
   Hierarchical navigation:
     home → math → op(add/sub/mul/div) → stage → game → result
     home → prog → mission → prog-game → prog-result
   ========================================================= */

const $ = id => document.getElementById(id);

/* ---------- Rank ---------- */
const RANKS = [
  { min: 0,      name: '木',         icon: '🪵' },
  { min: 500,    name: '石',         icon: '🪨' },
  { min: 2000,   name: '鉄',         icon: '⚙' },
  { min: 5000,   name: '金',         icon: '🥇' },
  { min: 10000,  name: 'ダイヤ',     icon: '💎' },
  { min: 20000,  name: 'エメラルド', icon: '🟢' },
  { min: 40000,  name: 'ネザライト', icon: '⬛' },
];
function getRankIndex(points) {
  for (let i = RANKS.length - 1; i >= 0; i--) if (points >= RANKS[i].min) return i;
  return 0;
}

/* ---------- Store ---------- */
const STORE_KEY = 'onelife_drill_v2';
function defaultStore() { return { totalPoints:0, best:{}, bestTime:{}, cleared:{}, progClear:{}, plays:0, typeBest:{}, kimiBest:0 }; }
function loadStore() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s && typeof s === 'object') return Object.assign(defaultStore(), s);
  } catch {}
  return defaultStore();
}
function saveStore() { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch {} }
const store = loadStore();

/* ---------- Stage catalog ---------- */
/* Organized per operation so they can be retrieved at each level */
const OP_META = {
  add: { label:'たしざん', icon:'➕', color:'diamond' },
  sub: { label:'ひきざん', icon:'➖', color:'gold' },
  mul: { label:'かけざん', icon:'✖', color:'grass' },
  div: { label:'わりざん', icon:'➗', color:'emerald' },
};

const STAGES_BY_OP = {
  add: [
    { id:'add_intro', op:'add', name:'にゅうもん', tag:'たして 10まで', icon:'➕', color:'wood',     diff:0, count:15 },
    { id:'add_e',     op:'add', name:'やさしい',   tag:'1〜10',         icon:'➕', color:'grass',    diff:1, count:20 },
    { id:'add_m',     op:'add', name:'ふつう',     tag:'1〜20',         icon:'➕', color:'diamond',  diff:2, count:20 },
    { id:'add_h',     op:'add', name:'むずかしい', tag:'2桁+1桁',       icon:'➕', color:'amethyst', diff:3, count:20 },
  ],
  sub: [
    { id:'sub_intro', op:'sub', name:'にゅうもん', tag:'10までから ひく', icon:'➖', color:'wood',    diff:0, count:15 },
    { id:'sub_e',     op:'sub', name:'やさしい',   tag:'1〜10',           icon:'➖', color:'grass',   diff:1, count:20 },
    { id:'sub_m',     op:'sub', name:'ふつう',     tag:'1〜20',           icon:'➖', color:'gold',    diff:2, count:20 },
    { id:'sub_h',     op:'sub', name:'むずかしい', tag:'2桁−1桁',         icon:'➖', color:'redstone',diff:3, count:20 },
  ],
  mul: [
    { id:'mul_1', op:'mul', factor:1, name:'1 の段', tag:'くさ',      icon:'🟩', color:'grass',    diff:1, count:9 },
    { id:'mul_2', op:'mul', factor:2, name:'2 の段', tag:'いし',      icon:'⬜', color:'stone',    diff:1, count:9 },
    { id:'mul_3', op:'mul', factor:3, name:'3 の段', tag:'もくざい',  icon:'🟫', color:'wood',     diff:1, count:9 },
    { id:'mul_4', op:'mul', factor:4, name:'4 の段', tag:'つち',      icon:'🟤', color:'dirt',     diff:1, count:9 },
    { id:'mul_5', op:'mul', factor:5, name:'5 の段', tag:'きん',      icon:'🟨', color:'gold',     diff:2, count:9 },
    { id:'mul_6', op:'mul', factor:6, name:'6 の段', tag:'エメラルド', icon:'🟢', color:'emerald',  diff:2, count:9 },
    { id:'mul_7', op:'mul', factor:7, name:'7 の段', tag:'レッドストーン', icon:'🟥', color:'redstone', diff:2, count:9 },
    { id:'mul_8', op:'mul', factor:8, name:'8 の段', tag:'アメジスト', icon:'🟪', color:'amethyst', diff:3, count:9 },
    { id:'mul_9', op:'mul', factor:9, name:'9 の段', tag:'こくようせき', icon:'⬛', color:'obsidian', diff:3, count:9 },
    { id:'mul_r', op:'mul', random:true, name:'ランダム 20問 早とき', tag:'タイムアタック', icon:'✨', color:'rainbow', diff:3, count:20, timed:true },
  ],
  div: [
    { id:'div_intro', op:'div', name:'にゅうもん', tag:'2や5で わる',     icon:'➗', color:'wood',     diff:0, count:10 },
    { id:'div_e',     op:'div', name:'やさしい',   tag:'九九のぎゃく',    icon:'➗', color:'grass',    diff:1, count:10 },
    { id:'div_m',     op:'div', name:'ふつう',     tag:'あまりなし',      icon:'➗', color:'emerald',  diff:2, count:10 },
    { id:'div_h',     op:'div', name:'むずかしい', tag:'あまりあり',      icon:'➗', color:'amethyst', diff:3, count:10 },
  ],
};

const RAINBOW_COLORS = ['grass','diamond','gold','redstone','amethyst','emerald'];

/* ---------- Game state ---------- */
const state = {
  view: 'home',
  op: null,
  stage: null,
  problems: [],
  index: 0,
  current: null,
  correctCount: 0,
  perfectCount: 0,
  attemptsOnCurrent: 0,
  startedAt: 0,
  endedAt: 0,
  timerHandle: 0,
};

/* ---------- Helpers ---------- */
const randInt = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2,'0');
  const s = (sec % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}

/* ---------- Navigation ---------- */
const VIEWS = [
  'home','math','stages','game','result',
  'prog-menu','prog-game','prog-result',
  'type-menu','type-defense','type-kimi','type-result',
];
function showView(v) {
  VIEWS.forEach(name => {
    const el = document.getElementById('view-' + name);
    if (el) el.hidden = (name !== v);
  });
  state.view = v;
  window.scrollTo({top:0, behavior:'instant'});
}

function goHome() { renderBreadcrumb([]); showView('home'); }

function goMath() {
  renderBreadcrumb([{label:'さんすう'}]);
  showView('math');
}

function goOp(op) {
  state.op = op;
  const meta = OP_META[op];
  renderBreadcrumb([
    {label:'さんすう', onClick: goMath},
    {label: meta.label},
  ]);
  $('stages-title').textContent = `${meta.icon} ${meta.label}：ステージを えらぼう`;
  $('stages-lead').textContent = op === 'mul'
    ? '1の段から じゅんに クリアすると メダルが もらえるよ。ランダム20問は タイムアタック！'
    : 'にゅうもん → やさしい → ふつう → むずかしい の じゅんに ちょうせんしよう。';
  renderStageGrid(op);
  showView('stages');
}

function goProg() {
  renderBreadcrumb([{label:'プログラミング'}]);
  renderProgMissionGrid();
  showView('prog-menu');
}

function renderBreadcrumb(items) {
  const bc = $('breadcrumb');
  bc.innerHTML = '';
  items.forEach((it, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'bc-sep';
      sep.textContent = '›';
      bc.appendChild(sep);
    }
    if (it.onClick && i < items.length - 1) {
      const a = document.createElement('button');
      a.type = 'button';
      a.className = 'bc-link';
      a.textContent = it.label;
      a.addEventListener('click', it.onClick);
      bc.appendChild(a);
    } else {
      const s = document.createElement('span');
      s.className = 'bc-current';
      s.textContent = it.label;
      bc.appendChild(s);
    }
  });
}

/* ---------- Stage grid ---------- */
function renderStageGrid(op) {
  const grid = $('stage-grid');
  grid.innerHTML = '';
  const stages = STAGES_BY_OP[op];
  stages.forEach(s => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `stage-card stage-${s.color}`;
    if (s.color === 'rainbow') btn.classList.add('stage-card-wide');
    const best = store.best[s.id];
    const bestT = store.bestTime[s.id];
    const cleared = store.cleared[s.id];
    btn.innerHTML = `
      ${cleared ? '<span class="sc-clear">✔</span>' : ''}
      <div class="sc-ico">${s.icon}</div>
      <div class="sc-name">${s.name}</div>
      <div class="sc-sub">${s.tag}</div>
      ${
        s.timed && bestT
          ? `<div class="sc-best">⏱ ${formatTime(bestT)}</div>`
          : best
            ? `<div class="sc-best">★ ${best}P</div>`
            : `<div class="sc-count">${s.count} 問</div>`
      }
    `;
    btn.addEventListener('click', () => startStage(op, s.id));
    grid.appendChild(btn);
  });
}

/* ---------- Problem builders ---------- */
function buildProblems(stage) {
  const probs = [];
  if (stage.op === 'mul') {
    if (stage.random) {
      const pool = [];
      for (let a=1; a<=9; a++) for (let b=1; b<=9; b++) pool.push([a,b]);
      shuffle(pool);
      for (let i=0; i<stage.count; i++) {
        const [a,b] = pool[i];
        probs.push({ op:'mul', a, b, ans: a*b });
      }
    } else {
      for (let i=1; i<=9; i++) {
        probs.push({ op:'mul', a: stage.factor, b:i, ans: stage.factor * i });
      }
    }
  } else if (stage.op === 'add') {
    if (stage.id === 'add_intro') {
      // Sum ≤ 10, both operands ≥ 1 (e.g., 1+1, 2+3, 4+6, 7+3 ...)
      for (let i=0; i<stage.count; i++) {
        const a = randInt(1, 9);
        const b = randInt(1, 10 - a);
        probs.push({ op:'add', a, b, ans: a+b });
      }
    } else if (stage.id === 'add_h') {
      for (let i=0; i<stage.count; i++) {
        const a = randInt(10, 50), b = randInt(1, 9);
        probs.push({ op:'add', a, b, ans:a+b });
      }
    } else {
      const top = stage.id === 'add_e' ? 10 : 20;
      for (let i=0; i<stage.count; i++) {
        const a = randInt(1, top), b = randInt(1, top);
        probs.push({ op:'add', a, b, ans:a+b });
      }
    }
  } else if (stage.op === 'sub') {
    if (stage.id === 'sub_intro') {
      // a ≤ 10, b ≤ a, ans ≥ 0 (簡単な引き算)
      for (let i=0; i<stage.count; i++) {
        const a = randInt(2, 10), b = randInt(1, a);
        probs.push({ op:'sub', a, b, ans:a-b });
      }
    } else {
      const top = stage.id === 'sub_e' ? 10 : stage.id === 'sub_m' ? 20 : 50;
      for (let i=0; i<stage.count; i++) {
        const a = randInt(2, top), b = randInt(1, a);
        probs.push({ op:'sub', a, b, ans:a-b });
      }
    }
  } else if (stage.op === 'div') {
    if (stage.id === 'div_intro') {
      // 2 or 5 で割る、商 1-5（簡単な等分体験）
      for (let i=0; i<stage.count; i++) {
        const d = [2, 5][randInt(0, 1)];
        const q = randInt(1, 5);
        probs.push({ op:'div', a: d*q, b: d, ans: q });
      }
    } else if (stage.id === 'div_e' || stage.id === 'div_m') {
      // divisor 2-9, quotient 1-9 → dividend = d * q
      for (let i=0; i<stage.count; i++) {
        const d = randInt(2, 9), q = randInt(1, 9);
        probs.push({ op:'div', a: d*q, b: d, ans: q });
      }
    } else {
      // with remainder — ans stored as quotient; hint shows remainder
      for (let i=0; i<stage.count; i++) {
        const d = randInt(2, 9), q = randInt(2, 9), r = randInt(1, d-1);
        probs.push({ op:'div', a: d*q+r, b: d, ans: q, remainder: r, withRemainder:true });
      }
    }
  }
  return probs;
}

/* ---------- Start stage ---------- */
function startStage(op, stageId) {
  const s = STAGES_BY_OP[op].find(x => x.id === stageId);
  if (!s) return;
  state.op = op;
  state.stage = s;
  state.problems = buildProblems(s);
  state.index = 0;
  state.correctCount = 0;
  state.perfectCount = 0;
  state.attemptsOnCurrent = 0;
  state.startedAt = Date.now();

  const meta = OP_META[op];
  renderBreadcrumb([
    {label:'さんすう', onClick: goMath},
    {label: meta.label, onClick: () => goOp(op)},
    {label: s.name},
  ]);

  $('game-title').textContent = s.name;
  renderProgressDots();

  // timer for timed stage
  clearInterval(state.timerHandle);
  if (s.timed) {
    $('game-timer').hidden = false;
    $('timer-val').textContent = '00:00';
    state.timerHandle = setInterval(() => {
      const sec = Math.floor((Date.now() - state.startedAt)/1000);
      $('timer-val').textContent = formatTime(sec);
    }, 250);
  } else {
    $('game-timer').hidden = true;
  }

  loadCurrentProblem();
  showView('game');
  setTimeout(() => $('answer').focus(), 100);
  showToast('drill-toast', `▶ ${s.name} スタート！`, '#ffd76b');
}

function renderProgressDots() {
  const el = $('progress-dots');
  el.innerHTML = '';
  state.problems.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = 'pdot';
    if (i < state.index) d.classList.add('done');
    if (i === state.index) d.classList.add('active');
    el.appendChild(d);
  });
}

function loadCurrentProblem() {
  state.current = state.problems[state.index];
  state.attemptsOnCurrent = 0;
  const p = state.current;
  $('progress-text').textContent = `${state.index + 1} / ${state.problems.length} 問目`;

  const area = $('problem-area');
  if (p.op === 'mul')      renderMulProblem(area, p);
  else if (p.op === 'add') renderAddProblem(area, p);
  else if (p.op === 'sub') renderSubProblem(area, p);
  else if (p.op === 'div') renderDivProblem(area, p);

  renderProgressDots();
  $('answer').value = '';
  $('answer').focus();
}

/* ---------- Problem renderers ---------- */
function renderMulProblem(area, p) {
  const colorName = state.stage.color;
  area.innerHTML = `
    <div class="block-frame mul-frame">
      <div class="block-grid mul-matrix-host" id="block-grid">
        <div class="mul-matrix" id="mul-matrix"></div>
      </div>
    </div>
    <div class="problem-formula" id="problem-formula">
      <span class="f-num f-a">${p.a}</span>
      <span class="f-op">×</span>
      <span class="f-num f-b">${p.b}</span>
      <span class="f-op">=</span>
      <span class="f-num f-q">?</span>
    </div>
  `;
  renderMulMatrix(p.a, p.b, colorName);
}

function renderMulMatrix(rows, cols, colorName) {
  const matrix = $('mul-matrix');
  matrix.innerHTML = '';
  const SIZE = 10; // 1 header + 9 data on each axis
  let blockIdx = 0;

  for (let r = 1; r <= SIZE; r++) {
    for (let c = 1; c <= SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'mat-cell';

      if (r === 1 && c === 1) {
        cell.classList.add('mat-corner');
      } else if (r === 1) {
        // 列ヘッダ（上端）：1〜9 の数字
        const n = c - 1;
        cell.classList.add('mat-header', 'mat-h-col');
        if (n <= cols) cell.classList.add('mat-active');
        cell.textContent = n;
      } else if (c === 1) {
        // 行ヘッダ（左端）：1〜9 の数字
        const n = r - 1;
        cell.classList.add('mat-header', 'mat-h-row');
        if (n <= rows) cell.classList.add('mat-active');
        cell.textContent = n;
      } else {
        // ボディ部 9×9
        const dr = r - 1, dc = c - 1;
        if (dr <= rows && dc <= cols) {
          // 解の長方形に含まれるセル → ブロック
          const cls = colorName === 'rainbow'
            ? `block-${RAINBOW_COLORS[blockIdx % RAINBOW_COLORS.length]}`
            : `block-${colorName}`;
          cell.classList.add('mat-block', cls);
          cell.style.animationDelay = `${Math.min(blockIdx * 25, 600)}ms`;
          blockIdx++;
        } else {
          cell.classList.add('mat-empty');
        }
      }
      matrix.appendChild(cell);
    }
  }
}

function renderAddProblem(area, p) {
  area.innerHTML = `
    <div class="addsub-wrap">
      <div class="addsub-group" id="grp-a"></div>
      <div class="addsub-op">+</div>
      <div class="addsub-group" id="grp-b"></div>
    </div>
    <div class="problem-formula">
      <span class="f-num f-a">${p.a}</span>
      <span class="f-op">+</span>
      <span class="f-num f-b">${p.b}</span>
      <span class="f-op">=</span>
      <span class="f-num f-q">?</span>
    </div>
    <div class="problem-hint">あおい ブロックと あかい ブロック、あわせて いくつ？</div>
  `;
  fillGroup('grp-a', p.a, 'block-diamond');
  fillGroup('grp-b', p.b, 'block-redstone');
}

function renderSubProblem(area, p) {
  area.innerHTML = `
    <div class="addsub-wrap"><div class="addsub-group" id="grp-a"></div></div>
    <div class="problem-formula">
      <span class="f-num f-a">${p.a}</span>
      <span class="f-op">−</span>
      <span class="f-num f-b">${p.b}</span>
      <span class="f-op">=</span>
      <span class="f-num f-q">?</span>
    </div>
    <div class="problem-hint">${p.b} このブロックを とりのぞいたら、のこりは？</div>
  `;
  fillGroup('grp-a', p.a, 'block-gold', p.b);
}

function renderDivProblem(area, p) {
  const hint = p.withRemainder
    ? `${p.b} ずつの グループに わけると、 いくつのグループ できる？（あまりは ヒント表示）`
    : `${p.b} ずつの グループに わけよう。`;
  area.innerHTML = `
    <div class="div-wrap">
      <div class="div-groups" id="div-groups"></div>
    </div>
    <div class="problem-formula">
      <span class="f-num f-a">${p.a}</span>
      <span class="f-op">÷</span>
      <span class="f-num f-b">${p.b}</span>
      <span class="f-op">=</span>
      <span class="f-num f-q">?</span>
    </div>
    <div class="problem-hint">${hint}</div>
  `;
  fillDivGroups('div-groups', p.a, p.b, 'block-emerald');
}

function fillGroup(id, n, cls, crossOut = 0) {
  const box = document.getElementById(id);
  if (!box) return;
  box.innerHTML = '';
  const perRow = n > 10 ? 10 : (n > 5 ? 5 : n);
  box.style.gridTemplateColumns = `repeat(${perRow}, 30px)`;
  for (let i=0; i<n; i++) {
    const blk = document.createElement('div');
    blk.className = `mini-block ${cls}`;
    blk.style.width = '30px';
    blk.style.height = '30px';
    blk.style.animationDelay = `${Math.min(i*30, 600)}ms`;
    if (i >= n - crossOut) blk.classList.add('crossed');
    box.appendChild(blk);
  }
}

function fillDivGroups(id, total, perGroup, cls) {
  const box = document.getElementById(id);
  if (!box) return;
  box.innerHTML = '';
  // visually group `perGroup` blocks into boxes; show remainder on the side
  const groups = Math.floor(total / perGroup);
  const remainder = total - groups * perGroup;
  for (let g=0; g<groups; g++) {
    const gBox = document.createElement('div');
    gBox.className = 'div-group-box';
    gBox.style.gridTemplateColumns = `repeat(${Math.min(perGroup, 5)}, 24px)`;
    for (let i=0; i<perGroup; i++) {
      const blk = document.createElement('div');
      blk.className = `mini-block ${cls}`;
      blk.style.width = '24px';
      blk.style.height = '24px';
      blk.style.animationDelay = `${Math.min(g*20 + i*10, 600)}ms`;
      gBox.appendChild(blk);
    }
    box.appendChild(gBox);
  }
  if (remainder > 0) {
    const rBox = document.createElement('div');
    rBox.className = 'div-group-box div-remainder';
    rBox.style.gridTemplateColumns = `repeat(${Math.min(remainder, 5)}, 24px)`;
    for (let i=0; i<remainder; i++) {
      const blk = document.createElement('div');
      blk.className = `mini-block block-redstone`;
      blk.style.width = '24px';
      blk.style.height = '24px';
      blk.style.animationDelay = `${Math.min(i*10, 400)}ms`;
      rBox.appendChild(blk);
    }
    const tag = document.createElement('div');
    tag.className = 'div-remainder-tag';
    tag.textContent = `あまり ${remainder}`;
    rBox.appendChild(tag);
    box.appendChild(rBox);
  }
}

/* ---------- Submit ---------- */
function submitAnswer(v) {
  if (state.view !== 'game' || !state.current) return;
  const cur = state.current;
  if (v === cur.ans) {
    state.correctCount += 1;
    if (state.attemptsOnCurrent === 0) state.perfectCount += 1;
    const gridEl = $('block-grid') || $('div-groups');
    if (gridEl) gridEl.classList.add('flash-correct');
    document.querySelectorAll('.f-q').forEach(e => e.textContent = cur.ans);
    showToast('drill-toast',
      state.attemptsOnCurrent === 0 ? '⛏ 一発せいかい！' : '✔ せいかい！',
      '#b6ff6e'
    );
    state.index += 1;
    if (state.index >= state.problems.length) setTimeout(finishStage, 500);
    else setTimeout(loadCurrentProblem, 450);
  } else {
    state.attemptsOnCurrent += 1;
    const gridEl = $('block-grid') || $('div-groups') || $('problem-area');
    if (gridEl) { gridEl.classList.add('flash-wrong'); shake(gridEl); }
    if (state.attemptsOnCurrent >= 2) {
      showToast('drill-toast', `ヒント：こたえは ${cur.ans}`, '#ffd76b');
    } else {
      showToast('drill-toast', 'おしい！もういっかい かぞえてみよう', '#ff9a8a');
    }
    setTimeout(() => {
      if (gridEl) gridEl.classList.remove('flash-wrong');
      $('answer').value = '';
      $('answer').focus();
    }, 450);
  }
}

function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

/* ---------- Finish ---------- */
function finishStage() {
  state.endedAt = Date.now();
  clearInterval(state.timerHandle);
  const total = state.problems.length;
  const correct = state.correctCount;
  const perfect = state.perfectCount;
  const seconds = Math.max(1, Math.round((state.endedAt - state.startedAt) / 1000));

  let points = correct * 100 + perfect * 50 + 100;
  // time bonus for timed stage
  if (state.stage.timed) {
    const bonus = Math.max(0, 300 - seconds) * 10;
    points += bonus;
  }
  const isBest = !store.best[state.stage.id] || points > store.best[state.stage.id];
  const isBestTime = state.stage.timed && perfect === total &&
    (!store.bestTime[state.stage.id] || seconds < store.bestTime[state.stage.id]);

  store.totalPoints += points;
  store.plays += 1;
  if (isBest) store.best[state.stage.id] = points;
  if (isBestTime) store.bestTime[state.stage.id] = seconds;
  store.cleared[state.stage.id] = true;
  saveStore();
  renderRankBadge();

  let medal, trophy, title;
  if (perfect === total) { medal='gold'; trophy='🏆'; title='パーフェクト！'; }
  else if (perfect >= Math.ceil(total * 0.7)) { medal='silver'; trophy='💎'; title='ダイヤきゅう クリア！'; }
  else { medal='bronze'; trophy='⭐'; title='ステージ クリア！'; }

  $('result-trophy').textContent = trophy;
  $('result-title').textContent  = title;
  $('result-stage-name').textContent = state.stage.name;
  $('rs-correct').textContent = correct;
  $('rs-total').textContent   = total;
  $('rs-perfect').textContent = perfect;
  $('rs-time').textContent    = formatTime(seconds);
  $('rs-points').textContent  = points;
  $('result-best').hidden = !(isBest || isBestTime);
  if (isBestTime) $('result-best').textContent = '🌟 ベストタイム こうしん！';
  else if (isBest) $('result-best').textContent = '🌟 じこベスト こうしん！';

  const medalRow = $('result-medal-row');
  medalRow.innerHTML = '';
  const tiers = [
    { k:'bronze', label:'クリア',       ok: true },
    { k:'silver', label:'ダイヤきゅう', ok: medal === 'silver' || medal === 'gold' },
    { k:'gold',   label:'パーフェクト', ok: medal === 'gold' },
  ];
  tiers.forEach(t => {
    const el = document.createElement('div');
    el.className = `medal medal-${t.k} ${t.ok ? 'ok' : 'off'}`;
    el.textContent = t.label;
    medalRow.appendChild(el);
  });

  showView('result');
  burstOrbs();
}

/* ---------- Rank badge ---------- */
function renderRankBadge() {
  const pts = store.totalPoints;
  const cur = RANKS[getRankIndex(pts)];
  $('rb-icon').textContent = cur.icon;
  $('rb-name').textContent = cur.name;
  $('rb-points').textContent = pts.toLocaleString();
}

/* ---------- Toast ---------- */
function showToast(id, text, color) {
  const t = $(id);
  if (!t) return;
  t.textContent = text;
  t.style.color = color || '#fff';
  t.classList.remove('pop');
  void t.offsetWidth;
  t.classList.add('pop');
}

/* ---------- Orbs burst (reward) ---------- */
function burstOrbs() {
  const host = $('app');
  for (let i=0; i<16; i++) {
    const orb = document.createElement('div');
    orb.className = 'xp-orb';
    orb.style.left = `${40 + Math.random()*20}%`;
    orb.style.top  = `${40 + Math.random()*20}%`;
    orb.style.setProperty('--dx', `${(Math.random()-0.5)*500}px`);
    orb.style.setProperty('--dy', `${(Math.random()-0.7)*400}px`);
    orb.style.animationDelay = `${Math.random()*0.3}s`;
    host.appendChild(orb);
    setTimeout(() => orb.remove(), 1400);
  }
}

/* =========================================================
   PROGRAMMING MODULE
   ========================================================= */
const PROG_MISSIONS = [
  {
    id:'p1', name:'ミッション 1：まっすぐ すすもう',
    cols:5, rows:5,
    start:{x:0, y:4, dir:'N'},
    goal:{x:0, y:0},
    walls:[],
    par:4,
  },
  {
    id:'p2', name:'ミッション 2：みぎに まがろう',
    cols:5, rows:5,
    start:{x:0, y:4, dir:'N'},
    goal:{x:4, y:0},
    walls:[],
    par:9,
  },
  {
    id:'p3', name:'ミッション 3：しょうがいぶつを よけよう',
    cols:5, rows:5,
    start:{x:0, y:4, dir:'N'},
    goal:{x:4, y:0},
    walls:[{x:0,y:2},{x:1,y:2},{x:2,y:2}],
    par:11,
  },
  {
    id:'p4', name:'ミッション 4：くりかえしを つかおう',
    cols:6, rows:6,
    start:{x:0, y:5, dir:'E'},
    goal:{x:5, y:0},
    walls:[],
    par:5,  // authored-count: loop+F + left + loop+F = 5
    hint:'🔁ループを つかうと すくない めいれいで クリアできるよ',
  },
  {
    id:'p5', name:'ミッション 5：ジグザグ',
    cols:6, rows:6,
    start:{x:0, y:5, dir:'N'},
    goal:{x:5, y:0},
    walls:[{x:2,y:2},{x:2,y:3},{x:3,y:2},{x:3,y:3}],
    par:13,
  },
];

const progState = {
  mission: null,
  sequence: [],       // items: {cmd:'forward'|'right'|'left'} or {cmd:'loop', count:N, body:[...]}
  loopEditingIndex: -1,
  robot: null,        // {x,y,dir}
  running: false,
};

function renderProgMissionGrid() {
  const host = $('prog-mission-grid');
  host.innerHTML = '';
  PROG_MISSIONS.forEach((m, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    const cleared = store.progClear[m.id];
    btn.className = `stage-card stage-diamond`;
    btn.innerHTML = `
      ${cleared ? '<span class="sc-clear">✔</span>' : ''}
      <div class="sc-ico">🤖</div>
      <div class="sc-name">${m.name}</div>
      <div class="sc-sub">マス: ${m.cols}×${m.rows}</div>
      <div class="sc-count">もくひょう ${m.par} めいれい</div>
    `;
    btn.addEventListener('click', () => startProgMission(m.id));
    host.appendChild(btn);
  });
}

function startProgMission(id) {
  const m = PROG_MISSIONS.find(x => x.id === id);
  if (!m) return;
  progState.mission = m;
  progState.sequence = [];
  progState.running = false;
  progState.robot = { x:m.start.x, y:m.start.y, dir:m.start.dir };

  renderBreadcrumb([
    {label:'プログラミング', onClick: goProg},
    {label: m.name},
  ]);
  $('prog-title').textContent = m.name;
  $('prog-status').textContent = `もくひょう: ${m.par} めいれい 以内`;
  $('prog-hint').textContent = m.hint || '🤖ロボットを 🎁チェストまで うごかそう！';
  renderProgSequence();
  drawProgBoard();
  showView('prog-game');
}

/* ---------- Sequence rendering ---------- */
function cmdLabel(cmd) {
  return cmd === 'forward' ? '⬆ すすむ'
    : cmd === 'right'   ? '↻ みぎ'
    : cmd === 'left'    ? '↺ ひだり'
    : cmd === 'loop'    ? '🔁 ループ'
    : cmd;
}

function renderProgSequence() {
  const host = $('prog-sequence');
  host.innerHTML = '';
  if (progState.sequence.length === 0) {
    const ph = document.createElement('div');
    ph.className = 'prog-seq-empty';
    ph.textContent = 'したの めいれいを タップして プログラムを くみたてよう';
    host.appendChild(ph);
    return;
  }
  progState.sequence.forEach((item, idx) => {
    if (item.cmd === 'loop') {
      const wrap = document.createElement('div');
      wrap.className = 'seq-loop';
      wrap.innerHTML = `
        <div class="seq-loop-head">
          🔁 <select class="seq-loop-count" data-idx="${idx}">
            <option value="2" ${item.count===2?'selected':''}>2 回</option>
            <option value="3" ${item.count===3?'selected':''}>3 回</option>
            <option value="4" ${item.count===4?'selected':''}>4 回</option>
          </select>
          くりかえす
          <button type="button" class="seq-del" data-idx="${idx}">✕</button>
        </div>
        <div class="seq-loop-body" data-loop-body="${idx}"></div>
        <button type="button" class="seq-loop-add" data-loop-add="${idx}">＋ ループの なかに ついか</button>
      `;
      host.appendChild(wrap);
      const body = wrap.querySelector(`[data-loop-body="${idx}"]`);
      item.body.forEach((bi, bidx) => {
        const chip = document.createElement('span');
        chip.className = `seq-chip cmd-${bi.cmd}`;
        chip.innerHTML = `${cmdLabel(bi.cmd)} <button type="button" class="seq-del-inner" data-loop-idx="${idx}" data-body-idx="${bidx}">✕</button>`;
        body.appendChild(chip);
      });
    } else {
      const chip = document.createElement('span');
      chip.className = `seq-chip cmd-${item.cmd}`;
      chip.innerHTML = `${cmdLabel(item.cmd)} <button type="button" class="seq-del" data-idx="${idx}">✕</button>`;
      host.appendChild(chip);
    }
  });
}

/* ---------- Add / remove commands ---------- */
function addCmd(cmd) {
  if (progState.running) return;
  if (progState.loopEditingIndex >= 0) {
    const loop = progState.sequence[progState.loopEditingIndex];
    if (loop && loop.cmd === 'loop') {
      if (cmd === 'loop') {
        showToast('prog-toast', 'ループの なかに ループは おけないよ', '#ff9a8a');
        return;
      }
      loop.body.push({ cmd });
      renderProgSequence();
      return;
    }
    progState.loopEditingIndex = -1;
  }
  if (cmd === 'loop') {
    progState.sequence.push({ cmd:'loop', count:2, body:[] });
  } else {
    progState.sequence.push({ cmd });
  }
  renderProgSequence();
}

/* ---------- Expand loops into flat command list ---------- */
function flattenSequence(seq) {
  const out = [];
  seq.forEach(item => {
    if (item.cmd === 'loop') {
      for (let i=0; i<item.count; i++) item.body.forEach(b => out.push(b.cmd));
    } else {
      out.push(item.cmd);
    }
  });
  return out;
}

/* ---------- Run ---------- */
const DIR_DELTA = { N:[0,-1], E:[1,0], S:[0,1], W:[-1,0] };
const DIR_RIGHT = { N:'E', E:'S', S:'W', W:'N' };
const DIR_LEFT  = { N:'W', W:'S', S:'E', E:'N' };

async function runProgram() {
  if (progState.running) return;
  const m = progState.mission;
  if (!m) return;
  const cmds = flattenSequence(progState.sequence);
  if (cmds.length === 0) {
    showToast('prog-toast', 'プログラムを くみたててから じっこう！', '#ffd76b');
    return;
  }
  progState.running = true;
  progState.robot = { x:m.start.x, y:m.start.y, dir:m.start.dir };
  drawProgBoard();
  await sleep(300);

  for (let i=0; i<cmds.length; i++) {
    const c = cmds[i];
    if (c === 'forward') {
      const [dx,dy] = DIR_DELTA[progState.robot.dir];
      const nx = progState.robot.x + dx, ny = progState.robot.y + dy;
      if (nx < 0 || ny < 0 || nx >= m.cols || ny >= m.rows) {
        drawProgBoard({shake:true});
        showToast('prog-toast', 'そとに でちゃった！おしい！', '#ff9a8a');
        progState.running = false;
        return;
      }
      if (m.walls.some(w => w.x===nx && w.y===ny)) {
        drawProgBoard({shake:true});
        showToast('prog-toast', 'かべに ぶつかった！もういちど', '#ff9a8a');
        progState.running = false;
        return;
      }
      progState.robot.x = nx; progState.robot.y = ny;
    } else if (c === 'right') {
      progState.robot.dir = DIR_RIGHT[progState.robot.dir];
    } else if (c === 'left') {
      progState.robot.dir = DIR_LEFT[progState.robot.dir];
    }
    drawProgBoard();
    await sleep(280);
  }

  // check goal
  if (progState.robot.x === m.goal.x && progState.robot.y === m.goal.y) {
    drawProgBoard({celebrate:true});
    showToast('prog-toast', '🎉 クリア！', '#b6ff6e');
    finishProgMission(countAuthored(progState.sequence));
  } else {
    showToast('prog-toast', 'チェストに たどりつかなかった…もういちど！', '#ff9a8a');
  }
  progState.running = false;
}

function countAuthored(seq) {
  let c = 0;
  seq.forEach(item => {
    if (item.cmd === 'loop') c += 1 + item.body.length;
    else c += 1;
  });
  return c;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function finishProgMission(cmdCount) {
  const m = progState.mission;
  const par = m.par;
  const isPar = cmdCount <= par;
  const points = isPar ? 800 : 400;
  store.totalPoints += points;
  store.progClear[m.id] = Math.min(store.progClear[m.id] || 9999, cmdCount);
  saveStore();
  renderRankBadge();

  let trophy, title, medal;
  if (isPar) { trophy='🏆'; title='パーフェクト！'; medal='gold'; }
  else       { trophy='⭐'; title='クリア！';       medal='bronze'; }

  $('pr-trophy').textContent = trophy;
  $('pr-title').textContent = title;
  $('pr-mission-name').textContent = m.name;
  $('pr-cmd-count').textContent = cmdCount;
  $('pr-points').textContent = points;

  const medalRow = $('pr-medal-row');
  medalRow.innerHTML = '';
  const tiers = [
    { k:'bronze', label:'クリア',       ok: true },
    { k:'silver', label:`${par+2}以内`, ok: cmdCount <= par+2 },
    { k:'gold',   label:`${par}以内`,   ok: isPar },
  ];
  tiers.forEach(t => {
    const el = document.createElement('div');
    el.className = `medal medal-${t.k} ${t.ok ? 'ok' : 'off'}`;
    el.textContent = t.label;
    medalRow.appendChild(el);
  });

  setTimeout(() => { showView('prog-result'); burstOrbs(); }, 600);
}

/* ---------- Draw board ---------- */
function drawProgBoard(opts = {}) {
  const canvas = $('prog-canvas');
  const ctx = canvas.getContext('2d');
  const m = progState.mission;
  if (!m) return;
  const cell = Math.floor(Math.min(canvas.width, canvas.height) / Math.max(m.cols, m.rows));
  const offX = Math.floor((canvas.width  - cell*m.cols) / 2);
  const offY = Math.floor((canvas.height - cell*m.rows) / 2);
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // background grass pattern
  for (let y=0; y<m.rows; y++) {
    for (let x=0; x<m.cols; x++) {
      const px = offX + x*cell, py = offY + y*cell;
      ctx.fillStyle = ((x+y) % 2 === 0) ? '#7cc34a' : '#6aab3e';
      ctx.fillRect(px, py, cell, cell);
      ctx.strokeStyle = '#3d6b21';
      ctx.lineWidth = 2;
      ctx.strokeRect(px, py, cell, cell);
    }
  }

  // walls
  m.walls.forEach(w => {
    const px = offX + w.x*cell, py = offY + w.y*cell;
    ctx.fillStyle = '#6f6f6f';
    ctx.fillRect(px+2, py+2, cell-4, cell-4);
    ctx.fillStyle = '#9a9a9a';
    ctx.fillRect(px+4, py+4, cell-12, cell-12);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.strokeRect(px+2, py+2, cell-4, cell-4);
  });

  // goal (chest)
  {
    const g = m.goal;
    const px = offX + g.x*cell, py = offY + g.y*cell;
    ctx.fillStyle = '#b2855a';
    ctx.fillRect(px+6, py+10, cell-12, cell-16);
    ctx.fillStyle = '#6d4d2e';
    ctx.fillRect(px+6, py+10, cell-12, 6);
    ctx.fillStyle = '#fbd24a';
    ctx.fillRect(px + cell/2 - 3, py + cell/2 - 2, 6, 6);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.strokeRect(px+6, py+10, cell-12, cell-16);
  }

  // robot
  const r = progState.robot;
  const px = offX + r.x*cell, py = offY + r.y*cell;
  const cx = px + cell/2, cy = py + cell/2;
  // body
  ctx.fillStyle = opts.celebrate ? '#fbd24a' : '#5ce9e6';
  ctx.fillRect(px+6, py+6, cell-12, cell-12);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 3;
  ctx.strokeRect(px+6, py+6, cell-12, cell-12);
  // face (arrow)
  ctx.fillStyle = '#111';
  ctx.beginPath();
  const arrowLen = cell*0.25;
  const dir = r.dir;
  if (dir === 'N') { ctx.moveTo(cx, cy-arrowLen); ctx.lineTo(cx-arrowLen*0.7, cy); ctx.lineTo(cx+arrowLen*0.7, cy); }
  else if (dir === 'S') { ctx.moveTo(cx, cy+arrowLen); ctx.lineTo(cx-arrowLen*0.7, cy); ctx.lineTo(cx+arrowLen*0.7, cy); }
  else if (dir === 'E') { ctx.moveTo(cx+arrowLen, cy); ctx.lineTo(cx, cy-arrowLen*0.7); ctx.lineTo(cx, cy+arrowLen*0.7); }
  else if (dir === 'W') { ctx.moveTo(cx-arrowLen, cy); ctx.lineTo(cx, cy-arrowLen*0.7); ctx.lineTo(cx, cy+arrowLen*0.7); }
  ctx.closePath();
  ctx.fill();

  if (opts.shake) {
    canvas.classList.remove('prog-shake');
    void canvas.offsetWidth;
    canvas.classList.add('prog-shake');
  }
  if (opts.celebrate) {
    canvas.classList.remove('prog-celebrate');
    void canvas.offsetWidth;
    canvas.classList.add('prog-celebrate');
  }
}

/* =========================================================
   Event wiring
   ========================================================= */

// Top bar
$('home-btn').addEventListener('click', goHome);

// Home menu
document.querySelectorAll('[data-go]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-go');
    if (target === 'math') goMath();
    else if (target === 'prog') goProg();
    else if (target === 'type') goTypeMenu();
    else if (target === 'type:defense') goTypeDefense();
    else if (target === 'type:kimi') goTypeKimi();
    else if (target.startsWith('op:')) goOp(target.slice(3));
  });
});

// Answer form
$('answer-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const v = parseInt($('answer').value, 10);
  if (Number.isNaN(v)) return;
  submitAnswer(v);
});

// Game back
$('back-btn').addEventListener('click', () => {
  if (confirm('もどる？（このステージの しんこうは リセット）')) {
    clearInterval(state.timerHandle);
    goOp(state.op);
  }
});

// Result buttons
$('retry-btn').addEventListener('click', () => {
  if (state.stage) startStage(state.op, state.stage.id);
});
$('to-select-btn').addEventListener('click', () => goOp(state.op));

// Programming events
$('prog-back-btn').addEventListener('click', goProg);
$('prog-clear').addEventListener('click', () => {
  if (progState.running) return;
  progState.sequence = [];
  progState.loopEditingIndex = -1;
  renderProgSequence();
});
$('prog-run').addEventListener('click', runProgram);
document.querySelectorAll('.cmd-btn').forEach(btn => {
  btn.addEventListener('click', () => addCmd(btn.getAttribute('data-cmd')));
});

// Sequence interactions (delegated)
$('prog-sequence').addEventListener('click', (e) => {
  if (progState.running) return;
  const t = e.target;
  if (t.classList.contains('seq-del')) {
    const idx = parseInt(t.getAttribute('data-idx'), 10);
    progState.sequence.splice(idx, 1);
    progState.loopEditingIndex = -1;
    renderProgSequence();
  } else if (t.classList.contains('seq-del-inner')) {
    const li = parseInt(t.getAttribute('data-loop-idx'), 10);
    const bi = parseInt(t.getAttribute('data-body-idx'), 10);
    progState.sequence[li].body.splice(bi, 1);
    renderProgSequence();
  } else if (t.hasAttribute('data-loop-add')) {
    progState.loopEditingIndex = parseInt(t.getAttribute('data-loop-add'), 10);
    document.querySelectorAll('.seq-loop-add').forEach(el => el.classList.remove('active'));
    t.classList.add('active');
    showToast('prog-toast', 'つぎに おした めいれいが ループに はいるよ', '#ffd76b');
  }
});
$('prog-sequence').addEventListener('change', (e) => {
  if (e.target.classList.contains('seq-loop-count')) {
    const idx = parseInt(e.target.getAttribute('data-idx'), 10);
    progState.sequence[idx].count = parseInt(e.target.value, 10);
  }
});

// Prog result buttons
$('pr-retry').addEventListener('click', () => {
  if (progState.mission) startProgMission(progState.mission.id);
});
$('pr-menu').addEventListener('click', goProg);

/* =========================================================
   TYPING MODULE
   ========================================================= */

/* Per-kana romaji alternatives. First entry = Hepburn-preferred (used for
 * display). Any listed spelling is accepted at match time, so kids can type
 * 'shi' OR 'si', 'chi' OR 'ti', 'tsu' OR 'tu' etc. */
const KANA_ROMAJI = {
  // 母音
  'あ':['a'], 'い':['i'], 'う':['u'], 'え':['e'], 'お':['o'],
  // か行
  'か':['ka'], 'き':['ki'], 'く':['ku'], 'け':['ke'], 'こ':['ko'],
  'が':['ga'], 'ぎ':['gi'], 'ぐ':['gu'], 'げ':['ge'], 'ご':['go'],
  // さ行
  'さ':['sa'], 'し':['shi','si'], 'す':['su'], 'せ':['se'], 'そ':['so'],
  'ざ':['za'], 'じ':['ji','zi'], 'ず':['zu'], 'ぜ':['ze'], 'ぞ':['zo'],
  // た行
  'た':['ta'], 'ち':['chi','ti'], 'つ':['tsu','tu'], 'て':['te'], 'と':['to'],
  'だ':['da'], 'ぢ':['di'], 'づ':['du'], 'で':['de'], 'ど':['do'],
  // な行
  'な':['na'], 'に':['ni'], 'ぬ':['nu'], 'ね':['ne'], 'の':['no'],
  // は行
  'は':['ha'], 'ひ':['hi'], 'ふ':['fu','hu'], 'へ':['he'], 'ほ':['ho'],
  'ば':['ba'], 'び':['bi'], 'ぶ':['bu'], 'べ':['be'], 'ぼ':['bo'],
  'ぱ':['pa'], 'ぴ':['pi'], 'ぷ':['pu'], 'ぺ':['pe'], 'ぽ':['po'],
  // ま行
  'ま':['ma'], 'み':['mi'], 'む':['mu'], 'め':['me'], 'も':['mo'],
  // や行
  'や':['ya'], 'ゆ':['yu'], 'よ':['yo'],
  // ら行
  'ら':['ra'], 'り':['ri'], 'る':['ru'], 'れ':['re'], 'ろ':['ro'],
  // わ行
  'わ':['wa'], 'を':['wo','o'], 'ん':['nn','n','xn'],
  // 小書き（単独）
  'ぁ':['xa','la'], 'ぃ':['xi','li'], 'ぅ':['xu','lu'], 'ぇ':['xe','le'], 'ぉ':['xo','lo'],
  'ゃ':['xya','lya'], 'ゅ':['xyu','lyu'], 'ょ':['xyo','lyo'],
  // 拗音
  'きゃ':['kya'],         'きゅ':['kyu'],         'きょ':['kyo'],
  'しゃ':['sha','sya'],   'しゅ':['shu','syu'],   'しょ':['sho','syo'],
  'ちゃ':['cha','tya'],   'ちゅ':['chu','tyu'],   'ちょ':['cho','tyo'],
  'にゃ':['nya'],         'にゅ':['nyu'],         'にょ':['nyo'],
  'ひゃ':['hya'],         'ひゅ':['hyu'],         'ひょ':['hyo'],
  'みゃ':['mya'],         'みゅ':['myu'],         'みょ':['myo'],
  'りゃ':['rya'],         'りゅ':['ryu'],         'りょ':['ryo'],
  'ぎゃ':['gya'],         'ぎゅ':['gyu'],         'ぎょ':['gyo'],
  'じゃ':['ja','zya','jya'], 'じゅ':['ju','zyu','jyu'], 'じょ':['jo','zyo','jyo'],
  'びゃ':['bya'],         'びゅ':['byu'],         'びょ':['byo'],
  'ぴゃ':['pya'],         'ぴゅ':['pyu'],         'ぴょ':['pyo'],
  // カタカナ
  'ア':['a'], 'イ':['i'], 'ウ':['u'], 'エ':['e'], 'オ':['o'],
  'カ':['ka'], 'キ':['ki'], 'ク':['ku'], 'ケ':['ke'], 'コ':['ko'],
  'ガ':['ga'], 'ギ':['gi'], 'グ':['gu'], 'ゲ':['ge'], 'ゴ':['go'],
  'サ':['sa'], 'シ':['shi','si'], 'ス':['su'], 'セ':['se'], 'ソ':['so'],
  'ザ':['za'], 'ジ':['ji','zi'], 'ズ':['zu'], 'ゼ':['ze'], 'ゾ':['zo'],
  'タ':['ta'], 'チ':['chi','ti'], 'ツ':['tsu','tu'], 'テ':['te'], 'ト':['to'],
  'ダ':['da'], 'ヂ':['di'], 'ヅ':['du'], 'デ':['de'], 'ド':['do'],
  'ナ':['na'], 'ニ':['ni'], 'ヌ':['nu'], 'ネ':['ne'], 'ノ':['no'],
  'ハ':['ha'], 'ヒ':['hi'], 'フ':['fu','hu'], 'ヘ':['he'], 'ホ':['ho'],
  'バ':['ba'], 'ビ':['bi'], 'ブ':['bu'], 'ベ':['be'], 'ボ':['bo'],
  'パ':['pa'], 'ピ':['pi'], 'プ':['pu'], 'ペ':['pe'], 'ポ':['po'],
  'マ':['ma'], 'ミ':['mi'], 'ム':['mu'], 'メ':['me'], 'モ':['mo'],
  'ヤ':['ya'], 'ユ':['yu'], 'ヨ':['yo'],
  'ラ':['ra'], 'リ':['ri'], 'ル':['ru'], 'レ':['re'], 'ロ':['ro'],
  'ワ':['wa'], 'ヲ':['wo','o'], 'ン':['nn','n','xn'],
  'ャ':['xya','lya'], 'ュ':['xyu','lyu'], 'ョ':['xyo','lyo'],
  'キャ':['kya'],         'キュ':['kyu'],         'キョ':['kyo'],
  'シャ':['sha','sya'],   'シュ':['shu','syu'],   'ショ':['sho','syo'],
  'チャ':['cha','tya'],   'チュ':['chu','tyu'],   'チョ':['cho','tyo'],
  'ニャ':['nya'],         'ニュ':['nyu'],         'ニョ':['nyo'],
  'ヒャ':['hya'],         'ヒュ':['hyu'],         'ヒョ':['hyo'],
  'ミャ':['mya'],         'ミュ':['myu'],         'ミョ':['myo'],
  'リャ':['rya'],         'リュ':['ryu'],         'リョ':['ryo'],
  'ギャ':['gya'],         'ギュ':['gyu'],         'ギョ':['gyo'],
  'ジャ':['ja','zya','jya'], 'ジュ':['ju','zyu','jyu'], 'ジョ':['jo','zyo','jyo'],
  'ビャ':['bya'],         'ビュ':['byu'],         'ビョ':['byo'],
  'ピャ':['pya'],         'ピュ':['pyu'],         'ピョ':['pyo'],
};

const SMALL_YOUON = 'ゃゅょャュョ';
const isSokuon = u => u === 'っ' || u === 'ッ';
const isChouon = u => u === 'ー';

function expandUnits(kana) {
  const units = [];
  for (let i = 0; i < kana.length; i++) {
    const ch = kana[i], nx = kana[i+1];
    if (nx && SMALL_YOUON.includes(nx) && KANA_ROMAJI[ch + nx]) {
      units.push(ch + nx); i++;
    } else {
      units.push(ch);
    }
  }
  return units;
}

function lastVowelOf(unit) {
  const alts = KANA_ROMAJI[unit];
  if (!alts) return null;
  for (const a of alts) {
    const last = a[a.length - 1];
    if ('aeiou'.includes(last)) return last;
  }
  return null;
}

function unitAlts(unit) {
  if (isSokuon(unit)) return ['xtu','xtsu','ltu','ltsu'];
  if (isChouon(unit)) return ['-'];
  if (unit === ' ')  return [' '];
  return KANA_ROMAJI[unit] || [unit];
}

/* Enumerate every acceptable romaji string for the given kana. First result is
 * the Hepburn-preferred canonical (used for display). */
function enumerateRomaji(kana) {
  const units = expandUnits(kana);
  let results = [''];
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    const prev = i > 0 ? units[i-1] : null;
    const next = i + 1 < units.length ? units[i+1] : null;
    const out = [];
    if (isSokuon(u)) {
      // doubled consonant of next unit's alternatives (standard IME style)
      if (next) {
        const firstConsonants = new Set();
        (unitAlts(next) || []).forEach(na => {
          if (na.length > 0 && !'aeiou'.includes(na[0])) firstConsonants.add(na[0]);
        });
        firstConsonants.forEach(c => results.forEach(r => out.push(r + c)));
      }
      // explicit variants
      unitAlts(u).forEach(a => results.forEach(r => out.push(r + a)));
    } else if (isChouon(u)) {
      const pv = prev ? lastVowelOf(prev) : null;
      const alts = [];
      if (pv) alts.push(pv);
      alts.push('-');
      alts.forEach(a => results.forEach(r => out.push(r + a)));
    } else {
      unitAlts(u).forEach(a => results.forEach(r => out.push(r + a)));
    }
    results = out;
  }
  const seen = new Set(); const dedup = [];
  results.forEach(r => { if (!seen.has(r)) { seen.add(r); dedup.push(r); } });
  return dedup;
}

function canonicalRomaji(kana) { return enumerateRomaji(kana)[0] || ''; }

/* Matcher: feed chars one by one; reports reject / progress / done. */
function createMatcher(kana) {
  const all = enumerateRomaji(kana);
  return {
    all,
    valid: all.slice(),
    typed: '',
    done: false,
    peek(ch) {
      if (this.done) return false;
      const nt = this.typed + ch;
      return this.valid.some(c => c.startsWith(nt));
    },
    consume(ch) {
      if (this.done) return 'reject';
      const nt = this.typed + ch;
      const nv = this.valid.filter(c => c.startsWith(nt));
      if (nv.length === 0) return 'reject';
      this.valid = nv;
      this.typed = nt;
      if (nv.some(c => c === nt)) { this.done = true; return 'done'; }
      return 'progress';
    },
    currentDisplay() { return this.valid[0] || this.all[0] || ''; },
  };
}

const TYPING_WORDS = [
  // 短い（小1〜2でも打てる）
  { kana:'いし',   tier:1 },
  { kana:'き',     tier:1 },
  { kana:'つち',   tier:1 },
  { kana:'すな',   tier:1 },
  { kana:'みず',   tier:1 },
  { kana:'くさ',   tier:1 },
  { kana:'うし',   tier:1 },
  { kana:'ぶた',   tier:1 },
  { kana:'はな',   tier:1 },
  { kana:'ドア',   tier:1 },
  // 中くらい
  { kana:'かまど',   tier:2 },
  { kana:'はしご',   tier:2 },
  { kana:'ダイヤ',   tier:2 },
  { kana:'ゾンビ',   tier:2 },
  { kana:'まもの',   tier:2 },
  { kana:'たいまつ', tier:2 },
  { kana:'ようがん', tier:2 },
  { kana:'ピストン', tier:2 },
  { kana:'つるはし', tier:2 },
  { kana:'てつ',     tier:2 },
  // 長い
  { kana:'レッドストーン', tier:3 },
  { kana:'クリーパー',     tier:3 },
  { kana:'エンダーマン',   tier:3 },
  { kana:'ネザライト',     tier:3 },
  { kana:'エメラルド',     tier:3 },
  { kana:'アメジスト',     tier:3 },
  { kana:'こくようせき',   tier:3 },
  { kana:'ビーコン',       tier:3 },
  { kana:'エンチャント',   tier:3 },
  { kana:'スケルトン',     tier:3 },
];

const KIMIGAYO_LINES = [
  { kana:'きみがよは' },
  { kana:'ちよに やちよに' },
  { kana:'さざれいしの' },
  { kana:'いわおと なりて' },
  { kana:'こけの むすまで' },
];

const typeState = {
  mode: null,         // 'defense' | 'kimi'
  running: false,
  // --- defense ---
  arena: null,
  blocks: [],         // {id, el, kana, romaji, progress, top, speed, tier}
  activeId: null,
  nextBlockId: 1,
  score: 0,
  combo: 0,
  lives: 3,
  timeLeft: 60,
  spawnEvery: 2200,   // ms, shrinks over time
  spawnTimer: 0,
  lastTick: 0,
  loopHandle: 0,
  startedAt: 0,
  // --- kimi ---
  kimiPos: 0,          // index into flatRomaji
  kimiFlat: '',        // concatenated romaji
  kimiLineBreaks: [],  // cumulative length at which a new line begins
  kimiStartAt: 0,
  kimiTimerHandle: 0,
  kimiMistakes: 0,
};

/* ---------- Nav ---------- */
function goTypeMenu() {
  stopDefense();
  stopKimi();
  renderBreadcrumb([{label:'タイピング'}]);
  showView('type-menu');
}
function goTypeDefense() {
  stopDefense();
  renderBreadcrumb([
    {label:'タイピング', onClick: goTypeMenu},
    {label:'ワードディフェンス'},
  ]);
  resetDefenseUI();
  showView('type-defense');
}
function goTypeKimi() {
  stopKimi();
  renderBreadcrumb([
    {label:'タイピング', onClick: goTypeMenu},
    {label:'君が代タイムアタック'},
  ]);
  resetKimiUI();
  showView('type-kimi');
}

/* ---------- Word Defense ---------- */
function resetDefenseUI() {
  typeState.mode = 'defense';
  typeState.running = false;
  typeState.blocks.forEach(b => b.el.remove());
  typeState.blocks = [];
  typeState.activeId = null;
  typeState.score = 0;
  typeState.combo = 0;
  typeState.lives = 3;
  typeState.timeLeft = 60;
  typeState.spawnEvery = 2200;
  typeState.spawnTimer = 0;
  updateDefenseHud();
  $('td-state').textContent = 'おしたら スタート';
  $('td-start').hidden = false;
  $('td-start').textContent = '▶ スタート';
  $('td-typed').innerHTML = '<span class="td-typed-placeholder">単語を みて タイピング！</span>';
}

function startDefense() {
  resetDefenseUI();
  typeState.running = true;
  typeState.startedAt = Date.now();
  typeState.lastTick = performance.now();
  typeState.spawnTimer = 0;
  $('td-start').hidden = true;
  $('td-state').textContent = '🛡 まもれ！';
  $('td-typed').innerHTML = '<span class="td-typed-placeholder">単語を みて タイピング！</span>';
  const kb = $('td-keyboard'); if (kb) { kb.value=''; kb.focus(); }
  spawnBlock();
  if (typeState.loopHandle) cancelAnimationFrame(typeState.loopHandle);
  const tick = (now) => {
    if (!typeState.running) return;
    const dt = Math.min(100, now - typeState.lastTick);
    typeState.lastTick = now;
    defenseStep(dt);
    typeState.loopHandle = requestAnimationFrame(tick);
  };
  typeState.loopHandle = requestAnimationFrame(tick);
}

function stopDefense() {
  typeState.running = false;
  if (typeState.loopHandle) cancelAnimationFrame(typeState.loopHandle);
  typeState.loopHandle = 0;
}

function defenseStep(dt) {
  // time
  const elapsed = (Date.now() - typeState.startedAt) / 1000;
  typeState.timeLeft = Math.max(0, 60 - Math.floor(elapsed));
  // difficulty scaling: driven by SCORE, not time.
  // score 0 → slow and sparse.  score 3000+ → fast and dense.
  const ramp = Math.min(1, typeState.score / 3000);
  typeState.spawnEvery = 2600 - ramp * 1400;  // 2600ms → 1200ms
  typeState.currentRamp = ramp;                // shared with spawnBlock

  // spawn
  typeState.spawnTimer += dt;
  if (typeState.spawnTimer >= typeState.spawnEvery && typeState.blocks.length < 6) {
    typeState.spawnTimer = 0;
    spawnBlock();
  }

  // fall
  const arena = $('td-arena');
  const arenaH = arena.clientHeight;
  const bottomY = arenaH - 54;
  typeState.blocks.forEach(b => {
    b.top += b.speed * (dt / 1000);
    b.el.style.top = `${b.top}px`;
    if (b.top >= bottomY) {
      // hit ground — lose life
      b.el.classList.add('td-block-smash');
      setTimeout(() => b.el.remove(), 300);
      typeState.blocks = typeState.blocks.filter(x => x.id !== b.id);
      if (typeState.activeId === b.id) { typeState.activeId = null; updateTypedDisplay(); }
      loseLife();
    }
  });

  updateDefenseHud();
  if (typeState.timeLeft <= 0) finishDefense(false);
  if (typeState.lives <= 0) finishDefense(true);
}

function spawnBlock() {
  const ramp = typeState.currentRamp || 0;  // 0〜1, score-based
  // tier bias by score ramp: low score → mostly tier1, high score → tier2/3 mix
  const r = Math.random();
  let tier;
  if (ramp < 0.25)      tier = r < 0.85 ? 1 : 2;
  else if (ramp < 0.6)  tier = r < 0.5  ? 1 : r < 0.9 ? 2 : 3;
  else                  tier = r < 0.25 ? 1 : r < 0.65 ? 2 : 3;
  const pool = TYPING_WORDS.filter(w => w.tier === tier);
  const w = pool[Math.floor(Math.random() * pool.length)];

  const arena = $('td-arena');
  const arenaW = arena.clientWidth;
  const el = document.createElement('div');
  el.className = `td-block td-block-t${tier}`;
  el.innerHTML = `
    <div class="tb-kana">${w.kana}</div>
    <div class="tb-romaji" data-romaji="${w.romaji}">
      <span class="tb-done"></span><span class="tb-rest">${w.romaji}</span>
    </div>
  `;
  const left = Math.max(4, Math.floor(Math.random() * (arenaW - 140)));
  el.style.left = `${left}px`;
  el.style.top = '0px';
  arena.appendChild(el);

  // fall speed (px/sec): base + tier bonus + score-ramp bonus
  const baseSpeed = 18;
  const tierBonus = tier * 6;
  const scoreBonus = ramp * 60;  // up to +60 px/sec at score 3000+
  const b = {
    id: typeState.nextBlockId++,
    el,
    kana: w.kana,
    romaji: w.romaji,
    progress: 0,
    top: 0,
    speed: baseSpeed + tierBonus + scoreBonus,
    tier,
  };
  typeState.blocks.push(b);
}

function loseLife() {
  typeState.combo = 0;
  typeState.lives -= 1;
  flashRed();
  showToast('td-toast', '💥 ブロックが ちゃくちした！', '#ff9a8a');
}
function flashRed() {
  const a = $('td-arena');
  a.classList.remove('td-flash-red');
  void a.offsetWidth;
  a.classList.add('td-flash-red');
}

function updateDefenseHud() {
  $('td-score').textContent = typeState.score.toLocaleString();
  $('td-combo').textContent = typeState.combo;
  $('td-time').textContent  = typeState.timeLeft;
  $('td-lives').textContent = '♥'.repeat(Math.max(0, typeState.lives)) + '♡'.repeat(Math.max(0, 3 - typeState.lives));
  $('td-combo').parentElement.classList.toggle('combo-hot', typeState.combo >= 5);
}

function handleDefenseKey(ch) {
  if (!typeState.running) return;
  // If no active, try to pick one whose next char matches
  if (typeState.activeId == null) {
    const candidate = typeState.blocks.find(b => b.romaji[b.progress] === ch);
    if (candidate) {
      typeState.activeId = candidate.id;
    } else {
      // miss when idle → no penalty
      return;
    }
  }
  const b = typeState.blocks.find(x => x.id === typeState.activeId);
  if (!b) { typeState.activeId = null; return; }
  if (b.romaji[b.progress] === ch) {
    b.progress += 1;
    b.el.classList.add('td-block-hit');
    setTimeout(() => b.el.classList.remove('td-block-hit'), 120);
    refreshBlockDisplay(b);
    updateTypedDisplay(b);
    if (b.progress >= b.romaji.length) {
      // destroyed!
      typeState.combo += 1;
      const mult = 1 + Math.floor(typeState.combo / 5) * 0.5;
      const gained = Math.round((b.tier * 50 + b.romaji.length * 10) * mult);
      typeState.score += gained;
      spawnScorePop(b.el, `+${gained}`);
      b.el.classList.add('td-block-smash');
      setTimeout(() => b.el.remove(), 360);
      typeState.blocks = typeState.blocks.filter(x => x.id !== b.id);
      typeState.activeId = null;
      updateTypedDisplay();
      updateDefenseHud();
    }
  } else {
    // typo: break combo, blink
    typeState.combo = 0;
    b.el.classList.add('td-block-wrong');
    setTimeout(() => b.el.classList.remove('td-block-wrong'), 200);
    showToast('td-toast', 'おしい！タイプミス', '#ff9a8a');
    updateDefenseHud();
  }
}

function refreshBlockDisplay(b) {
  const done = b.romaji.slice(0, b.progress);
  const rest = b.romaji.slice(b.progress);
  const doneEl = b.el.querySelector('.tb-done');
  const restEl = b.el.querySelector('.tb-rest');
  if (doneEl) doneEl.textContent = done;
  if (restEl) restEl.textContent = rest;
}

function updateTypedDisplay(b) {
  const host = $('td-typed');
  if (!b || !typeState.running) {
    host.innerHTML = '<span class="td-typed-placeholder">単語を みて タイピング！</span>';
    return;
  }
  host.innerHTML = `
    <span class="tt-kana">${b.kana}</span>
    <span class="tt-romaji">
      <span class="tt-done">${b.romaji.slice(0, b.progress)}</span><span class="tt-cursor">|</span><span class="tt-rest">${b.romaji.slice(b.progress)}</span>
    </span>
  `;
}

function spawnScorePop(srcEl, text) {
  const rect = srcEl.getBoundingClientRect();
  const host = $('td-arena');
  const hostRect = host.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.className = 'td-score-pop';
  pop.textContent = text;
  pop.style.left = `${rect.left - hostRect.left + 20}px`;
  pop.style.top  = `${rect.top - hostRect.top}px`;
  host.appendChild(pop);
  setTimeout(() => pop.remove(), 900);
  burstOrbsAt(rect.left + rect.width/2, rect.top + rect.height/2, 8);
}

function burstOrbsAt(cx, cy, n) {
  for (let i=0; i<n; i++) {
    const orb = document.createElement('div');
    orb.className = 'xp-orb';
    orb.style.left = `${cx}px`;
    orb.style.top  = `${cy}px`;
    orb.style.setProperty('--dx', `${(Math.random()-0.5)*200}px`);
    orb.style.setProperty('--dy', `${(Math.random()-0.5)*160 - 40}px`);
    orb.style.animationDelay = `${Math.random()*0.15}s`;
    document.body.appendChild(orb);
    setTimeout(() => orb.remove(), 1400);
  }
}

function finishDefense(gameOver) {
  if (!typeState.running) return;
  stopDefense();
  typeState.blocks.forEach(b => b.el.remove());
  typeState.blocks = [];
  typeState.activeId = null;

  const prev = store.typeBest.defense || 0;
  const isBest = typeState.score > prev;
  if (isBest) store.typeBest.defense = typeState.score;
  store.totalPoints += Math.floor(typeState.score / 2);
  saveStore();
  renderRankBadge();

  const trophy = isBest ? '🏆' : (gameOver ? '💀' : '⭐');
  const title = gameOver ? 'ゲーム オーバー' : (isBest ? 'ベスト こうしん！' : 'タイム アップ！');
  showTypingResult({
    trophy, title,
    modeName: '🧟 ワードディフェンス',
    stats: [
      { label:'スコア', value: typeState.score.toLocaleString() },
      { label:'ベスト', value: store.typeBest.defense.toLocaleString() },
      { label:'もらえた P', value: '+' + Math.floor(typeState.score / 2).toLocaleString() },
    ],
    isBest,
    medals: [
      { k:'bronze', label:'プレイ',   ok: true },
      { k:'silver', label:'1000 P',   ok: typeState.score >= 1000 },
      { k:'gold',   label:'3000 P',   ok: typeState.score >= 3000 },
    ],
  });
}

/* ---------- Kimigayo ---------- */
function resetKimiUI() {
  typeState.mode = 'kimi';
  typeState.running = false;
  typeState.kimiPos = 0;
  typeState.kimiMistakes = 0;
  // build flat romaji + line breaks
  let flat = '';
  const breaks = [];
  KIMIGAYO_LINES.forEach((line, i) => {
    if (i > 0) flat += '\n';
    breaks.push(flat.length);
    flat += line.romaji;
  });
  typeState.kimiFlat = flat;
  typeState.kimiLineBreaks = breaks;

  // render lines with per-char spans
  const host = $('kk-lines');
  host.innerHTML = '';
  KIMIGAYO_LINES.forEach(line => {
    const lineEl = document.createElement('div');
    lineEl.className = 'kk-line';
    const kanaEl = document.createElement('div');
    kanaEl.className = 'kk-kana';
    kanaEl.textContent = line.kana;
    const romajiEl = document.createElement('div');
    romajiEl.className = 'kk-romaji';
    for (const ch of line.romaji) {
      const s = document.createElement('span');
      s.className = 'kk-ch';
      s.textContent = ch === ' ' ? '␣' : ch;
      s.dataset.expected = ch;
      romajiEl.appendChild(s);
    }
    lineEl.appendChild(kanaEl);
    lineEl.appendChild(romajiEl);
    host.appendChild(lineEl);
  });

  // best
  if (store.kimiBest) $('kk-best').textContent = `ベスト ⏱ ${formatKimiTime(store.kimiBest)}`;
  else $('kk-best').textContent = '';

  $('kk-timer').textContent = '00:00.0';
  $('kk-start').hidden = false;
  $('kk-start').textContent = '▶ スタート';
  updateKimiCursor();
}

function startKimi() {
  if (typeState.running && typeState.mode === 'kimi') return;
  typeState.running = true;
  typeState.mode = 'kimi';
  typeState.kimiPos = 0;
  typeState.kimiMistakes = 0;
  // reset chars state
  document.querySelectorAll('#kk-lines .kk-ch').forEach(s => {
    s.classList.remove('done', 'current', 'wrong');
  });
  typeState.kimiStartAt = performance.now();
  $('kk-start').hidden = true;
  const kb = $('kk-keyboard'); if (kb) { kb.value=''; kb.focus(); }
  if (typeState.kimiTimerHandle) clearInterval(typeState.kimiTimerHandle);
  typeState.kimiTimerHandle = setInterval(() => {
    const sec = (performance.now() - typeState.kimiStartAt) / 1000;
    $('kk-timer').textContent = formatKimiTime(sec);
  }, 50);
  updateKimiCursor();
}

function stopKimi() {
  typeState.running = false;
  if (typeState.kimiTimerHandle) clearInterval(typeState.kimiTimerHandle);
  typeState.kimiTimerHandle = 0;
}

function formatKimiTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec - m*60;
  return `${String(m).padStart(2,'0')}:${s.toFixed(1).padStart(4,'0')}`;
}

function currentKimiCh() {
  const all = [...document.querySelectorAll('#kk-lines .kk-ch')];
  return all[typeState.kimiPos];
}

function updateKimiCursor() {
  const all = [...document.querySelectorAll('#kk-lines .kk-ch')];
  all.forEach((el, i) => {
    el.classList.toggle('done', i < typeState.kimiPos);
    el.classList.toggle('current', i === typeState.kimiPos);
  });
}

function handleKimiKey(ch) {
  if (!typeState.running || typeState.mode !== 'kimi') return;
  const cur = currentKimiCh();
  if (!cur) return;
  const expected = cur.dataset.expected;
  if (ch === expected) {
    cur.classList.remove('wrong');
    cur.classList.add('done');
    typeState.kimiPos += 1;
    // carve pop
    spawnCarvePop(cur);
    const all = document.querySelectorAll('#kk-lines .kk-ch');
    if (typeState.kimiPos >= all.length) finishKimi();
    else updateKimiCursor();
  } else {
    cur.classList.remove('wrong');
    void cur.offsetWidth;
    cur.classList.add('wrong');
    typeState.kimiMistakes += 1;
    showToast('kk-toast', `おしい！ つぎは "${expected === ' ' ? 'スペース' : expected}"`, '#ff9a8a');
  }
}

function spawnCarvePop(el) {
  const host = $('kk-carve');
  const rect = el.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();
  const pop = document.createElement('span');
  pop.className = 'kk-carve-pop';
  pop.textContent = '✦';
  pop.style.left = `${rect.left - hostRect.left + 4}px`;
  pop.style.top  = `${rect.top - hostRect.top}px`;
  host.appendChild(pop);
  setTimeout(() => pop.remove(), 600);
}

function finishKimi() {
  stopKimi();
  const sec = (performance.now() - typeState.kimiStartAt) / 1000;
  const prev = store.kimiBest || 0;
  const isBest = prev === 0 || sec < prev;
  if (isBest) store.kimiBest = sec;
  const points = Math.max(200, Math.round(3000 - sec * 20 - typeState.kimiMistakes * 50));
  store.totalPoints += points;
  saveStore();
  renderRankBadge();

  const trophy = isBest ? '🏆' : '⭐';
  const title = isBest ? 'ベストタイム！' : '彫りきった！';
  showTypingResult({
    trophy, title,
    modeName: '🗿 君が代タイムアタック',
    stats: [
      { label:'タイム',     value: formatKimiTime(sec) },
      { label:'ベスト',     value: formatKimiTime(store.kimiBest) },
      { label:'タイプミス', value: typeState.kimiMistakes },
      { label:'もらえた P', value: '+' + points },
    ],
    isBest,
    medals: [
      { k:'bronze', label:'彫刻 かんりょう', ok: true },
      { k:'silver', label:'45秒以内',         ok: sec <= 45 },
      { k:'gold',   label:'30秒以内',         ok: sec <= 30 },
    ],
  });
}

/* ---------- Shared: typing result ---------- */
function showTypingResult(r) {
  $('tr-trophy').textContent = r.trophy;
  $('tr-title').textContent  = r.title;
  $('tr-mode-name').textContent = r.modeName;
  const stats = $('tr-stats');
  stats.innerHTML = '';
  r.stats.forEach(s => {
    const el = document.createElement('div');
    el.className = 'result-stat';
    el.innerHTML = `<div class="rs-label">${s.label}</div><div class="rs-val">${s.value}</div>`;
    stats.appendChild(el);
  });
  $('tr-best').hidden = !r.isBest;
  const medalRow = $('tr-medal-row');
  medalRow.innerHTML = '';
  r.medals.forEach(m => {
    const el = document.createElement('div');
    el.className = `medal medal-${m.k} ${m.ok ? 'ok' : 'off'}`;
    el.textContent = m.label;
    medalRow.appendChild(el);
  });
  typeState._lastMode = typeState.mode;
  showView('type-result');
  burstOrbs();
}

/* ---------- Key dispatcher ---------- */
/* Physical-key reader.
 * Works regardless of IME (Japanese input) state because e.code reports the
 * physical key pressed ('KeyI' → 'i') even while the IME is composing.
 * During composition e.key is 'Process' and would be useless. */
function readPhysicalKey(e) {
  const c = e.code;
  if (!c) return null;
  if (c.length === 4 && c.startsWith('Key')) return c[3].toLowerCase();   // KeyA..KeyZ
  if (c === 'Space') return ' ';
  if (c === 'Minus') return '-';
  // fall back to e.key for non-IME layouts
  const k = (e.key || '').toLowerCase();
  if (k.length === 1 && /[a-z -]/.test(k)) return k;
  return null;
}

window.addEventListener('keydown', (e) => {
  const t = e.target;
  const tid = t && t.id;
  const isTypingInput = tid === 'td-keyboard' || tid === 'kk-keyboard';
  // let other form inputs handle their own keys (answer form etc.)
  if (!isTypingInput && t && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA')) return;

  if (state.view === 'type-defense' && typeState.running) {
    const ch = readPhysicalKey(e);
    if (ch && /[a-z -]/.test(ch)) {
      handleDefenseKey(ch);
      e.preventDefault();  // blocks IME from producing kana into the input
    }
  } else if (state.view === 'type-kimi' && typeState.running) {
    const ch = readPhysicalKey(e);
    if (ch && (ch === ' ' || /[a-z -]/.test(ch))) {
      handleKimiKey(ch);
      e.preventDefault();
    }
  }
});

/* The hidden input (for mobile virtual keyboard) is cleared whenever the IME
 * commits text, so accumulated kana never leaks into our state. */
function wireTypingKeyboard(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const clear = () => { el.value = ''; };
  el.addEventListener('input', clear);
  el.addEventListener('compositionend', clear);
  el.addEventListener('blur', clear);
}
wireTypingKeyboard('td-keyboard');
wireTypingKeyboard('kk-keyboard');

/* ---------- Event wiring ---------- */
$('td-back').addEventListener('click', () => { stopDefense(); goTypeMenu(); });
$('td-start').addEventListener('click', startDefense);
$('kk-back').addEventListener('click', () => { stopKimi(); goTypeMenu(); });
$('kk-start').addEventListener('click', startKimi);

$('tr-retry').addEventListener('click', () => {
  if (typeState._lastMode === 'defense') { goTypeDefense(); setTimeout(startDefense, 100); }
  else if (typeState._lastMode === 'kimi') { goTypeKimi(); setTimeout(startKimi, 100); }
  else goTypeMenu();
});
$('tr-menu').addEventListener('click', goTypeMenu);

/* ---------- Init ---------- */
renderRankBadge();
goHome();
