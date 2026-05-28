"use strict";

/* ===== 設定 ===== */

const WORKOUTS = [
  { id: "easy_jog",       name: "Easy Jog",          group: "jog" },
  { id: "recovery_jog",   name: "Recovery Jog",      group: "jog" },
  { id: "long_run",       name: "Long Run",          group: "jog" },
  { id: "tempo_run",      name: "Tempo Run",         group: "tempo" },
  { id: "threshold_run",  name: "Threshold Run",     group: "tempo" },
  { id: "lt_run",         name: "LT Run",            group: "tempo" },
  { id: "pace_run",       name: "Pace Run",          group: "tempo" },
  { id: "interval",       name: "Interval",          group: "interval" },
  { id: "repetition",     name: "Repetition",        group: "interval" },
  { id: "race_pace",      name: "Race Pace",         group: "interval" },
  { id: "race",           name: "Race",              group: "race" },
  { id: "strides",        name: "Strides",           group: "strides" },
  { id: "hill_sprint",    name: "Hill Sprint",       group: "strides" },
  { id: "fartlek",        name: "Fartlek",           group: "jog" },
  { id: "cross_country",  name: "Cross Country Run", group: "jog" },
  { id: "bike",           name: "Bike",              group: "bike" },
  { id: "strength",       name: "Strength",          group: "strength" },
  { id: "rest",           name: "Rest",              group: "rest" },
  { id: "custom",         name: "Custom",            group: "custom" },
];

const LOCATIONS = ["Track", "Road", "Cross Country", "Treadmill", "Trail", "Gym", "Other"];

const STORE_TEMPLATES = "tg_templates";
const STORE_HISTORY = "tg_history";
const HISTORY_MAX = 20;

/* ===== 状態 ===== */

let step = 1;
let furthest = 1;
let selectedWorkout = null;
let selectedLocation = null;
let locationChosen = false;
let garmin = null;            // パース済み Garmin データ
let prefilledGroups = {};     // group -> Garmin 自動入力済みフラグ

/* ===== ユーティリティ ===== */

const $ = (id) => document.getElementById(id);
const val = (id) => ($(id) ? $(id).value.trim() : "");

/* ===== 入力パーサ =====
 * 書式: [セット数]x[レップ数]x[距離 or 時間] (強度/ペース/心拍) [レスト] @環境/傾斜/負荷
 * 各要素はすべて省略可能。
 */
function parseWorkoutInput(raw) {
  const result = { sets: "", reps: "", dist: "", intensity: "", rest: "", env: "" };
  if (!raw) return result;
  let s = raw.trim();

  // (強度/ペース/心拍) — 丸括弧で囲まれた部分
  const intMatch = s.match(/\(([^)]*)\)/);
  if (intMatch) {
    result.intensity = intMatch[1].trim();
    s = s.replace(intMatch[0], " ");
  }

  // @環境/傾斜/負荷 — @ に続く非空白トークン
  const envMatch = s.match(/@(\S+)/);
  if (envMatch) {
    result.env = envMatch[1].trim();
    s = s.replace(envMatch[0], " ");
  }

  // レスト — r=... トークン
  const restMatch = s.match(/r\s*=\s*(\S+)/i);
  if (restMatch) {
    result.rest = "r=" + restMatch[1].trim();
    s = s.replace(restMatch[0], " ");
  }

  // 残り = [セット数]x[レップ数]x[距離 or 時間]
  s = s.trim();
  if (s) {
    const segs = s.split(/\s*x\s*/i).map((t) => t.trim()).filter(Boolean);
    if (segs.length === 1) {
      result.dist = segs[0];
    } else if (segs.length === 2) {
      result.reps = segs[0];
      result.dist = segs[1];
    } else if (segs.length >= 3) {
      result.sets = segs[0];
      result.reps = segs[1];
      result.dist = segs[2];
    }
  }
  return result;
}

/* パース結果から距離 × レップ × セットの主要部を組み立てる */
function buildMain(p) {
  let main = "";
  if (p.dist) main = p.dist;
  if (p.reps) main += (main ? " x " : "") + p.reps;
  if (p.sets) main += " x " + p.sets + "set";
  return main;
}

/* ===== タイトル生成 ===== */

function generateTitle() {
  if (!selectedWorkout) return "";

  const w = selectedWorkout;
  if (w.group === "custom") return $("titleOutput").value;

  const parts = [w.name];
  const p = parseWorkoutInput(val("workoutInput"));

  const main = buildMain(p);
  if (main) parts.push(main);
  if (p.intensity) parts.push("(" + p.intensity + ")");
  if (p.rest) parts.push(p.rest);

  // 環境: 入力欄の @ 指定を優先し、なければ Step 2 で選んだ場所
  const env = p.env || selectedLocation;
  if (env) parts.push("@" + env);

  return parts.filter(Boolean).join(" ").trim();
}

function refreshTitle() {
  if (!selectedWorkout || selectedWorkout.group === "custom") return;
  $("titleOutput").value = generateTitle();
}

/* ===== ステップ遷移 ===== */

function goStep(n) {
  step = n;
  if (n > furthest) furthest = n;
  document.querySelectorAll(".step-panel").forEach((p) => {
    p.hidden = Number(p.dataset.step) !== n;
  });
  updateSteps();
  if (n === 3) enterDetails();
  if (n === 4) enterTitle();
  window.scrollTo(0, 0);
}

function updateSteps() {
  $("pill1").textContent = selectedWorkout ? selectedWorkout.name : "種目";
  $("pill2").textContent = selectedLocation ? selectedLocation : (locationChosen ? "場所なし" : "場所");
  document.querySelectorAll(".step").forEach((el) => {
    const s = Number(el.dataset.step);
    el.classList.toggle("current", s === step);
    el.classList.toggle("done", s < step);
    el.disabled = s > furthest;
  });
}

function enterDetails() {
  const isCustom = selectedWorkout.group === "custom";
  $("form-unified").hidden = isCustom;
  $("form-custom").hidden = !isCustom;
  $("detailTitle").textContent = "内容を入力 — " + selectedWorkout.name;
  applyGarminPrefill(selectedWorkout.group);
}

function enterTitle() {
  if (selectedWorkout && selectedWorkout.group === "custom") {
    $("titleOutput").focus();
    return;
  }
  $("titleOutput").value = generateTitle();
}

/* ===== Garmin 自動取り込み ===== */

/* ページ側で実行される関数（label の直前にある数値を拾う） */
function garminScrapeFn() {
  const labels = {
    distance:  ["距離", "Distance"],
    duration:  ["タイム", "Time", "時間", "Elapsed Time", "Moving Time"],
    pace:      ["平均ペース", "Avg Pace", "Average Pace", "Avg. Pace"],
    elevation: ["総上昇量", "獲得標高", "Total Ascent", "Elevation Gain"],
    calories:  ["カロリー", "Calories"],
  };
  const leaves = Array.prototype.slice
    .call(document.querySelectorAll("body *"))
    .filter((el) => el.children.length === 0);
  const texts = leaves
    .map((el) => (el.textContent || "").trim())
    .filter((t) => t.length > 0 && t.length < 40);

  const out = {};
  const hasDigit = (s) => /\d/.test(s);
  Object.keys(labels).forEach((key) => {
    const keys = labels[key];
    for (let i = 0; i < texts.length; i++) {
      if (keys.indexOf(texts[i]) > -1) {
        for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
          if (hasDigit(texts[j])) { out[key] = texts[j]; break; }
        }
        if (out[key]) break;
      }
    }
  });
  return out;
}

function parseGarmin(raw) {
  const g = { raw: raw, distanceKm: null, durationMin: null, pace: null, elevation: null, calories: null };

  if (raw.distance) {
    const m = raw.distance.replace(/,/g, "").match(/[\d.]+/);
    if (m) {
      let n = parseFloat(m[0]);
      if (/m/i.test(raw.distance) && !/km/i.test(raw.distance) && n > 1000) n = n / 1000;
      g.distanceKm = Math.round(n * 100) / 100;
    }
  }
  if (raw.duration) {
    const p = raw.duration.match(/\d+/g);
    if (p) {
      let h = 0, m = 0, s = 0;
      if (p.length >= 3)      { h = +p[0]; m = +p[1]; s = +p[2]; }
      else if (p.length === 2){ m = +p[0]; s = +p[1]; }
      else if (p.length === 1){ m = +p[0]; }
      g.durationMin = Math.round((h * 3600 + m * 60 + s) / 60);
    }
  }
  if (raw.pace) {
    const m = raw.pace.match(/\d+:\d{2}/);
    if (m) g.pace = m[0];
  }
  if (raw.elevation) {
    const m = raw.elevation.replace(/,/g, "").match(/[\d.]+/);
    if (m) g.elevation = m[0];
  }
  if (raw.calories) {
    const m = raw.calories.replace(/,/g, "").match(/[\d.]+/);
    if (m) g.calories = m[0];
  }
  return g;
}

function loadGarmin() {
  if (!chrome.scripting || !chrome.tabs) return;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab || !tab.id || !/^https?:/.test(tab.url || "")) return;
    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, func: garminScrapeFn },
      (res) => {
        if (chrome.runtime.lastError) return;
        const raw = res && res[0] && res[0].result;
        if (!raw || !Object.keys(raw).length) return;
        garmin = parseGarmin(raw);
        showGarminBanner();
        if (step === 3 && selectedWorkout) applyGarminPrefill(selectedWorkout.group);
      }
    );
  });
}

function showGarminBanner() {
  if (!garmin) return;
  const r = garmin.raw;
  const bits = [];
  if (r.distance)  bits.push(r.distance);
  if (r.duration)  bits.push(r.duration);
  if (r.pace)      bits.push(r.pace.replace(/\s+/g, ""));
  if (r.elevation) bits.push("↑" + r.elevation);
  if (r.calories)  bits.push(r.calories + " kcal");
  $("garminText").textContent =
    "現在のページから取り込み: " + bits.join("  ·  ") + "（内容欄で編集できます）";
  $("garminBanner").hidden = false;
}

/* Garmin データを統一入力欄へ「距離 (ペース)」形式で流し込む */
function applyGarminPrefill(g) {
  if (!garmin || prefilledGroups[g] || g === "custom") return;

  if (!val("workoutInput")) {
    const bits = [];
    if (garmin.distanceKm != null) bits.push(garmin.distanceKm + "km");
    if (garmin.pace)               bits.push("(" + garmin.pace + ")");
    if (bits.length) $("workoutInput").value = bits.join(" ");
  }
  prefilledGroups[g] = true;
  refreshTitle();
}

/* ===== UI 構築 ===== */

function buildWorkoutButtons() {
  const wrap = $("workoutButtons");
  WORKOUTS.forEach((w) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = w.name;
    b.dataset.id = w.id;
    b.addEventListener("click", () => selectWorkout(w));
    wrap.appendChild(b);
  });
}

function buildLocationButtons() {
  const wrap = $("locationButtons");
  LOCATIONS.forEach((loc) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.textContent = loc;
    b.dataset.loc = loc;
    b.addEventListener("click", () => selectLocation(loc));
    wrap.appendChild(b);
  });
}

function selectWorkout(w) {
  selectedWorkout = w;
  document.querySelectorAll("#workoutButtons .chip").forEach((b) => {
    b.classList.toggle("selected", b.dataset.id === w.id);
  });
  goStep(2);
}

function selectLocation(loc) {
  selectedLocation = loc;
  locationChosen = true;
  document.querySelectorAll("#locationButtons .chip").forEach((b) => {
    b.classList.toggle("selected", b.dataset.loc === loc);
  });
  goStep(3);
}

function skipLocation() {
  selectedLocation = null;
  locationChosen = true;
  document.querySelectorAll("#locationButtons .chip").forEach((b) => {
    b.classList.remove("selected");
  });
  goStep(3);
}

function resetAll() {
  selectedWorkout = null;
  selectedLocation = null;
  locationChosen = false;
  furthest = 1;
  prefilledGroups = {};
  document.querySelectorAll(".chip").forEach((b) => b.classList.remove("selected"));
  document.querySelectorAll(".form input").forEach((el) => (el.value = ""));
  $("titleOutput").value = "";
  goStep(1);
}

/* ===== コピー ===== */

function copyTitle() {
  const text = $("titleOutput").value.trim();
  if (!text) return;
  const done = () => {
    const msg = $("copyMsg");
    msg.textContent = "Copied";
    msg.classList.add("show");
    setTimeout(() => msg.classList.remove("show"), 1200);
    addHistory(text);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) { /* noop */ }
  document.body.removeChild(ta);
  done();
}

/* ===== 状態の取得/復元（テンプレート） ===== */

function getState() {
  if (!selectedWorkout) return null;
  return {
    workoutId: selectedWorkout.id,
    location: selectedLocation,
    title: $("titleOutput").value,
    workoutInput: val("workoutInput"),
  };
}

function applyState(state) {
  const w = WORKOUTS.find((x) => x.id === state.workoutId);
  if (!w) return;

  selectedWorkout = w;
  document.querySelectorAll("#workoutButtons .chip").forEach((b) => {
    b.classList.toggle("selected", b.dataset.id === w.id);
  });

  selectedLocation = state.location || null;
  locationChosen = true;
  document.querySelectorAll("#locationButtons .chip").forEach((b) => {
    b.classList.toggle("selected", b.dataset.loc === selectedLocation);
  });

  const isCustom = w.group === "custom";
  $("form-unified").hidden = isCustom;
  $("form-custom").hidden = !isCustom;

  prefilledGroups[w.group] = true; // テンプレ値を Garmin で上書きしない
  $("workoutInput").value = state.workoutInput || "";
  if (isCustom) $("titleOutput").value = state.title || "";

  furthest = 4;
  goStep(4);
}

/* ===== テンプレート ===== */

function loadTemplates() {
  chrome.storage.local.get([STORE_TEMPLATES], (res) => {
    renderTemplates(res[STORE_TEMPLATES] || []);
  });
}

function saveTemplate() {
  const state = getState();
  if (!state) { alert("先に種目を選択してください。"); return; }
  const name = val("templateName") || $("titleOutput").value.trim() || "Untitled";
  chrome.storage.local.get([STORE_TEMPLATES], (res) => {
    const list = res[STORE_TEMPLATES] || [];
    list.unshift({ id: Date.now(), name: name, state: state });
    chrome.storage.local.set({ [STORE_TEMPLATES]: list }, () => {
      $("templateName").value = "";
      renderTemplates(list);
    });
  });
}

function deleteTemplate(id) {
  chrome.storage.local.get([STORE_TEMPLATES], (res) => {
    const list = (res[STORE_TEMPLATES] || []).filter((t) => t.id !== id);
    chrome.storage.local.set({ [STORE_TEMPLATES]: list }, () => renderTemplates(list));
  });
}

function renderTemplates(list) {
  const wrap = $("templateList");
  wrap.innerHTML = "";
  if (!list.length) {
    wrap.innerHTML = '<div class="list-empty">テンプレートはまだありません。</div>';
    return;
  }
  list.forEach((t) => {
    const item = document.createElement("div");
    item.className = "list-item";

    const text = document.createElement("div");
    text.className = "item-text";
    text.textContent = t.name;
    text.title = "クリックで復元";
    text.addEventListener("click", () => applyState(t.state));

    const del = document.createElement("button");
    del.className = "del-btn";
    del.textContent = "×";
    del.title = "削除";
    del.addEventListener("click", () => deleteTemplate(t.id));

    item.appendChild(text);
    item.appendChild(del);
    wrap.appendChild(item);
  });
}

/* ===== 履歴 ===== */

function loadHistory() {
  chrome.storage.local.get([STORE_HISTORY], (res) => {
    renderHistory(res[STORE_HISTORY] || []);
  });
}

function addHistory(title) {
  chrome.storage.local.get([STORE_HISTORY], (res) => {
    let list = res[STORE_HISTORY] || [];
    list = list.filter((h) => h !== title);
    list.unshift(title);
    if (list.length > HISTORY_MAX) list = list.slice(0, HISTORY_MAX);
    chrome.storage.local.set({ [STORE_HISTORY]: list }, () => renderHistory(list));
  });
}

function clearHistory() {
  chrome.storage.local.set({ [STORE_HISTORY]: [] }, () => renderHistory([]));
}

function renderHistory(list) {
  const wrap = $("historyList");
  wrap.innerHTML = "";
  if (!list.length) {
    wrap.innerHTML = '<div class="list-empty">履歴はまだありません。</div>';
    return;
  }
  list.forEach((title) => {
    const item = document.createElement("div");
    item.className = "list-item";

    const text = document.createElement("div");
    text.className = "item-text";
    text.textContent = title;
    text.title = "クリックでタイトル欄へ復元";
    text.addEventListener("click", () => {
      $("titleOutput").value = title;
      furthest = 4;
      goStep(4);
    });

    item.appendChild(text);
    wrap.appendChild(item);
  });
}

/* ===== 初期化 ===== */

document.addEventListener("DOMContentLoaded", () => {
  buildWorkoutButtons();
  buildLocationButtons();

  // フォーム入力 → タイトル再生成
  document.querySelectorAll(".form input, .form select").forEach((el) => {
    el.addEventListener("input", refreshTitle);
    el.addEventListener("change", refreshTitle);
  });

  // ステップ pill ナビゲーション
  document.querySelectorAll(".step").forEach((el) => {
    el.addEventListener("click", () => {
      const s = Number(el.dataset.step);
      if (s <= furthest) goStep(s);
    });
  });

  // パネル内の戻る/進むボタン
  document.querySelectorAll("[data-go]").forEach((el) => {
    el.addEventListener("click", () => goStep(Number(el.dataset.go)));
  });
  $("skipLocationBtn").addEventListener("click", skipLocation);
  $("toTitleBtn").addEventListener("click", () => goStep(4));
  $("resetBtn").addEventListener("click", resetAll);

  // アコーディオン
  document.querySelectorAll(".acc-head").forEach((el) => {
    el.addEventListener("click", () => {
      const body = $(el.dataset.acc);
      body.hidden = !body.hidden;
      el.querySelector(".chev").textContent = body.hidden ? "+" : "−";
    });
  });

  $("copyBtn").addEventListener("click", copyTitle);
  $("saveTemplateBtn").addEventListener("click", saveTemplate);
  $("clearHistoryBtn").addEventListener("click", clearHistory);

  loadTemplates();
  loadHistory();
  loadGarmin();
  updateSteps();
});
