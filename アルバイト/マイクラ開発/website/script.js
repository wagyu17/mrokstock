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
function nextRank(idx) { return idx + 1 < RANKS.length ? RANKS[idx + 1] : null; }

/* ---------- Store ---------- */
const STORE_KEY = 'onelife_drill_v2';
function defaultStore() { return { totalPoints:0, best:{}, bestTime:{}, cleared:{}, progClear:{}, plays:0, typeBest:{}, kimiBest:0, socialBest:{}, socialSeen:{}, socialPoints:0 }; }
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
  'social-menu','social-game','social-result',
  'hissan-menu','hissan-stages','hissan-game',
];
function showView(v) {
  VIEWS.forEach(name => {
    const el = document.getElementById('view-' + name);
    if (el) el.hidden = (name !== v);
  });
  state.view = v;
  window.scrollTo({top:0, behavior:'instant'});
}

function goHome() {
  renderBreadcrumb([]);
  setSidebarActive('home');
  renderHome();
  showView('home');
}

function goMath() {
  renderBreadcrumb([{label:'さんすう'}]);
  setSidebarActive('math');
  showView('math');
}

function goOp(op) {
  state.op = op;
  const meta = OP_META[op];
  renderBreadcrumb([
    {label:'さんすう', onClick: goMath},
    {label: meta.label},
  ]);
  setSidebarActive('math');
  $('stages-title').textContent = `${meta.icon} ${meta.label}：ステージを えらぼう`;
  $('stages-lead').textContent = op === 'mul'
    ? '1の段から じゅんに クリアすると メダルが もらえるよ。ランダム20問は タイムアタック！'
    : 'にゅうもん → やさしい → ふつう → むずかしい の じゅんに ちょうせんしよう。';
  renderStageGrid(op);
  showView('stages');
}

function goProg() {
  renderBreadcrumb([{label:'プログラミング'}]);
  setSidebarActive('prog');
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
  state.resultMode = 'normal';
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
  const idx = getRankIndex(pts);
  const cur = RANKS[idx];
  const nx  = nextRank(idx);
  $('rb-icon').textContent = cur.icon;
  $('rb-name').textContent = cur.name;
  $('rb-points').textContent = pts.toLocaleString();

  // sidebar player card
  const pAvatar = $('player-avatar');
  if (pAvatar) pAvatar.textContent = cur.icon;
  const pName = $('player-rank-name');
  if (pName) pName.textContent = `RANK · ${cur.name}`;
  const pNext = $('player-rank-next');
  if (pNext) pNext.textContent = nx ? `つぎは ${nx.name} まで` : 'さいこうランク たっせい！';
  const xpFill = $('player-xp-fill');
  const xpText = $('player-xp-text');
  if (xpFill && xpText) {
    if (nx) {
      const span = nx.min - cur.min;
      const into = pts - cur.min;
      const pct  = Math.max(0, Math.min(100, Math.floor(into / span * 100)));
      xpFill.style.width = `${pct}%`;
      xpText.textContent = `${pts.toLocaleString()} / ${nx.min.toLocaleString()} P`;
    } else {
      xpFill.style.width = '100%';
      xpText.textContent = `${pts.toLocaleString()} P`;
    }
  }

  // refresh home stats and sidebar badges if mounted
  renderSidebarBadges();
  renderHome();
}

/* ---------- Sidebar / Home stats ---------- */
function totalMathStages() {
  let n = 0;
  Object.values(STAGES_BY_OP).forEach(arr => n += arr.length);
  if (typeof HISSAN_STAGES !== 'undefined') {
    Object.values(HISSAN_STAGES).forEach(arr => n += arr.length);
  }
  return n;
}
function clearedMathStages() {
  let c = 0;
  Object.values(STAGES_BY_OP).forEach(arr => arr.forEach(s => { if (store.cleared[s.id]) c += 1; }));
  if (typeof HISSAN_STAGES !== 'undefined') {
    Object.values(HISSAN_STAGES).forEach(arr => arr.forEach(s => { if (store.cleared[s.id]) c += 1; }));
  }
  return c;
}
function totalMathPoints() {
  let p = 0;
  Object.values(STAGES_BY_OP).forEach(arr => arr.forEach(s => { p += store.best[s.id] || 0; }));
  if (typeof HISSAN_STAGES !== 'undefined') {
    Object.values(HISSAN_STAGES).forEach(arr => arr.forEach(s => { p += store.best[s.id] || 0; }));
  }
  return p;
}
function clearedProgMissions() {
  return PROG_MISSIONS ? PROG_MISSIONS.filter(m => store.progClear[m.id]).length : 0;
}
function totalProgPoints() {
  let p = 0;
  if (!PROG_MISSIONS) return 0;
  PROG_MISSIONS.forEach(m => { if (store.progClear[m.id]) p += 800; });
  return p;
}
function totalTypePoints() {
  return (store.typeBest && store.typeBest.defense ? store.typeBest.defense : 0) +
         (store.kimiBest ? Math.max(0, Math.round(3000 - store.kimiBest * 20)) : 0);
}

function renderSidebarBadges() {
  const totalM = totalMathStages();
  const clearM = clearedMathStages();
  const mathBadge = $('nav-math-badge');
  if (mathBadge) mathBadge.textContent = `${clearM}/${totalM}`;

  const totalP = PROG_MISSIONS ? PROG_MISSIONS.length : 7;
  const clearP = clearedProgMissions();
  const progBadge = $('nav-prog-badge');
  if (progBadge) progBadge.textContent = `${clearP}/${totalP}`;

  const typeBadge = $('nav-type-badge');
  if (typeBadge) {
    const played = (store.typeBest && store.typeBest.defense ? 1 : 0) + (store.kimiBest ? 1 : 0);
    typeBadge.textContent = played === 0 ? 'NEW' : `${played}/2`;
  }

  const socialBadge = $('nav-social-badge');
  if (socialBadge) {
    const seen = store.socialSeen ? Object.keys(store.socialSeen).length : 0;
    socialBadge.textContent = seen === 0 ? 'NEW' : `${seen}/47`;
  }
}

function setSidebarActive(navId) {
  document.querySelectorAll('.nav-btn[data-nav]').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-nav') === navId);
  });
}

function renderHome() {
  // play count
  const playsEl = $('home-plays');
  if (playsEl) playsEl.textContent = store.plays || 0;

  // math
  const totalM = totalMathStages();
  const clearM = clearedMathStages();
  const mathPct = totalM === 0 ? 0 : Math.floor(clearM / totalM * 100);
  const mathFill = $('quest-math-fill');
  if (mathFill) mathFill.style.width = `${mathPct}%`;
  const mathMeta = $('quest-math-meta');
  if (mathMeta) mathMeta.textContent = `${clearM} / ${totalM} STAGE`;
  const mathPts = $('quest-math-pts');
  if (mathPts) mathPts.textContent = `★ ${totalMathPoints().toLocaleString()}P`;
  const mathSub = $('quest-math-sub');
  if (mathSub) {
    mathSub.textContent = clearM === 0
      ? 'たし・ひき・かけ・わりざん'
      : `${clearM} ステージ クリア！`;
  }

  // prog
  const totalP = PROG_MISSIONS ? PROG_MISSIONS.length : 5;
  const clearP = clearedProgMissions();
  const progPct = totalP === 0 ? 0 : Math.floor(clearP / totalP * 100);
  const progFill = $('quest-prog-fill');
  if (progFill) progFill.style.width = `${progPct}%`;
  const progMeta = $('quest-prog-meta');
  if (progMeta) progMeta.textContent = `${clearP} / ${totalP} MISSION`;
  const progPts = $('quest-prog-pts');
  if (progPts) progPts.textContent = `★ ${totalProgPoints().toLocaleString()}P`;
  const progSub = $('quest-prog-sub');
  if (progSub) {
    progSub.textContent = clearP === 0
      ? 'ロボットを うごかそう'
      : clearP < totalP
        ? `つぎ：ミッション ${clearP + 1}`
        : 'ぜんぶ クリア！';
  }

  // type
  const tBest = (store.typeBest && store.typeBest.defense) || 0;
  const kBest = store.kimiBest || 0;
  const typePlayed = (tBest > 0 ? 1 : 0) + (kBest > 0 ? 1 : 0);
  const typePct = typePlayed === 0 ? 15 : (typePlayed === 1 ? 50 : 100);
  const typeFill = $('quest-type-fill');
  if (typeFill) typeFill.style.width = `${typePct}%`;
  const typeMeta = $('quest-type-meta');
  if (typeMeta) typeMeta.textContent = typePlayed === 0 ? '2 MODE' : `${typePlayed}/2 MODE`;
  const typePts = $('quest-type-pts');
  if (typePts) typePts.textContent = `★ ${totalTypePoints().toLocaleString()}P`;
  const typeFlag = $('quest-type-flag');
  if (typeFlag) typeFlag.style.display = typePlayed === 0 ? '' : 'none';
  const typeSub = $('quest-type-sub');
  if (typeSub) {
    typeSub.textContent = typePlayed === 0
      ? 'ワードディフェンス / 君が代'
      : kBest > 0
        ? `君が代 ベスト ${formatKimiTime(kBest)}`
        : `ディフェンス ベスト ${tBest.toLocaleString()}P`;
  }

  // social
  const seenCount = store.socialSeen ? Object.keys(store.socialSeen).length : 0;
  const socialPct = Math.floor(seenCount / 47 * 100);
  const socialFill = $('quest-social-fill');
  if (socialFill) socialFill.style.width = `${socialPct}%`;
  const socialMeta = $('quest-social-meta');
  if (socialMeta) socialMeta.textContent = `${seenCount} / 47 おぼえた`;
  const socialPts = $('quest-social-pts');
  if (socialPts) socialPts.textContent = `★ ${(store.socialPoints||0).toLocaleString()}P`;
  const socialFlag = $('quest-social-flag');
  if (socialFlag) socialFlag.style.display = seenCount === 0 ? '' : 'none';
  const socialSub = $('quest-social-sub');
  if (socialSub) {
    socialSub.textContent = seenCount === 0
      ? '47とどうふけん クイズ'
      : seenCount < 47
        ? `あと ${47 - seenCount} とどうふけん！`
        : 'コンプリート！';
  }

  // achievements row
  const ach = $('ach-row');
  if (ach) {
    ach.innerHTML = '';
    const items = [];
    Object.values(STAGES_BY_OP).forEach(arr => arr.forEach(s => {
      if (store.cleared[s.id]) {
        const isPerfect = (store.best[s.id] || 0) >= s.count * 150 + 100;
        items.push({ medal: isPerfect ? 'gold' : 'silver', text: `${s.name} クリア` });
      }
    }));
    if (PROG_MISSIONS) PROG_MISSIONS.forEach(m => {
      if (store.progClear[m.id]) items.push({ medal: 'silver', text: `${m.name.split('：')[0]}` });
    });
    if (kBest > 0) items.push({ medal: 'gold', text: `君が代 ${formatKimiTime(kBest)}` });
    if (tBest > 0) items.push({ medal: 'silver', text: `ディフェンス ${tBest.toLocaleString()}P` });
    Object.entries(store.socialBest || {}).forEach(([level, score]) => {
      if (score > 0) items.push({ medal: 'silver', text: `しゃかい ${level} ${score}P` });
    });
    if (items.length === 0) {
      const m = document.createElement('span');
      m.className = 'medal locked';
      m.textContent = 'まだ じっせき なし';
      ach.appendChild(m);
    } else {
      items.slice(-5).forEach(it => {
        const m = document.createElement('span');
        m.className = `medal ${it.medal}`;
        m.textContent = it.text;
        ach.appendChild(m);
      });
    }
  }
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
   PROGRAMMING MODULE  (3-pane absolute-direction edition)
   ========================================================= */

/* Missions are tuned around the new absolute movement model.
 * `par` counts authored ops where: 1 move = 1, 1 loop bracket = 1, plus
 * each move inside the loop body = 1.  So [4× ⬆] = 1 (loop) + 1 (move) = 2 ops. */
const PROG_MISSIONS = [
  {
    id:'p1', name:'ミッション 1：はじめの1ぽ',
    cols:5, rows:5,
    start:{x:2, y:4},
    goal:{x:2, y:0},
    walls:[],
    par:4,
    hint:'⬆を 4回 ならべよう！まっすぐ うえへ。',
  },
  {
    id:'p2', name:'ミッション 2：かどを まがる',
    cols:5, rows:5,
    start:{x:0, y:4},
    goal:{x:4, y:0},
    walls:[],
    par:8,
    hint:'⬆を 4つ、➡を 4つ。L字に すすもう！',
  },
  {
    id:'p3', name:'ミッション 3：くりかえしを つかおう',
    cols:5, rows:5,
    start:{x:0, y:4},
    goal:{x:4, y:0},
    walls:[],
    par:4,
    hint:'[ 4回 ⬆ ] → [ 4回 ➡ ] で たった 4めいれい！',
  },
  {
    id:'p4', name:'ミッション 4：おりかえし',
    cols:5, rows:5,
    start:{x:0, y:4},
    goal:{x:0, y:0},
    walls:[{x:1,y:1},{x:1,y:2},{x:1,y:3}],
    par:11,
    hint:'⬆⬇⬅➡ ぜんぶ つかえる。コンパス🧭から えらぼう。',
  },
  {
    id:'p5', name:'ミッション 5：かいだん',
    cols:7, rows:7,
    start:{x:0, y:6},
    goal:{x:6, y:0},
    walls:[],
    par:4,
    hint:'[ 6回 ⬆ ➡ ] が さいてきかい！',
  },
  {
    id:'p6', name:'ミッション 6：ジグザグ',
    cols:6, rows:6,
    start:{x:0, y:5},
    goal:{x:5, y:0},
    walls:[{x:2,y:2},{x:2,y:3},{x:3,y:2},{x:3,y:3}],
    par:13,
    hint:'まんなかの かたまりを よけて ジグザグに！',
  },
  {
    id:'p7', name:'ミッション 7：めいろ',
    cols:7, rows:7,
    start:{x:0, y:6},
    goal:{x:6, y:0},
    walls:[
      {x:1,y:1},{x:1,y:2},{x:1,y:3},{x:1,y:4},
      {x:3,y:0},{x:3,y:1},{x:3,y:2},{x:3,y:3},
      {x:5,y:1},{x:5,y:2},{x:5,y:3},{x:5,y:4},
    ],
    par:18,
    hint:'うえ・した・みぎ・ひだりを じょうずに つかって、めいろを ぬけよう！',
  },
];

const DIR_DELTA = { N:[0,-1], E:[1,0], S:[0,1], W:[-1,0] };
const DIR_LABEL = { N:'⬆', E:'➡', S:'⬇', W:'⬅' };
const DIR_NAME  = { N:'うえ', E:'みぎ', S:'した', W:'ひだり' };

const progState = {
  mission: null,
  sequence: [],       // items: {cmd:'move', dir:'N'|'E'|'S'|'W'} or {cmd:'loop', count:N, body:[{cmd:'move', dir}]}
  loopEditingIndex: -1,
  robot: null,        // {x,y}
  running: false,
  pendingDirContext: null,  // {kind:'add'|'edit-top'|'edit-loop', idx, bodyIdx?}
  pendingLoopContext: null, // {idx}  for count modal
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
  progState.loopEditingIndex = -1;
  progState.running = false;
  progState.robot = { x:m.start.x, y:m.start.y };

  renderBreadcrumb([
    {label:'プログラミング', onClick: goProg},
    {label: m.name},
  ]);
  $('prog-title').textContent = m.name;
  $('prog-status').textContent = `もくひょう: ${m.par} めいれい`;
  $('prog-hint').textContent = m.hint || '🤖ロボットを 🎁チェストまで うごかそう！';
  renderProgSequence();
  drawProgBoard();
  showView('prog-game');
}

/* ---------- Sequence rendering ---------- */
function renderProgSequence() {
  const host = $('prog-sequence');
  host.innerHTML = '';
  if (progState.sequence.length === 0) {
    const ph = document.createElement('div');
    ph.className = 'prog-seq-empty';
    ph.textContent = '🛠 みぎの どうぐを タップして プログラムを くみたてよう';
    host.appendChild(ph);
    updateAuthoredCount();
    return;
  }
  progState.sequence.forEach((item, idx) => {
    if (item.cmd === 'loop') {
      const wrap = document.createElement('div');
      wrap.className = 'seq-loop';
      const isEdit = progState.loopEditingIndex === idx;
      if (isEdit) wrap.classList.add('seq-loop-active');

      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'seq-loop-bracket seq-loop-bracket-open';
      open.dataset.loopCount = String(idx);
      open.textContent = `[ ${item.count}回`;
      open.title = 'クリックで かいすうを かえる';
      wrap.appendChild(open);

      const body = document.createElement('div');
      body.className = 'seq-loop-body';
      body.dataset.loopBody = String(idx);
      item.body.forEach((bi, bidx) => {
        const chip = document.createElement('span');
        chip.className = `seq-chip seq-chip-move dir-${bi.dir}`;
        chip.innerHTML = `
          <button type="button" class="chip-ico chip-edit" data-edit-loop-dir="${idx}" data-body-idx="${bidx}" title="ほうこうを かえる">${DIR_LABEL[bi.dir]}</button>
          <button type="button" class="seq-del-inner" data-loop-idx="${idx}" data-body-idx="${bidx}" title="けす">✕</button>
        `;
        body.appendChild(chip);
      });
      wrap.appendChild(body);

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'seq-loop-add' + (isEdit ? ' active' : '');
      addBtn.dataset.loopAdd = String(idx);
      addBtn.textContent = isEdit ? '＋ ここに ついか中…' : '＋ ループ内へ';
      wrap.appendChild(addBtn);

      const close = document.createElement('span');
      close.className = 'seq-loop-bracket seq-loop-bracket-close';
      close.textContent = ']';
      wrap.appendChild(close);

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'seq-del';
      del.dataset.idx = String(idx);
      del.textContent = '✕';
      del.title = 'ループを けす';
      wrap.appendChild(del);

      host.appendChild(wrap);
    } else if (item.cmd === 'move') {
      const chip = document.createElement('span');
      chip.className = `seq-chip seq-chip-move dir-${item.dir}`;
      chip.innerHTML = `
        <button type="button" class="chip-ico chip-edit" data-edit-dir="${idx}" title="ほうこうを かえる">${DIR_LABEL[item.dir]}</button>
        <button type="button" class="seq-del" data-idx="${idx}" title="けす">✕</button>
      `;
      host.appendChild(chip);
    }
  });
  updateAuthoredCount();
}

function updateAuthoredCount() {
  const el = $('prog-cmd-count');
  if (el) el.textContent = `${countAuthored(progState.sequence)} めいれい`;
}

/* ---------- Add / remove commands ---------- */
function addMove(dir) {
  if (progState.running) return;
  if (progState.loopEditingIndex >= 0) {
    const loop = progState.sequence[progState.loopEditingIndex];
    if (loop && loop.cmd === 'loop') {
      loop.body.push({ cmd:'move', dir });
      renderProgSequence();
      return;
    }
    progState.loopEditingIndex = -1;
  }
  progState.sequence.push({ cmd:'move', dir });
  renderProgSequence();
}

function addLoop() {
  if (progState.running) return;
  progState.sequence.push({ cmd:'loop', count:2, body:[] });
  // Auto-enter the new loop's "add to body" mode for convenience.
  progState.loopEditingIndex = progState.sequence.length - 1;
  renderProgSequence();
  showToast('prog-toast', 'つぎに おす めいれいは ループに はいるよ', '#ffd76b');
}

/* ---------- Direction modal ---------- */
function openDirModal(context) {
  progState.pendingDirContext = context;
  const modal = $('dir-modal');
  if (modal) modal.hidden = false;
}
function closeDirModal() {
  progState.pendingDirContext = null;
  const modal = $('dir-modal');
  if (modal) modal.hidden = true;
}
function chooseDir(dir) {
  const ctx = progState.pendingDirContext;
  if (!ctx) { closeDirModal(); return; }
  if (ctx.kind === 'add') {
    addMove(dir);
  } else if (ctx.kind === 'edit-top') {
    const item = progState.sequence[ctx.idx];
    if (item && item.cmd === 'move') item.dir = dir;
    renderProgSequence();
  } else if (ctx.kind === 'edit-loop') {
    const item = progState.sequence[ctx.idx];
    if (item && item.cmd === 'loop' && item.body[ctx.bodyIdx]) {
      item.body[ctx.bodyIdx].dir = dir;
    }
    renderProgSequence();
  }
  closeDirModal();
}

/* ---------- Loop count modal ---------- */
function openLoopModal(idx) {
  progState.pendingLoopContext = { idx };
  const modal = $('loop-modal');
  if (modal) modal.hidden = false;
}
function closeLoopModal() {
  progState.pendingLoopContext = null;
  const modal = $('loop-modal');
  if (modal) modal.hidden = true;
}
function chooseLoopCount(count) {
  const ctx = progState.pendingLoopContext;
  if (!ctx) { closeLoopModal(); return; }
  const item = progState.sequence[ctx.idx];
  if (item && item.cmd === 'loop') item.count = count;
  renderProgSequence();
  closeLoopModal();
}

/* ---------- Help modal ---------- */
function openHelpModal() {
  const m = $('help-modal');
  if (m) m.hidden = false;
}

/* ---------- Expand loops into flat list ---------- */
function flattenSequence(seq) {
  const out = [];
  seq.forEach(item => {
    if (item.cmd === 'loop') {
      for (let i=0; i<item.count; i++) item.body.forEach(b => out.push(b));
    } else {
      out.push(item);
    }
  });
  return out;
}

/* ---------- Run ---------- */
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
  progState.robot = { x:m.start.x, y:m.start.y };
  drawProgBoard();
  await sleep(300);

  for (let i=0; i<cmds.length; i++) {
    const c = cmds[i];
    if (c.cmd !== 'move') continue;
    const [dx,dy] = DIR_DELTA[c.dir];
    const nx = progState.robot.x + dx, ny = progState.robot.y + dy;
    if (nx < 0 || ny < 0 || nx >= m.cols || ny >= m.rows) {
      drawProgBoard({shake:true, lastDir:c.dir});
      showToast('prog-toast', 'そとに でちゃった！もういちど！', '#ff9a8a');
      progState.running = false;
      return;
    }
    if (m.walls.some(w => w.x===nx && w.y===ny)) {
      drawProgBoard({shake:true, lastDir:c.dir});
      showToast('prog-toast', 'かべに ぶつかった！もういちど', '#ff9a8a');
      progState.running = false;
      return;
    }
    progState.robot.x = nx;
    progState.robot.y = ny;
    drawProgBoard({lastDir:c.dir});
    await sleep(280);
  }

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
  // Each top-level item is 1 op; a loop counts as 1 (the bracket) + body ops.
  // This rewards loops: e.g. [4× ⬆][4× ➡] = 4 ops vs 8 separate moves.
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
  // robot face (eyes + arrow showing last direction it moved)
  ctx.fillStyle = '#111';
  // eyes
  const eyeSize = Math.max(3, Math.floor(cell * 0.08));
  ctx.fillRect(cx - cell*0.18, cy - cell*0.12, eyeSize, eyeSize);
  ctx.fillRect(cx + cell*0.10, cy - cell*0.12, eyeSize, eyeSize);
  // direction arrow
  const dir = opts.lastDir || progState.lastDir || null;
  if (dir) {
    progState.lastDir = dir;
    const arrowLen = cell*0.22;
    ctx.beginPath();
    if (dir === 'N') { ctx.moveTo(cx, cy+arrowLen*0.4); ctx.lineTo(cx, cy-arrowLen*0.6); ctx.lineTo(cx-arrowLen*0.4, cy-arrowLen*0.2); ctx.moveTo(cx, cy-arrowLen*0.6); ctx.lineTo(cx+arrowLen*0.4, cy-arrowLen*0.2); }
    else if (dir === 'S') { ctx.moveTo(cx, cy-arrowLen*0.4); ctx.lineTo(cx, cy+arrowLen*0.6); ctx.lineTo(cx-arrowLen*0.4, cy+arrowLen*0.2); ctx.moveTo(cx, cy+arrowLen*0.6); ctx.lineTo(cx+arrowLen*0.4, cy+arrowLen*0.2); }
    else if (dir === 'E') { ctx.moveTo(cx-arrowLen*0.4, cy+cell*0.16); ctx.lineTo(cx+arrowLen*0.6, cy+cell*0.16); ctx.lineTo(cx+arrowLen*0.2, cy+cell*0.08); ctx.moveTo(cx+arrowLen*0.6, cy+cell*0.16); ctx.lineTo(cx+arrowLen*0.2, cy+cell*0.24); }
    else if (dir === 'W') { ctx.moveTo(cx+arrowLen*0.4, cy+cell*0.16); ctx.lineTo(cx-arrowLen*0.6, cy+cell*0.16); ctx.lineTo(cx-arrowLen*0.2, cy+cell*0.08); ctx.moveTo(cx-arrowLen*0.6, cy+cell*0.16); ctx.lineTo(cx-arrowLen*0.2, cy+cell*0.24); }
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#111';
    ctx.stroke();
  }

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

// Sidebar nav
document.querySelectorAll('.nav-btn[data-nav]').forEach(btn => {
  btn.addEventListener('click', () => {
    const nav = btn.getAttribute('data-nav');
    if (nav === 'home') goHome();
    else if (nav === 'math') goMath();
    else if (nav === 'prog') goProg();
    else if (nav === 'type') goTypeMenu();
    else if (nav === 'social') goSocial();
  });
});

// Home menu / quest grid / data-go links
document.querySelectorAll('[data-go]').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-go');
    if (target === 'math') goMath();
    else if (target === 'prog') goProg();
    else if (target === 'type') goTypeMenu();
    else if (target === 'type:defense') goTypeDefense();
    else if (target === 'type:kimi') goTypeKimi();
    else if (target === 'social') goSocial();
    else if (target.startsWith('social:')) startSocial(target.slice(7));
    else if (target === 'hissan') goHissan();
    else if (target.startsWith('hissan:')) goHissanOp(target.slice(7));
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

// Result buttons (mode-aware: normal drill or 筆算)
$('retry-btn').addEventListener('click', () => {
  if (state.resultMode === 'hissan' && hissanState.stage) {
    startHissan(hissanState.op, hissanState.stage.id);
  } else if (state.stage) {
    startStage(state.op, state.stage.id);
  }
});
$('to-select-btn').addEventListener('click', () => {
  if (state.resultMode === 'hissan') goHissanOp(hissanState.op);
  else goOp(state.op);
});

// Programming events
$('prog-back-btn').addEventListener('click', goProg);
$('prog-clear').addEventListener('click', () => {
  if (progState.running) return;
  progState.sequence = [];
  progState.loopEditingIndex = -1;
  renderProgSequence();
});
$('prog-run').addEventListener('click', runProgram);
$('prog-help-btn').addEventListener('click', openHelpModal);

// Palette commands
document.querySelectorAll('.cmd-icon-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cmd = btn.getAttribute('data-cmd');
    if (cmd === 'move-N') addMove('N');
    else if (cmd === 'move-E') addMove('E');
    else if (cmd === 'compass') openDirModal({ kind:'add' });
    else if (cmd === 'loop') addLoop();
  });
});

// Sequence interactions (delegated)
$('prog-sequence').addEventListener('click', (e) => {
  if (progState.running) return;
  const t = e.target.closest('button');
  if (!t) return;
  if (t.classList.contains('seq-del')) {
    const idx = parseInt(t.getAttribute('data-idx'), 10);
    progState.sequence.splice(idx, 1);
    if (progState.loopEditingIndex === idx) progState.loopEditingIndex = -1;
    else if (progState.loopEditingIndex > idx) progState.loopEditingIndex -= 1;
    renderProgSequence();
  } else if (t.classList.contains('seq-del-inner')) {
    const li = parseInt(t.getAttribute('data-loop-idx'), 10);
    const bi = parseInt(t.getAttribute('data-body-idx'), 10);
    if (progState.sequence[li] && progState.sequence[li].cmd === 'loop') {
      progState.sequence[li].body.splice(bi, 1);
      renderProgSequence();
    }
  } else if (t.hasAttribute('data-loop-add')) {
    const idx = parseInt(t.getAttribute('data-loop-add'), 10);
    if (progState.loopEditingIndex === idx) {
      progState.loopEditingIndex = -1;
    } else {
      progState.loopEditingIndex = idx;
      showToast('prog-toast', 'つぎに おした めいれいが ループに はいるよ', '#ffd76b');
    }
    renderProgSequence();
  } else if (t.hasAttribute('data-loop-count')) {
    const idx = parseInt(t.getAttribute('data-loop-count'), 10);
    openLoopModal(idx);
  } else if (t.hasAttribute('data-edit-dir')) {
    const idx = parseInt(t.getAttribute('data-edit-dir'), 10);
    openDirModal({ kind:'edit-top', idx });
  } else if (t.hasAttribute('data-edit-loop-dir')) {
    const idx = parseInt(t.getAttribute('data-edit-loop-dir'), 10);
    const bidx = parseInt(t.getAttribute('data-body-idx'), 10);
    openDirModal({ kind:'edit-loop', idx, bodyIdx:bidx });
  }
});

// Direction modal
document.querySelectorAll('#dir-modal .dir-btn').forEach(btn => {
  btn.addEventListener('click', () => chooseDir(btn.getAttribute('data-dir')));
});
// Loop count modal
document.querySelectorAll('#loop-modal .loop-cn').forEach(btn => {
  btn.addEventListener('click', () => chooseLoopCount(parseInt(btn.getAttribute('data-count'), 10)));
});
// Generic modal close
document.querySelectorAll('[data-modal-close]').forEach(el => {
  el.addEventListener('click', () => {
    const id = el.getAttribute('data-modal-close');
    const m = document.getElementById(id);
    if (m) m.hidden = true;
    if (id === 'dir-modal')  progState.pendingDirContext = null;
    if (id === 'loop-modal') progState.pendingLoopContext = null;
  });
});
// Esc closes any modal
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ['dir-modal','loop-modal','help-modal'].forEach(id => {
      const m = document.getElementById(id);
      if (m && !m.hidden) { m.hidden = true; }
    });
    progState.pendingDirContext = null;
    progState.pendingLoopContext = null;
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

/* Precompute canonical romaji for each kana entry — used by display + matching. */
TYPING_WORDS.forEach(w => { w.romaji = canonicalRomaji(w.kana); });
KIMIGAYO_LINES.forEach(l => { l.romaji = canonicalRomaji(l.kana); });

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
  setSidebarActive('type');
  showView('type-menu');
}
function goTypeDefense() {
  stopDefense();
  renderBreadcrumb([
    {label:'タイピング', onClick: goTypeMenu},
    {label:'ワードディフェンス'},
  ]);
  setSidebarActive('type');
  resetDefenseUI();
  showView('type-defense');
}
function goTypeKimi() {
  stopKimi();
  renderBreadcrumb([
    {label:'タイピング', onClick: goTypeMenu},
    {label:'君が代タイムアタック'},
  ]);
  setSidebarActive('type');
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

/* =========================================================
   SOCIAL STUDIES MODULE  (47 prefectures quiz)
   ========================================================= */

/* Each entry positions a prefecture on a 17x17 dotted grid that approximates
 * the shape of Japan (Hokkaido top-right, Kyushu bottom-left, Okinawa bottom).
 * Coordinates are intentionally loose — readability > cartographic precision. */
const PREFECTURES = [
  // 北海道地方
  { code:'01', name:'北海道',   kana:'ほっかいどう',  x:13, y:1, region:'hokkaido' },
  // 東北地方
  { code:'02', name:'青森県',   kana:'あおもり',      x:13, y:3, region:'tohoku' },
  { code:'03', name:'岩手県',   kana:'いわて',        x:13, y:4, region:'tohoku' },
  { code:'04', name:'宮城県',   kana:'みやぎ',        x:12, y:5, region:'tohoku' },
  { code:'05', name:'秋田県',   kana:'あきた',        x:11, y:4, region:'tohoku' },
  { code:'06', name:'山形県',   kana:'やまがた',      x:11, y:5, region:'tohoku' },
  { code:'07', name:'福島県',   kana:'ふくしま',      x:12, y:6, region:'tohoku' },
  // 関東地方
  { code:'08', name:'茨城県',   kana:'いばらき',      x:13, y:7, region:'kanto' },
  { code:'09', name:'栃木県',   kana:'とちぎ',        x:12, y:7, region:'kanto' },
  { code:'10', name:'群馬県',   kana:'ぐんま',        x:11, y:7, region:'kanto' },
  { code:'11', name:'埼玉県',   kana:'さいたま',      x:12, y:8, region:'kanto' },
  { code:'12', name:'千葉県',   kana:'ちば',          x:13, y:8, region:'kanto' },
  { code:'13', name:'東京都',   kana:'とうきょう',    x:11, y:8, region:'kanto' },
  { code:'14', name:'神奈川県', kana:'かながわ',      x:11, y:9, region:'kanto' },
  // 中部地方
  { code:'15', name:'新潟県',   kana:'にいがた',      x:11, y:6, region:'chubu' },
  { code:'16', name:'富山県',   kana:'とやま',        x:10, y:7, region:'chubu' },
  { code:'17', name:'石川県',   kana:'いしかわ',      x:9,  y:7, region:'chubu' },
  { code:'18', name:'福井県',   kana:'ふくい',        x:9,  y:8, region:'chubu' },
  { code:'19', name:'山梨県',   kana:'やまなし',      x:10, y:9, region:'chubu' },
  { code:'20', name:'長野県',   kana:'ながの',        x:10, y:8, region:'chubu' },
  { code:'21', name:'岐阜県',   kana:'ぎふ',          x:9,  y:9, region:'chubu' },
  { code:'22', name:'静岡県',   kana:'しずおか',      x:10, y:10,region:'chubu' },
  { code:'23', name:'愛知県',   kana:'あいち',        x:9,  y:10,region:'chubu' },
  // 近畿地方
  { code:'24', name:'三重県',   kana:'みえ',          x:8,  y:10,region:'kinki' },
  { code:'25', name:'滋賀県',   kana:'しが',          x:8,  y:9, region:'kinki' },
  { code:'26', name:'京都府',   kana:'きょうと',      x:7,  y:9, region:'kinki' },
  { code:'27', name:'大阪府',   kana:'おおさか',      x:7,  y:10,region:'kinki' },
  { code:'28', name:'兵庫県',   kana:'ひょうご',      x:6,  y:9, region:'kinki' },
  { code:'29', name:'奈良県',   kana:'なら',          x:8,  y:11,region:'kinki' },
  { code:'30', name:'和歌山県', kana:'わかやま',      x:7,  y:11,region:'kinki' },
  // 中国地方
  { code:'31', name:'鳥取県',   kana:'とっとり',      x:5,  y:9, region:'chugoku' },
  { code:'32', name:'島根県',   kana:'しまね',        x:4,  y:9, region:'chugoku' },
  { code:'33', name:'岡山県',   kana:'おかやま',      x:5,  y:10,region:'chugoku' },
  { code:'34', name:'広島県',   kana:'ひろしま',      x:4,  y:10,region:'chugoku' },
  { code:'35', name:'山口県',   kana:'やまぐち',      x:3,  y:10,region:'chugoku' },
  // 四国地方
  { code:'36', name:'徳島県',   kana:'とくしま',      x:5,  y:11,region:'shikoku' },
  { code:'37', name:'香川県',   kana:'かがわ',        x:5,  y:12,region:'shikoku' },
  { code:'38', name:'愛媛県',   kana:'えひめ',        x:4,  y:12,region:'shikoku' },
  { code:'39', name:'高知県',   kana:'こうち',        x:4,  y:13,region:'shikoku' },
  // 九州地方
  { code:'40', name:'福岡県',   kana:'ふくおか',      x:2,  y:11,region:'kyushu' },
  { code:'41', name:'佐賀県',   kana:'さが',          x:1,  y:11,region:'kyushu' },
  { code:'42', name:'長崎県',   kana:'ながさき',      x:0,  y:12,region:'kyushu' },
  { code:'43', name:'熊本県',   kana:'くまもと',      x:2,  y:12,region:'kyushu' },
  { code:'44', name:'大分県',   kana:'おおいた',      x:3,  y:12,region:'kyushu' },
  { code:'45', name:'宮崎県',   kana:'みやざき',      x:2,  y:13,region:'kyushu' },
  { code:'46', name:'鹿児島県', kana:'かごしま',      x:1,  y:13,region:'kyushu' },
  // 沖縄
  { code:'47', name:'沖縄県',   kana:'おきなわ',      x:0,  y:15,region:'okinawa' },
];

const REGION_LABEL = {
  hokkaido:'北海道', tohoku:'東北', kanto:'関東', chubu:'中部',
  kinki:'近畿', chugoku:'中国', shikoku:'四国', kyushu:'九州', okinawa:'沖縄',
};

const SOCIAL_LEVELS = {
  easy:    { label:'やさしい', total:10, distractorMode:'random', timed:false },
  region:  { label:'ふつう',   total:10, distractorMode:'region', timed:false },
  hard:    { label:'むずかしい', total:15, distractorMode:'region', timed:true  },
};

const socialState = {
  level: null,
  config: null,
  index: 0,
  total: 10,
  problems: [],
  current: null,
  score: 0,
  combo: 0,
  bestCombo: 0,
  correct: 0,
  startedAt: 0,
  endedAt: 0,
  timerHandle: 0,
  locked: false,
};

function goSocial() {
  renderBreadcrumb([{label:'しゃかい'}]);
  setSidebarActive('social');
  showView('social-menu');
}

async function startSocial(level) {
  const cfg = SOCIAL_LEVELS[level];
  if (!cfg) return;
  socialState.level = level;
  socialState.config = cfg;
  socialState.total = cfg.total;
  socialState.index = 0;
  socialState.score = 0;
  socialState.combo = 0;
  socialState.bestCombo = 0;
  socialState.correct = 0;
  socialState.startedAt = Date.now();
  socialState.locked = false;
  socialState.problems = buildSocialProblems(cfg);
  socialState.current = null;

  renderBreadcrumb([
    {label:'しゃかい', onClick: goSocial},
    {label: cfg.label},
  ]);
  setSidebarActive('social');
  $('social-title').textContent = `${level==='easy'?'🌱':level==='region'?'🗾':'⚔'} ${cfg.label}`;
  renderSocialLegend();
  renderSocialDots();
  updateSocialHud();

  // Show "loading" placeholder until the map and first question are ready.
  $('social-choices').innerHTML = '';
  $('sq-target').textContent = '⏳ 日本地図を よみこみ中…';
  $('sq-target').classList.remove('revealed');

  clearInterval(socialState.timerHandle);
  if (cfg.timed) {
    $('social-timer').hidden = false;
    $('social-time').textContent = '00:00';
  } else {
    $('social-timer').hidden = true;
  }

  showView('social-game');

  await renderSocialMap();
  // Bail if the user navigated away while the map was loading.
  if (socialState.level !== level || state.view !== 'social-game') return;

  // Start the timer only after the map is ready, so the kid isn't penalised for fetch latency.
  socialState.startedAt = Date.now();
  if (cfg.timed) {
    socialState.timerHandle = setInterval(() => {
      const sec = Math.floor((Date.now() - socialState.startedAt)/1000);
      $('social-time').textContent = formatTime(sec);
    }, 250);
  }

  loadSocialProblem();
  showToast('social-toast', `▶ ${cfg.label} スタート！`, '#ffd76b');
}

function buildSocialProblems(cfg) {
  const all = PREFECTURES.slice();
  shuffle(all);
  const targets = all.slice(0, cfg.total);
  return targets.map(t => {
    let pool;
    if (cfg.distractorMode === 'region') {
      pool = PREFECTURES.filter(p => p.code !== t.code && p.region === t.region);
      if (pool.length < 3) {
        // fall back: top up from neighbouring regions
        const extra = PREFECTURES.filter(p => p.code !== t.code && p.region !== t.region);
        shuffle(extra);
        pool = pool.concat(extra.slice(0, 3 - pool.length));
      }
    } else {
      pool = PREFECTURES.filter(p => p.code !== t.code);
    }
    shuffle(pool);
    const distractors = pool.slice(0, 3);
    const choices = shuffle([t, ...distractors]);
    return { target: t, choices };
  });
}

/* ---------- Real Japan map (GeoJSON via CDN) ---------- */
/* dataofjapan/land — open prefecture-level GeoJSON with `id` (1-47) and
 * `nam_ja` (Japanese name).  Served via jsDelivr (CORS-friendly).
 * Multiple URLs let us survive a single host being unreachable. */
const JAPAN_GEO_URLS = [
  'https://cdn.jsdelivr.net/gh/dataofjapan/land@master/japan.geojson',
  'https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson',
];

let japanGeoCache = null;
let japanGeoPromise = null;
async function loadJapanGeo() {
  if (japanGeoCache) return japanGeoCache;
  if (japanGeoPromise) return japanGeoPromise;
  japanGeoPromise = (async () => {
    let lastErr;
    for (const url of JAPAN_GEO_URLS) {
      try {
        const res = await fetch(url);
        if (!res.ok) { lastErr = new Error('HTTP ' + res.status); continue; }
        const geo = await res.json();
        if (geo && Array.isArray(geo.features) && geo.features.length >= 40) {
          japanGeoCache = geo;
          return geo;
        }
      } catch (e) { lastErr = e; }
    }
    japanGeoPromise = null;
    throw lastErr || new Error('failed');
  })();
  return japanGeoPromise;
}

/* Mercator-style projection — keeps the silhouette of Japan recognisable. */
function projectMercator(lng, lat) {
  const x = lng;
  const y = -Math.log(Math.tan(Math.PI/4 + lat * Math.PI / 360)) * 180 / Math.PI;
  return [x, y];
}

function buildJapanSVG(geo) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (arr) => {
    if (typeof arr[0] === 'number') {
      const [x, y] = projectMercator(arr[0], arr[1]);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    } else {
      arr.forEach(visit);
    }
  };
  geo.features.forEach(f => visit(f.geometry.coordinates));

  const W = 1000, H = 1000;
  const padX = 12, padY = 12;
  const sx = (W - 2 * padX) / (maxX - minX);
  const sy = (H - 2 * padY) / (maxY - minY);
  const s = Math.min(sx, sy);
  const ox = padX + (W - 2 * padX - (maxX - minX) * s) / 2;
  const oy = padY + (H - 2 * padY - (maxY - minY) * s) / 2;

  function transform(lng, lat) {
    const [px, py] = projectMercator(lng, lat);
    return [ox + (px - minX) * s, oy + (py - minY) * s];
  }
  function ringToD(ring) {
    let d = '';
    for (let i = 0; i < ring.length; i++) {
      const [x, y] = transform(ring[i][0], ring[i][1]);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
    }
    return d + 'Z';
  }
  function polyToD(coords) { return coords.map(ringToD).join(' '); }
  function geomToD(g) {
    if (g.type === 'Polygon') return polyToD(g.coordinates);
    if (g.type === 'MultiPolygon') return g.coordinates.map(polyToD).join(' ');
    return '';
  }

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('class', 'japan-svg');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', '日本地図');

  // Transparent ocean rect — useful for hit-testing / future extensions.
  const bg = document.createElementNS(NS, 'rect');
  bg.setAttribute('x', '0'); bg.setAttribute('y', '0');
  bg.setAttribute('width',  String(W));
  bg.setAttribute('height', String(H));
  bg.setAttribute('class', 'jp-ocean');
  svg.appendChild(bg);

  geo.features.forEach(f => {
    const idNum = f.properties.id || f.properties.code || 0;
    const code = String(idNum).padStart(2, '0');
    const pref = PREFECTURES.find(p => p.code === code);
    const region = pref ? pref.region : 'unknown';
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', geomToD(f.geometry));
    path.setAttribute('class', `jp-pref jp-pref-${region}`);
    path.setAttribute('data-code', code);
    path.setAttribute('data-name', f.properties.nam_ja || f.properties.nam || '');
    svg.appendChild(path);
  });
  return svg;
}

async function renderSocialMap() {
  const host = $('social-map');
  if (!host) return;
  host.innerHTML = '';
  // loading overlay
  const loading = document.createElement('div');
  loading.className = 'social-map-loading';
  loading.innerHTML = '<div class="loading-spinner">🗾</div><div>日本地図を よみこみちゅう…<br><small>はじめての ときは 数びょう かかるよ</small></div>';
  host.appendChild(loading);

  let geo;
  try {
    geo = await loadJapanGeo();
  } catch (e) {
    host.innerHTML = '';
    const err = document.createElement('div');
    err.className = 'social-map-err';
    err.innerHTML = `
      <div class="err-emoji">😢</div>
      <div>日本地図を よみこめませんでした<small>インターネット せつぞくを かくにんしてね</small></div>
      <button type="button" class="mc-btn mc-btn-stone mc-btn-sm" id="social-retry-load">▶ もういちど ためす</button>
    `;
    host.appendChild(err);
    const retry = document.getElementById('social-retry-load');
    if (retry) retry.addEventListener('click', async () => {
      await renderSocialMap();
      if (socialState.current) highlightSocialTarget(socialState.current.target.code);
    });
    return;
  }

  host.innerHTML = '';
  const svg = buildJapanSVG(geo);
  host.appendChild(svg);
  if (socialState.current) {
    highlightSocialTarget(socialState.current.target.code);
  }
}

function highlightSocialTarget(code) {
  const svg = document.querySelector('#social-map svg.japan-svg');
  if (!svg) return;
  svg.querySelectorAll('.jp-pref').forEach(p => p.classList.remove('jp-target', 'jp-correct', 'jp-wrong'));
  svg.classList.remove('shake');
  const target = svg.querySelector(`.jp-pref[data-code="${code}"]`);
  if (target) {
    target.classList.add('jp-target');
    // SVG paint order = doc order, so re-append to bring on top.
    target.parentNode.appendChild(target);
  }
}

function renderSocialLegend() {
  const host = $('social-legend');
  if (!host) return;
  host.innerHTML = '';
  Object.entries(REGION_LABEL).forEach(([key, label]) => {
    const chip = document.createElement('span');
    chip.className = 'legend-chip';
    chip.innerHTML = `<span class="legend-swatch s-${key}"></span>${label}`;
    host.appendChild(chip);
  });
}

function renderSocialDots() {
  const el = $('social-dots');
  if (!el) return;
  el.innerHTML = '';
  for (let i = 0; i < socialState.total; i++) {
    const d = document.createElement('span');
    d.className = 'pdot';
    if (i < socialState.index) d.classList.add('done');
    if (i === socialState.index) d.classList.add('active');
    el.appendChild(d);
  }
}

function updateSocialHud() {
  $('social-score').textContent = socialState.score.toLocaleString();
  $('social-combo').textContent = socialState.combo;
  $('social-progress').textContent = `${Math.min(socialState.index + 1, socialState.total)} / ${socialState.total} 問目`;
  const comboEl = $('social-combo').parentElement;
  if (comboEl) comboEl.classList.toggle('combo-hot', socialState.combo >= 3);
}

function loadSocialProblem() {
  socialState.locked = false;
  const p = socialState.problems[socialState.index];
  socialState.current = p;

  highlightSocialTarget(p.target.code);

  // Hide the name until the kid answers (only reveal the region as a hint).
  const sqTarget = $('sq-target');
  sqTarget.textContent = `？？？（${REGION_LABEL[p.target.region] || ''}ちほう）`;
  sqTarget.classList.remove('revealed');

  const choicesEl = $('social-choices');
  choicesEl.innerHTML = '';
  p.choices.forEach(c => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'social-choice';
    btn.dataset.code = c.code;
    btn.innerHTML = `${c.name}<span class="ch-kana">${c.kana}</span>`;
    btn.addEventListener('click', () => answerSocial(c.code, btn));
    choicesEl.appendChild(btn);
  });

  renderSocialDots();
  updateSocialHud();
}

function answerSocial(code, btn) {
  if (socialState.locked) return;
  const p = socialState.current;
  if (!p) return;
  const correct = code === p.target.code;
  socialState.locked = true;

  const targetEl = document.querySelector(`#social-map svg.japan-svg .jp-pref[data-code="${p.target.code}"]`);
  const svgEl = document.querySelector('#social-map svg.japan-svg');
  if (correct) {
    btn.classList.add('choice-correct');
    if (targetEl) {
      targetEl.classList.remove('jp-target');
      targetEl.classList.add('jp-correct');
      targetEl.parentNode.appendChild(targetEl);
    }
    socialState.combo += 1;
    socialState.bestCombo = Math.max(socialState.bestCombo, socialState.combo);
    socialState.correct += 1;
    const base = 200;
    const comboBonus = Math.floor(socialState.combo * 30);
    const gained = base + comboBonus;
    socialState.score += gained;
    if (!store.socialSeen) store.socialSeen = {};
    store.socialSeen[p.target.code] = (store.socialSeen[p.target.code] || 0) + 1;
    showToast('social-toast', `⛏ せいかい！ ${p.target.name} +${gained}P`, '#b6ff6e');
    burstOrbsAt(window.innerWidth/2, window.innerHeight/2 - 40, 6);
  } else {
    btn.classList.add('choice-wrong');
    if (targetEl) {
      targetEl.classList.remove('jp-target');
      targetEl.classList.add('jp-wrong');
      targetEl.parentNode.appendChild(targetEl);
    }
    if (svgEl) {
      svgEl.classList.remove('shake');
      void svgEl.offsetWidth;
      svgEl.classList.add('shake');
    }
    socialState.combo = 0;
    showToast('social-toast', `おしい！こたえは ${p.target.name}`, '#ff9a8a');
    // Highlight the correct choice button so the kid sees what was right.
    document.querySelectorAll('#social-choices .social-choice').forEach(b => {
      if (b.dataset.code === p.target.code) b.classList.add('choice-correct');
    });
  }
  document.querySelectorAll('#social-choices .social-choice').forEach(b => b.disabled = true);
  $('sq-target').textContent = p.target.name;
  $('sq-target').classList.add('revealed');
  updateSocialHud();

  setTimeout(() => {
    socialState.index += 1;
    if (socialState.index >= socialState.total) finishSocial();
    else loadSocialProblem();
  }, 1300);
}

function finishSocial() {
  clearInterval(socialState.timerHandle);
  socialState.endedAt = Date.now();
  const sec = Math.max(1, Math.round((socialState.endedAt - socialState.startedAt)/1000));
  let points = socialState.score;
  if (socialState.config.timed) {
    const bonus = Math.max(0, 180 - sec) * 5;
    points += bonus;
  }
  // Save
  if (!store.socialBest) store.socialBest = {};
  const prev = store.socialBest[socialState.level] || 0;
  const isBest = points > prev;
  if (isBest) store.socialBest[socialState.level] = points;
  store.socialPoints = (store.socialPoints || 0) + points;
  store.totalPoints += points;
  store.plays += 1;
  saveStore();
  renderRankBadge();

  let trophy, title, medal;
  if (socialState.correct === socialState.total) { trophy='🏆'; title='パーフェクト！'; medal='gold'; }
  else if (socialState.correct >= Math.ceil(socialState.total*0.7)) { trophy='💎'; title='ナイス！'; medal='silver'; }
  else { trophy='⭐'; title='クリア！'; medal='bronze'; }

  $('sr-trophy').textContent = trophy;
  $('sr-title').textContent  = title;
  $('sr-mode-name').textContent = socialState.config.label;
  $('sr-correct').textContent   = socialState.correct;
  $('sr-total').textContent     = socialState.total;
  $('sr-combo').textContent     = socialState.bestCombo;
  $('sr-time').textContent      = formatTime(sec);
  $('sr-points').textContent    = points;
  $('sr-best').hidden           = !isBest;

  const medalRow = $('sr-medal-row');
  medalRow.innerHTML = '';
  const tiers = [
    { k:'bronze', label:'クリア',         ok: true },
    { k:'silver', label:'7わり せいかい', ok: socialState.correct >= Math.ceil(socialState.total*0.7) },
    { k:'gold',   label:'パーフェクト',   ok: socialState.correct === socialState.total },
  ];
  tiers.forEach(t => {
    const el = document.createElement('div');
    el.className = `medal medal-${t.k} ${t.ok ? 'ok' : 'off'}`;
    el.textContent = t.label;
    medalRow.appendChild(el);
  });

  showView('social-result');
  burstOrbs();
}

/* ---------- Social wiring ---------- */
$('social-back').addEventListener('click', () => {
  clearInterval(socialState.timerHandle);
  goSocial();
});
$('sr-retry').addEventListener('click', () => {
  if (socialState.level) startSocial(socialState.level);
});
$('sr-menu').addEventListener('click', goSocial);

/* =========================================================
   HISSAN (筆算 / column-form arithmetic) MODULE
   - Step-by-step column-form input for +, −, ×, ÷
   - Subtraction borrowing visualised with a "money exchange" coin shop
     (¥100 → 10×¥10, ¥10 → 10×¥1) using CSS shapes & animations.
   ========================================================= */

const HISSAN_OP_META = {
  add: { label:'たしざん', sym:'+' },
  sub: { label:'ひきざん', sym:'−' },
  mul: { label:'かけざん', sym:'×' },
  div: { label:'わりざん', sym:'÷' },
};

const HISSAN_STAGES = {
  add: [
    { id:'h_add_1', name:'2けた + 2けた', tag:'くりあがり なし', icon:'➕', color:'wood',     diff:1, count:6, cfg:{op:'add', topD:2, botD:2, allowCarry:false} },
    { id:'h_add_2', name:'2けた + 2けた', tag:'くりあがり あり', icon:'➕', color:'grass',    diff:2, count:6, cfg:{op:'add', topD:2, botD:2, requireCarry:true} },
    { id:'h_add_3', name:'3けた + 3けた', tag:'くらいごと どんどん', icon:'➕', color:'diamond', diff:3, count:6, cfg:{op:'add', topD:3, botD:3, requireCarry:true} },
  ],
  sub: [
    { id:'h_sub_1', name:'2けた − 2けた', tag:'くりさがり なし',     icon:'➖', color:'wood',     diff:1, count:6, cfg:{op:'sub', topD:2, botD:2, allowBorrow:false} },
    { id:'h_sub_2', name:'2けた − 2けた', tag:'お金で りょうがえ',   icon:'🪙', color:'gold',     diff:2, count:6, cfg:{op:'sub', topD:2, botD:2, requireBorrow:true} },
    { id:'h_sub_3', name:'3けた − 2けた', tag:'チェイン りょうがえ', icon:'🪙', color:'redstone', diff:3, count:6, cfg:{op:'sub', topD:3, botD:2, requireBorrow:true, requireCascade:true} },
    { id:'h_sub_4', name:'3けた − 3けた', tag:'むずかしい',           icon:'➖', color:'amethyst', diff:3, count:5, cfg:{op:'sub', topD:3, botD:3, requireBorrow:true} },
  ],
  mul: [
    { id:'h_mul_1', name:'2けた × 1けた', tag:'1だんめ',     icon:'✖', color:'grass',   diff:1, count:6, cfg:{op:'mul', topD:2, botD:1} },
    { id:'h_mul_2', name:'3けた × 1けた', tag:'すこし なが め', icon:'✖', color:'diamond', diff:2, count:6, cfg:{op:'mul', topD:3, botD:1} },
  ],
  div: [
    { id:'h_div_1', name:'2けた ÷ 1けた', tag:'あまり なし',   icon:'➗', color:'grass',    diff:1, count:6, cfg:{op:'div', topD:2, botD:1, withRemainder:false} },
    { id:'h_div_2', name:'3けた ÷ 1けた', tag:'なが いひっさん', icon:'➗', color:'emerald',  diff:2, count:6, cfg:{op:'div', topD:3, botD:1, withRemainder:false} },
    { id:'h_div_3', name:'3けた ÷ 1けた', tag:'あまり あり',   icon:'➗', color:'redstone', diff:3, count:5, cfg:{op:'div', topD:3, botD:1, withRemainder:true} },
  ],
};

const hissanState = {
  op:null, stage:null, problems:[], index:0, problem:null,
  step:0, phase:null,
  numCols:0,
  topDigits:[], botDigits:[], effectiveTop:[],
  borrowed:[],            // visual: did this column get modified by a borrow?
  carry:[],               // per-column carry-in (add)
  answerDigits:[],        // user's answers, one per column
  expected:0, expectedCarryOut:0,
  attemptsOnCurrent:0,
  // multiplication (×1桁 only)
  mulCarry:0,
  // division (long division)
  divCurrent:0, divQuotient:[], divQuotientStarted:false, divRemainder:0,
  divPos:0,
  // bookkeeping
  startedAt:0, endedAt:0,
  correctCount:0, perfectCount:0,
};

/* ---------- Helpers ---------- */
function digitsOf(n, padTo) {
  // little-endian: index 0 = ones
  const s = String(Math.max(0, Math.floor(n)));
  const arr = s.split('').reverse().map(Number);
  while (arr.length < padTo) arr.push(0);
  return arr;
}
function numDigits(n) { return Math.max(1, String(Math.max(1, Math.floor(n))).length); }

function checkAddCarry(a, b) {
  let carry = 0;
  while (a > 0 || b > 0) {
    const ad = a % 10, bd = b % 10;
    if (ad + bd + carry >= 10) return true;
    carry = (ad + bd + carry) >= 10 ? 1 : 0;
    a = Math.floor(a / 10); b = Math.floor(b / 10);
  }
  return false;
}
function checkSubBorrow(a, b) {
  let borrow = 0, any = false, cascade = false;
  let aT = a, bT = b;
  while (aT > 0 || bT > 0) {
    const ad = (aT % 10) - borrow;
    const bd = bT % 10;
    if (ad < bd) {
      any = true;
      let probe = Math.floor(aT / 10);
      while (probe % 10 === 0 && probe > 0) { cascade = true; probe = Math.floor(probe / 10); }
      borrow = 1;
    } else borrow = 0;
    aT = Math.floor(aT / 10); bT = Math.floor(bT / 10);
  }
  return { any, cascade };
}

/* ---------- Problem builder ---------- */
function buildHissanProblem(cfg) {
  const minTop = Math.pow(10, cfg.topD - 1);
  const maxTop = Math.pow(10, cfg.topD) - 1;
  const minBot = cfg.botD === 1 ? 1 : Math.pow(10, cfg.botD - 1);
  const maxBot = Math.pow(10, cfg.botD) - 1;

  if (cfg.op === 'add') {
    for (let t = 0; t < 80; t++) {
      const a = randInt(minTop, maxTop), b = randInt(minBot, maxBot);
      const has = checkAddCarry(a, b);
      if (cfg.requireCarry && !has) continue;
      if (cfg.allowCarry === false && has) continue;
      return { op:'add', a, b, ans:a+b };
    }
    const a = randInt(minTop, maxTop), b = randInt(minBot, maxBot);
    return { op:'add', a, b, ans:a+b };
  }

  if (cfg.op === 'sub') {
    for (let t = 0; t < 120; t++) {
      const a = randInt(minTop, maxTop);
      const b = randInt(minBot, Math.min(maxBot, a));
      if (a < b) continue;
      const inf = checkSubBorrow(a, b);
      if (cfg.requireBorrow && !inf.any) continue;
      if (cfg.requireCascade && !inf.cascade) continue;
      if (cfg.allowBorrow === false && inf.any) continue;
      return { op:'sub', a, b, ans:a-b };
    }
    // fallback: hand-crafted cascade if requested
    if (cfg.requireCascade) {
      const a = randInt(101, 999);
      const b = randInt(1, 9);
      return { op:'sub', a, b, ans:a-b };
    }
    const a = randInt(minTop, maxTop);
    const b = randInt(minBot, Math.min(maxBot, a));
    return { op:'sub', a, b, ans:a-b };
  }

  if (cfg.op === 'mul') {
    const a = randInt(minTop, maxTop);
    const b = randInt(2, 9); // single-digit multiplier; avoid 0/1 for educational value
    return { op:'mul', a, b, ans:a*b };
  }

  if (cfg.op === 'div') {
    for (let t = 0; t < 80; t++) {
      const b = randInt(2, 9);
      const qLo = cfg.topD === 2 ? 2 : 12;
      const qHi = cfg.topD === 2 ? 9 : 99;
      const q = randInt(qLo, qHi);
      const r = cfg.withRemainder ? randInt(1, b - 1) : 0;
      const a = b * q + r;
      if (a < minTop || a > maxTop) continue;
      return { op:'div', a, b, q, r, ans:q, withRemainder: !!cfg.withRemainder };
    }
    const b = randInt(2, 9), q = 12, r = cfg.withRemainder ? 1 : 0;
    return { op:'div', a: b*q+r, b, q, r, ans:q, withRemainder: !!cfg.withRemainder };
  }
}

/* ---------- Navigation ---------- */
function goHissan() {
  renderBreadcrumb([
    {label:'さんすう', onClick: goMath},
    {label:'ひっさん'},
  ]);
  setSidebarActive('math');
  showView('hissan-menu');
}

function goHissanOp(op) {
  if (!HISSAN_STAGES[op]) return;
  hissanState.op = op;
  renderBreadcrumb([
    {label:'さんすう', onClick: goMath},
    {label:'ひっさん', onClick: goHissan},
    {label: HISSAN_OP_META[op].label},
  ]);
  setSidebarActive('math');
  $('hissan-stages-title').textContent = `🧾 ${HISSAN_OP_META[op].label} の ひっさん`;
  $('hissan-stages-lead').textContent = op === 'sub'
    ? '「お金の りょうがえ」で くりさがりが よくわかるよ！'
    : 'やさしい ステージから じゅんに チャレンジしよう。';
  renderHissanStageGrid(op);
  showView('hissan-stages');
}

function renderHissanStageGrid(op) {
  const grid = $('hissan-stage-grid');
  grid.innerHTML = '';
  (HISSAN_STAGES[op] || []).forEach(s => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `stage-card stage-${s.color}`;
    const best = store.best[s.id];
    const cleared = store.cleared[s.id];
    btn.innerHTML = `
      ${cleared ? '<span class="sc-clear">✔</span>' : ''}
      <div class="sc-ico">${s.icon}</div>
      <div class="sc-name">${s.name}</div>
      <div class="sc-sub">${s.tag}</div>
      ${ best ? `<div class="sc-best">★ ${best}P</div>` : `<div class="sc-count">${s.count} 問</div>`}
    `;
    btn.addEventListener('click', () => startHissan(op, s.id));
    grid.appendChild(btn);
  });
}

/* ---------- Start / Problem load ---------- */
function startHissan(op, stageId) {
  const s = (HISSAN_STAGES[op] || []).find(x => x.id === stageId);
  if (!s) return;
  hissanState.op = op;
  hissanState.stage = s;
  hissanState.problems = [];
  for (let i = 0; i < s.count; i++) hissanState.problems.push(buildHissanProblem(s.cfg));
  hissanState.index = 0;
  hissanState.correctCount = 0;
  hissanState.perfectCount = 0;
  hissanState.startedAt = Date.now();

  renderBreadcrumb([
    {label:'さんすう', onClick: goMath},
    {label:'ひっさん', onClick: goHissan},
    {label: HISSAN_OP_META[op].label, onClick: () => goHissanOp(op)},
    {label: s.name},
  ]);
  setSidebarActive('math');
  $('hissan-game-title').textContent = `${s.name}（${s.tag}）`;
  buildNumpad();
  loadHissanProblem();
  showView('hissan-game');
  showToast('hissan-toast', `▶ ${s.name} スタート！`, '#ffd76b');
}

function loadHissanProblem() {
  const p = hissanState.problems[hissanState.index];
  hissanState.problem = p;
  hissanState.attemptsOnCurrent = 0;
  hissanState.step = 0;
  hissanState.phase = null;
  hissanState.answerDigits = [];
  hissanState.carry = [];
  hissanState.borrowed = [];
  hissanState.mulCarry = 0;
  hissanState.divCurrent = 0;
  hissanState.divQuotient = [];
  hissanState.divQuotientStarted = false;
  hissanState.divRemainder = 0;
  hissanState.divPos = 0;

  const op = hissanState.op;
  let cols;
  if (op === 'add') cols = Math.max(numDigits(p.a), numDigits(p.b)) + 1;
  else if (op === 'sub') cols = Math.max(numDigits(p.a), numDigits(p.b));
  else if (op === 'mul') cols = numDigits(p.a) + 1;
  else cols = numDigits(p.a);
  hissanState.numCols = cols;
  hissanState.topDigits    = digitsOf(p.a, cols);
  hissanState.botDigits    = digitsOf(p.b, cols);
  hissanState.effectiveTop = hissanState.topDigits.slice();
  // Separate coin tally that shrinks as the kid pays each column.
  hissanState.coinCounts   = digitsOf(p.a, Math.max(3, cols));

  $('hissan-progress').textContent = `${hissanState.index + 1} / ${hissanState.problems.length} 問目`;
  renderHissanProgressDots();

  // coin shop is only relevant for sub
  $('coin-shop').hidden = (op !== 'sub');
  const stageEl = document.querySelector('.hissan-stage');
  if (stageEl) stageEl.classList.toggle('no-coin', op !== 'sub');

  renderHissanGame();
  promptHissanStep();
}

function renderHissanProgressDots() {
  const el = $('hissan-progress-dots');
  if (!el) return;
  el.innerHTML = '';
  hissanState.problems.forEach((_, i) => {
    const d = document.createElement('span');
    d.className = 'pdot';
    if (i < hissanState.index) d.classList.add('done');
    if (i === hissanState.index) d.classList.add('active');
    el.appendChild(d);
  });
}

/* ---------- Numpad ---------- */
function buildNumpad() {
  const host = $('numpad');
  if (!host) return;
  host.innerHTML = '';
  // 1-9 in a 3x3 grid, then 0 spanning, then clear
  for (let d = 1; d <= 9; d++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'numpad-btn';
    btn.dataset.digit = String(d);
    btn.textContent = String(d);
    host.appendChild(btn);
  }
  const zero = document.createElement('button');
  zero.type = 'button';
  zero.className = 'numpad-btn np-0';
  zero.dataset.digit = '0';
  zero.textContent = '0';
  host.appendChild(zero);
  const clr = document.createElement('button');
  clr.type = 'button';
  clr.className = 'numpad-btn np-clear';
  clr.dataset.digit = 'clear';
  clr.textContent = '↺';
  clr.title = 'やりなおし';
  host.appendChild(clr);

  host.onclick = (e) => {
    const t = e.target.closest('button.numpad-btn');
    if (!t) return;
    const d = t.dataset.digit;
    if (d === 'clear') {
      // restart current problem (keep score)
      hissanState.attemptsOnCurrent += 2; // penalize a bit
      hissanState.borrowed = [];
      hissanState.effectiveTop = hissanState.topDigits.slice();
      hissanState.answerDigits = [];
      hissanState.step = 0;
      hissanState.carry = [];
      hissanState.mulCarry = 0;
      hissanState.divCurrent = 0;
      hissanState.divQuotient = [];
      hissanState.divQuotientStarted = false;
      hissanState.divPos = 0;
      renderHissanGame();
      promptHissanStep();
      return;
    }
    handleHissanInput(parseInt(d, 10));
  };
}
function showNumpad() { const n = $('numpad'); if (n) n.hidden = false; }
function hideNumpad() { const n = $('numpad'); if (n) n.hidden = true;  }

/* ---------- Renderers ---------- */
function renderHissanGame() {
  const op = hissanState.op;
  if (op === 'add') renderHissanAdd();
  else if (op === 'sub') renderHissanSub();
  else if (op === 'mul') renderHissanMul();
  else if (op === 'div') renderHissanDiv();
}

function placeNameJP(idx) {
  return ['いち','じゅう','ひゃく','せん','まん'][idx] + 'のくらい';
}
function placeColIcon(idx) {
  return ['¥1','¥10','¥100'][idx] || '';
}

function makeGrid(cols) {
  // cols: number of columns to the right of the op symbol
  const grid = document.createElement('div');
  grid.className = 'hissan-grid';
  // 1 col for op symbol + cols
  grid.style.gridTemplateColumns = `38px repeat(${cols}, 48px)`;
  return grid;
}
function makeCellEmpty() {
  const c = document.createElement('div');
  c.className = 'hissan-cell h-empty';
  return c;
}
function makeOpCell(sym) {
  const c = document.createElement('div');
  c.className = 'hissan-op-cell';
  c.textContent = sym;
  return c;
}
function makeMiniSpacer() {
  const c = document.createElement('div');
  c.className = 'hissan-mini empty-mini';
  return c;
}
function makeRule(spanCols) {
  const r = document.createElement('div');
  r.className = 'hissan-rule-cell';
  r.style.gridColumn = `1 / span ${spanCols + 1}`;
  return r;
}

function digitCell(value, opts = {}) {
  const c = document.createElement('div');
  c.className = 'hissan-cell';
  if (opts.empty) { c.classList.add('h-empty'); c.textContent = ''; return c; }
  if (opts.input) c.classList.add('h-input');
  if (opts.active) c.classList.add('active');
  if (opts.correct) c.classList.add('h-correct');
  if (opts.wrong) c.classList.add('h-wrong');
  if (opts.strike) c.classList.add('h-strike');
  c.textContent = (value === undefined || value === null) ? '?' : String(value);
  return c;
}

/* === Addition ====================================================== */
function renderHissanAdd() {
  const paper = $('hissan-paper');
  paper.innerHTML = '';
  const p = hissanState.problem;
  const aLen = numDigits(p.a), bLen = numDigits(p.b);
  const cols = hissanState.numCols;
  const grid = makeGrid(cols);

  // Carry row (above top)
  grid.appendChild(makeMiniSpacer());
  for (let i = cols - 1; i >= 0; i--) {
    const m = document.createElement('div');
    m.className = 'hissan-mini';
    const c = hissanState.carry[i];
    if (c && c > 0 && i > 0 /* carry into i means displayed above i */) {
      m.classList.add('carry-c');
      m.textContent = `+${c}`;
    } else {
      m.classList.add('empty-mini');
    }
    grid.appendChild(m);
  }

  // Top row
  grid.appendChild(makeOpCell(''));
  for (let i = cols - 1; i >= 0; i--) {
    if (i >= aLen) grid.appendChild(makeCellEmpty());
    else grid.appendChild(digitCell(hissanState.topDigits[i]));
  }
  // Bottom row
  grid.appendChild(makeOpCell('+'));
  for (let i = cols - 1; i >= 0; i--) {
    if (i >= bLen) grid.appendChild(makeCellEmpty());
    else grid.appendChild(digitCell(hissanState.botDigits[i]));
  }
  // Rule
  grid.appendChild(makeRule(cols));
  // Answer row
  grid.appendChild(makeOpCell(''));
  for (let i = cols - 1; i >= 0; i--) {
    if (hissanState.answerDigits[i] !== undefined) {
      grid.appendChild(digitCell(hissanState.answerDigits[i], { correct:true }));
    } else if (i === hissanState.step) {
      grid.appendChild(digitCell('?', { input:true, active:true }));
    } else if (i > Math.max(aLen, bLen) && (hissanState.carry[i] || 0) === 0) {
      grid.appendChild(makeCellEmpty());
    } else {
      grid.appendChild(digitCell('?', { input:true }));
    }
  }
  paper.appendChild(grid);
}

/* === Subtraction =================================================== */
function renderHissanSub() {
  const paper = $('hissan-paper');
  paper.innerHTML = '';
  const p = hissanState.problem;
  const aLen = numDigits(p.a), bLen = numDigits(p.b);
  const cols = hissanState.numCols;
  const grid = makeGrid(cols);

  // Borrow-modified row (above top): show new effective digit if column was modified
  grid.appendChild(makeMiniSpacer());
  for (let i = cols - 1; i >= 0; i--) {
    const m = document.createElement('div');
    m.className = 'hissan-mini';
    if (hissanState.borrowed[i]) {
      m.classList.add('borrow-new');
      m.textContent = String(hissanState.effectiveTop[i]);
    } else {
      m.classList.add('empty-mini');
    }
    grid.appendChild(m);
  }

  // Top row (with strike if borrowed)
  grid.appendChild(makeOpCell(''));
  for (let i = cols - 1; i >= 0; i--) {
    if (i >= aLen) grid.appendChild(makeCellEmpty());
    else grid.appendChild(digitCell(hissanState.topDigits[i], { strike: !!hissanState.borrowed[i] }));
  }
  // Bottom row
  grid.appendChild(makeOpCell('−'));
  for (let i = cols - 1; i >= 0; i--) {
    if (i >= bLen) grid.appendChild(makeCellEmpty());
    else grid.appendChild(digitCell(hissanState.botDigits[i]));
  }
  grid.appendChild(makeRule(cols));
  // Answer
  grid.appendChild(makeOpCell(''));
  for (let i = cols - 1; i >= 0; i--) {
    if (hissanState.answerDigits[i] !== undefined) {
      grid.appendChild(digitCell(hissanState.answerDigits[i], { correct:true }));
    } else if (i === hissanState.step) {
      grid.appendChild(digitCell('?', { input:true, active:true }));
    } else if (i > Math.max(aLen, bLen)) {
      grid.appendChild(makeCellEmpty());
    } else {
      grid.appendChild(digitCell('?', { input:true }));
    }
  }
  paper.appendChild(grid);
}

/* === Multiplication (×1桁) ========================================= */
function renderHissanMul() {
  const paper = $('hissan-paper');
  paper.innerHTML = '';
  const p = hissanState.problem;
  const aLen = numDigits(p.a);
  const cols = hissanState.numCols;
  const grid = makeGrid(cols);

  // Carry row above top
  grid.appendChild(makeMiniSpacer());
  for (let i = cols - 1; i >= 0; i--) {
    const m = document.createElement('div');
    m.className = 'hissan-mini';
    const c = hissanState.carry[i];
    if (c && c > 0) { m.classList.add('carry-c'); m.textContent = `+${c}`; }
    else m.classList.add('empty-mini');
    grid.appendChild(m);
  }
  // Top row
  grid.appendChild(makeOpCell(''));
  for (let i = cols - 1; i >= 0; i--) {
    if (i >= aLen) grid.appendChild(makeCellEmpty());
    else grid.appendChild(digitCell(hissanState.topDigits[i]));
  }
  // Bottom (just 1-digit multiplier on the rightmost column)
  grid.appendChild(makeOpCell('×'));
  for (let i = cols - 1; i >= 0; i--) {
    if (i === 0) grid.appendChild(digitCell(hissanState.botDigits[0]));
    else grid.appendChild(makeCellEmpty());
  }
  grid.appendChild(makeRule(cols));
  // Answer
  grid.appendChild(makeOpCell(''));
  for (let i = cols - 1; i >= 0; i--) {
    if (hissanState.answerDigits[i] !== undefined) {
      grid.appendChild(digitCell(hissanState.answerDigits[i], { correct:true }));
    } else if (i === hissanState.step) {
      grid.appendChild(digitCell('?', { input:true, active:true }));
    } else if (i > aLen && (hissanState.carry[i] || 0) === 0) {
      grid.appendChild(makeCellEmpty());
    } else {
      grid.appendChild(digitCell('?', { input:true }));
    }
  }
  paper.appendChild(grid);
}

/* === Division (long division, ÷1桁) ================================ */
function renderHissanDiv() {
  const paper = $('hissan-paper');
  paper.innerHTML = '';
  const p = hissanState.problem;
  const dStr = String(p.a);
  const dLen = dStr.length;
  // total grid columns: 1 (divisor on left) + 1 (')') + dLen (dividend digits)
  const grid = document.createElement('div');
  grid.className = 'hissan-grid';
  grid.style.gridTemplateColumns = `38px 24px repeat(${dLen}, 48px)`;

  // Quotient row (above)
  // empty for divisor, empty for ')'
  grid.appendChild(makeOpCell(''));
  grid.appendChild(makeOpCell(''));
  for (let i = 0; i < dLen; i++) {
    if (hissanState.divQuotient[i] !== undefined && hissanState.divQuotient[i] !== null) {
      grid.appendChild(digitCell(hissanState.divQuotient[i], { correct:true }));
    } else if (i === hissanState.divPos) {
      grid.appendChild(digitCell('?', { input:true, active:true }));
    } else if (i < hissanState.divPos) {
      // already passed; placeholder shown only if not yet started
      grid.appendChild(makeCellEmpty());
    } else {
      grid.appendChild(makeCellEmpty());
    }
  }
  // Rule (under quotient)
  const rule = document.createElement('div');
  rule.className = 'hissan-rule-cell';
  rule.style.gridColumn = `3 / span ${dLen}`;
  grid.appendChild(rule);

  // Dividend row: divisor ')' then digits
  grid.appendChild(digitCell(p.b));
  const paren = document.createElement('div');
  paren.className = 'hissan-op-cell';
  paren.textContent = ')';
  grid.appendChild(paren);
  for (let i = 0; i < dLen; i++) {
    grid.appendChild(digitCell(parseInt(dStr[i], 10)));
  }

  paper.appendChild(grid);

  // Show running remainder under the dividend
  const trail = document.createElement('div');
  trail.className = 'hissan-msg';
  trail.style.marginTop = '8px';
  if (hissanState.divPos > 0 && hissanState.divQuotientStarted) {
    trail.innerHTML = `<small>いまの あまり：<b>${hissanState.divCurrent}</b></small>`;
  } else if (hissanState.divPos === 0 && !hissanState.divQuotientStarted) {
    trail.innerHTML = `<small>左から じゅんに けいさんするよ</small>`;
  }
  paper.appendChild(trail);
}

/* ---------- Coin shop (subtraction borrow visualisation) ---------- */
function renderCoinShop() {
  const host = $('coin-columns');
  if (!host) return;
  host.innerHTML = '';
  const topMag = numDigits(hissanState.problem.a);
  // Only show denominations the top number actually uses (and any that
  // received coins via cascade borrow).  Saves space on 2-digit problems.
  const denoms = [
    { key:'h', idx:2, label:'100の くらい', face:'¥100', cls:'coin-100' },
    { key:'t', idx:1, label:'10の くらい',  face:'¥10',  cls:'coin-10'  },
    { key:'o', idx:0, label:'1の くらい',   face:'¥1',   cls:'coin-1'   },
  ].filter(d => d.idx < topMag || hissanState.borrowed[d.idx]);
  host.style.gridTemplateColumns = `repeat(${denoms.length}, 1fr)`;
  denoms.forEach(d => {
    const col = document.createElement('div');
    col.className = 'coin-col';
    col.dataset.col = d.key;
    const label = document.createElement('div');
    label.className = 'coin-col-label';
    label.textContent = d.label;
    col.appendChild(label);
    const count = document.createElement('div');
    count.className = 'coin-col-count';
    const n = Math.max(0, hissanState.coinCounts[d.idx] || 0);
    count.textContent = `× ${n}`;
    col.appendChild(count);
    const stack = document.createElement('div');
    stack.className = 'coin-stack';
    // Cap visible coins to keep the UI readable; the count badge is the source of truth.
    const visible = Math.min(n, d.key === 'h' ? 9 : 12);
    for (let i = 0; i < visible; i++) {
      const c = document.createElement('span');
      c.className = `coin ${d.cls} coin-appear`;
      c.style.animationDelay = `${i*30}ms`;
      c.textContent = d.face;
      stack.appendChild(c);
    }
    col.appendChild(stack);
    if (n > visible) {
      const more = document.createElement('div');
      more.className = 'coin-col-label';
      more.textContent = `…ほか ${n - visible}まい`;
      col.appendChild(more);
    }
    host.appendChild(col);
  });
}

async function animateBorrowExchange(fromKey, toKey) {
  // visual flourish for one exchange step (used by triggerBorrow loop)
  const fromCol = document.querySelector(`.coin-col[data-col="${fromKey}"]`);
  const toCol   = document.querySelector(`.coin-col[data-col="${toKey}"]`);
  if (fromCol) fromCol.classList.add('coin-col-source');
  if (toCol)   toCol.classList.add('coin-col-target');
  // ✦ burst between
  if (fromCol) {
    const burst = document.createElement('span');
    burst.className = 'coin-burst';
    burst.textContent = '🪙→🪙🪙🪙';
    burst.style.left = '4px';
    burst.style.top  = '40%';
    fromCol.appendChild(burst);
    setTimeout(() => burst.remove(), 900);
  }
  await sleep(700);
  if (fromCol) fromCol.classList.remove('coin-col-source');
  if (toCol)   toCol.classList.remove('coin-col-target');
}

async function triggerBorrow() {
  const step = hissanState.step;
  hideNumpad();
  hissanState.phase = 'borrowing';
  $('hissan-actions').innerHTML = '<div class="hissan-busy">🪙 りょうがえ ちゅう…</div>';
  $('hissan-msg').textContent = 'お金を こまかい おかねに りょうがえ するよ！';

  // Find smallest j > step where effectiveTop[j] > 0
  let j = step + 1;
  while (j < hissanState.effectiveTop.length && hissanState.effectiveTop[j] === 0) j++;
  if (j >= hissanState.effectiveTop.length) {
    showToast('hissan-toast', 'りょうがえ できる お金が ないよ…', '#ff9a8a');
    promptHissanStep();
    return;
  }

  // Cascade from j down to step
  let cur = j;
  const colKey = ['o','t','h'];
  while (cur > step) {
    // Source: cur; target: cur-1
    const fromKey = colKey[cur], toKey = colKey[cur-1];
    const $msg = $('coin-shop-msg');
    if ($msg) {
      const fromFace = ['¥1','¥10','¥100'][cur];
      const toFace   = ['¥1','¥10','¥100'][cur-1];
      $msg.textContent = `🪙 ${fromFace} 1まいを、${toFace} 10まいに りょうがえ！`;
    }
    await animateBorrowExchange(fromKey, toKey);

    hissanState.effectiveTop[cur]   -= 1;
    hissanState.effectiveTop[cur-1] += 10;
    hissanState.borrowed[cur]   = true;
    hissanState.borrowed[cur-1] = true;
    // Sync coin tally to the post-borrow state so the shop reflects the trade.
    hissanState.coinCounts[cur]   = hissanState.effectiveTop[cur];
    hissanState.coinCounts[cur-1] = hissanState.effectiveTop[cur-1];
    renderCoinShop();
    renderHissanSub();
    await sleep(420);
    cur--;
  }
  const $msg = $('coin-shop-msg');
  if ($msg) $msg.textContent = `🎉 りょうがえ かんりょう！${placeNameJP(step)} で けいさんできるね`;
  promptHissanStep();
}

/* ---------- Step prompts (per op) ---------- */
function promptHissanStep() {
  const op = hissanState.op;
  if (op === 'add') promptAddStep();
  else if (op === 'sub') promptSubStep();
  else if (op === 'mul') promptMulStep();
  else if (op === 'div') promptDivStep();
}

function promptAddStep() {
  const step = hissanState.step;
  const p = hissanState.problem;
  const aLen = numDigits(p.a), bLen = numDigits(p.b);
  const maxLen = Math.max(aLen, bLen);
  const carryIn = hissanState.carry[step] || 0;

  if (step >= maxLen && carryIn === 0) { finishHissanProblem(); return; }
  if (step > hissanState.numCols - 1) { finishHissanProblem(); return; }

  const t = step < aLen ? hissanState.topDigits[step] : 0;
  const b = step < bLen ? hissanState.botDigits[step] : 0;
  const sum = t + b + carryIn;
  hissanState.expected = sum % 10;
  hissanState.expectedCarryOut = sum >= 10 ? 1 : 0;
  hissanState.phase = 'enter';

  let msg = `🔢 ${placeNameJP(step)}：${t} + ${b}`;
  if (carryIn) msg += ` + ${carryIn}（くりあがり）`;
  msg += ' = ?';
  $('hissan-msg').textContent = msg;
  $('hissan-actions').innerHTML = '';
  showNumpad();
  renderHissanAdd();
}

function promptSubStep() {
  const step = hissanState.step;
  const p = hissanState.problem;
  const aLen = numDigits(p.a), bLen = numDigits(p.b);
  const maxLen = Math.max(aLen, bLen);
  if (step >= maxLen) { finishHissanProblem(); return; }

  const t = hissanState.effectiveTop[step];
  const b = step < bLen ? hissanState.botDigits[step] : 0;

  if (t < b) {
    // Borrow needed
    hissanState.phase = 'borrow_required';
    $('hissan-msg').innerHTML = `😯 ${placeNameJP(step)}：<b>${t}</b> から <b>${b}</b> は ひけないね！<br>🪙 となりの くらいから <b>りょうがえ</b> しよう。`;
    $('hissan-actions').innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mc-btn mc-btn-gold';
    btn.textContent = '🪙 りょうがえ する！';
    btn.addEventListener('click', () => triggerBorrow());
    $('hissan-actions').appendChild(btn);
    hideNumpad();
    const $msg = $('coin-shop-msg');
    if ($msg) $msg.textContent = `となりの くらいから 1まい かりて、こまかい おかねに かえるよ`;
  } else {
    hissanState.phase = 'enter';
    hissanState.expected = t - b;
    $('hissan-msg').textContent = `➖ ${placeNameJP(step)}：${t} - ${b} = ?`;
    $('hissan-actions').innerHTML = '';
    showNumpad();
  }
  renderHissanSub();
  renderCoinShop();
}

function promptMulStep() {
  const step = hissanState.step;
  const p = hissanState.problem;
  const aLen = numDigits(p.a);
  const carryIn = hissanState.carry[step] || 0;
  if (step >= aLen && carryIn === 0) { finishHissanProblem(); return; }

  const t = step < aLen ? hissanState.topDigits[step] : 0;
  const m = hissanState.botDigits[0];
  const prod = t * m + carryIn;
  hissanState.expected = prod % 10;
  hissanState.expectedCarryOut = Math.floor(prod / 10);
  hissanState.phase = 'enter';

  let msg = `✖ ${placeNameJP(step)}：${t} × ${m}`;
  if (carryIn) msg += ` + ${carryIn}（くりあがり）`;
  msg += ' = ?';
  $('hissan-msg').textContent = msg;
  $('hissan-actions').innerHTML = '';
  showNumpad();
  renderHissanMul();
}

function promptDivStep() {
  const p = hissanState.problem;
  const dStr = String(p.a);
  const divisor = p.b;

  if (hissanState.divPos >= dStr.length) { finishHissanProblem(); return; }

  // Bring down next digit into divCurrent
  const next = parseInt(dStr[hissanState.divPos], 10);
  hissanState.divCurrent = hissanState.divCurrent * 10 + next;
  const cur = hissanState.divCurrent;
  const q = Math.floor(cur / divisor);
  // Skip leading zero quotient digits silently
  if (q === 0 && !hissanState.divQuotientStarted) {
    hissanState.divQuotient[hissanState.divPos] = null;
    hissanState.divPos += 1;
    promptDivStep();
    return;
  }
  hissanState.divQuotientStarted = true;
  hissanState.expected = q;
  hissanState.expectedAfter = cur - q * divisor;
  hissanState.phase = 'enter';

  $('hissan-msg').innerHTML = `📐 <b>${cur}</b> ÷ <b>${divisor}</b> = ? <small>(${cur} の なかに ${divisor} は いくつ はいる？)</small>`;
  $('hissan-actions').innerHTML = '';
  showNumpad();
  renderHissanDiv();
}

/* ---------- Input handlers (per op) ---------- */
function handleHissanInput(d) {
  if (hissanState.phase !== 'enter') return;
  const op = hissanState.op;
  if (op === 'add') handleAddInput(d);
  else if (op === 'sub') handleSubInput(d);
  else if (op === 'mul') handleMulInput(d);
  else if (op === 'div') handleDivInput(d);
}

function correctFlash() {
  // brief flash on the active answer cell
  const active = document.querySelector('.hissan-cell.h-input.active');
  if (active) {
    active.classList.remove('h-input', 'active');
    active.classList.add('h-correct');
    void active.offsetWidth;
  }
}
function wrongShake() {
  const active = document.querySelector('.hissan-cell.h-input.active');
  if (active) {
    active.classList.add('h-wrong');
    void active.offsetWidth;
    setTimeout(() => active.classList.remove('h-wrong'), 400);
  }
  hissanState.attemptsOnCurrent += 1;
}

function handleAddInput(d) {
  if (d === hissanState.expected) {
    hissanState.answerDigits[hissanState.step] = d;
    correctFlash();
    showToast('hissan-toast', '⛏ せいかい！', '#b6ff6e');
    // propagate carry-out to next column
    const nextStep = hissanState.step + 1;
    hissanState.carry[nextStep] = (hissanState.carry[nextStep] || 0) + (hissanState.expectedCarryOut || 0);
    hissanState.step = nextStep;
    setTimeout(() => promptHissanStep(), 350);
  } else {
    wrongShake();
    if (hissanState.attemptsOnCurrent >= 2) {
      showToast('hissan-toast', `ヒント：こたえは ${hissanState.expected}`, '#ffd76b');
    } else {
      showToast('hissan-toast', 'おしい！もういちど', '#ff9a8a');
    }
  }
}

function handleSubInput(d) {
  if (d === hissanState.expected) {
    hissanState.answerDigits[hissanState.step] = d;
    correctFlash();
    // Visually pay out the bottom-digit's worth of coins from this column.
    // effectiveTop is left alone (it pins the post-borrow value shown in the
    // borrow row); coinCounts shrinks so the shop reflects the customer paying.
    hissanState.coinCounts[hissanState.step] -= hissanState.botDigits[hissanState.step] || 0;
    renderCoinShop();
    showToast('hissan-toast', '⛏ せいかい！', '#b6ff6e');
    hissanState.step += 1;
    setTimeout(() => promptHissanStep(), 380);
  } else {
    wrongShake();
    if (hissanState.attemptsOnCurrent >= 2) {
      showToast('hissan-toast', `ヒント：こたえは ${hissanState.expected}`, '#ffd76b');
    } else {
      showToast('hissan-toast', 'おしい！もういちど かぞえてみよう', '#ff9a8a');
    }
  }
}

function handleMulInput(d) {
  if (d === hissanState.expected) {
    hissanState.answerDigits[hissanState.step] = d;
    correctFlash();
    showToast('hissan-toast', '⛏ せいかい！', '#b6ff6e');
    const next = hissanState.step + 1;
    hissanState.carry[next] = (hissanState.carry[next] || 0) + (hissanState.expectedCarryOut || 0);
    hissanState.step = next;
    setTimeout(() => promptHissanStep(), 350);
  } else {
    wrongShake();
    if (hissanState.attemptsOnCurrent >= 2) {
      showToast('hissan-toast', `ヒント：${hissanState.expected}`, '#ffd76b');
    } else {
      showToast('hissan-toast', 'おしい！九九を おもいだそう', '#ff9a8a');
    }
  }
}

function handleDivInput(d) {
  if (d === hissanState.expected) {
    hissanState.divQuotient[hissanState.divPos] = d;
    correctFlash();
    showToast('hissan-toast', `⛏ ${hissanState.divCurrent} ÷ ${hissanState.problem.b} = ${d} あまり ${hissanState.expectedAfter}`, '#b6ff6e');
    hissanState.divCurrent = hissanState.expectedAfter;
    hissanState.divPos += 1;
    setTimeout(() => promptHissanStep(), 420);
  } else {
    wrongShake();
    if (hissanState.attemptsOnCurrent >= 2) {
      showToast('hissan-toast', `ヒント：${hissanState.expected}`, '#ffd76b');
    } else {
      showToast('hissan-toast', `${hissanState.problem.b} の だんで ためしてみよう`, '#ff9a8a');
    }
  }
}

/* ---------- Per-problem completion ---------- */
function finishHissanProblem() {
  hissanState.correctCount += 1;
  if (hissanState.attemptsOnCurrent === 0) hissanState.perfectCount += 1;

  const p = hissanState.problem;
  const op = hissanState.op;
  // Sanity-check the assembled answer
  let ok = true;
  if (op === 'add' || op === 'sub' || op === 'mul') {
    let assembled = 0;
    for (let i = hissanState.answerDigits.length - 1; i >= 0; i--) {
      assembled = assembled * 10 + (hissanState.answerDigits[i] || 0);
    }
    ok = assembled === p.ans;
  } else if (op === 'div') {
    let q = 0;
    for (let i = 0; i < hissanState.divQuotient.length; i++) {
      const x = hissanState.divQuotient[i];
      if (x === undefined || x === null) continue;
      q = q * 10 + x;
    }
    ok = q === p.ans;
  }
  let answerStr = `${p.ans}`;
  if (op === 'div' && p.withRemainder && p.r > 0) answerStr += ` あまり ${p.r}`;
  showToast('hissan-toast', ok ? `🎉 ${p.a} ${HISSAN_OP_META[op].sym} ${p.b} = ${answerStr}` : 'かんりょう！', '#b6ff6e');

  hissanState.index += 1;
  if (hissanState.index >= hissanState.problems.length) {
    setTimeout(finishHissan, 700);
  } else {
    setTimeout(loadHissanProblem, 700);
  }
}

function finishHissan() {
  hissanState.endedAt = Date.now();
  const total   = hissanState.problems.length;
  const correct = hissanState.correctCount;
  const perfect = hissanState.perfectCount;
  const seconds = Math.max(1, Math.round((hissanState.endedAt - hissanState.startedAt) / 1000));
  const points  = correct * 120 + perfect * 60 + 100;

  const stage = hissanState.stage;
  const isBest = !store.best[stage.id] || points > store.best[stage.id];
  if (isBest) store.best[stage.id] = points;
  store.cleared[stage.id] = true;
  store.totalPoints += points;
  store.plays += 1;
  saveStore();
  renderRankBadge();

  let medal, trophy, title;
  if (perfect === total)               { medal='gold';   trophy='🏆'; title='パーフェクト！'; }
  else if (perfect >= Math.ceil(total*0.7)) { medal='silver'; trophy='💎'; title='ひっさん マスター！'; }
  else                                 { medal='bronze'; trophy='⭐'; title='ステージ クリア！'; }

  // Reuse the existing result view, but mark it as a 筆算 result so the
  // retry/select buttons route back into the hissan flow.
  state.resultMode = 'hissan';
  $('result-trophy').textContent = trophy;
  $('result-title').textContent  = title;
  $('result-stage-name').textContent = `${HISSAN_OP_META[hissanState.op].label}・${stage.name}`;
  $('rs-correct').textContent = correct;
  $('rs-total').textContent   = total;
  $('rs-perfect').textContent = perfect;
  $('rs-time').textContent    = formatTime(seconds);
  $('rs-points').textContent  = points;
  $('result-best').hidden = !isBest;
  $('result-best').textContent = '🌟 じこベスト こうしん！';

  const medalRow = $('result-medal-row');
  medalRow.innerHTML = '';
  const tiers = [
    { k:'bronze', label:'クリア',       ok: true },
    { k:'silver', label:'ひっさん 上手', ok: medal === 'silver' || medal === 'gold' },
    { k:'gold',   label:'パーフェクト', ok: medal === 'gold' },
  ];
  tiers.forEach(t => {
    const el = document.createElement('div');
    el.className = `medal medal-${t.k} ${t.ok ? 'ok' : 'off'}`;
    el.textContent = t.label;
    medalRow.appendChild(el);
  });
  // Hide the timer stat for problems that have no meaningful time
  showView('result');
  burstOrbs();
}

/* ---------- Hissan event wiring ---------- */
$('hissan-back-btn').addEventListener('click', () => {
  if (confirm('もどる？（このステージの しんこうは リセット）')) {
    if (hissanState.op) goHissanOp(hissanState.op);
    else goHissan();
  }
});

/* ---------- Init ---------- */
renderRankBadge();
goHome();
