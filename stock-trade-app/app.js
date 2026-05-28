const STORAGE_KEY = "stock-trade-app:v2";
const OLD_STORAGE_KEY = "stock-trade-app:v1";
const FIFTY_THOUSAND = 50000;
const LOT_SHARES = 100;
const PAGE_SIZE = 10;
const API_ORIGIN = "http://127.0.0.1:5175";
const DEFAULT_WATCH = {
  symbol: "4927.T",
  companyName: "ポーラ・オルビス",
  rangeLow: 120000,
  rangeHigh: 140000,
  currentLotPrice: "",
  trend: "falling",
  holdingShares: false,
  nearLowerCheck: false,
  reboundCheck: false,
  reportCheck: false,
  annualDividendPerShare: "",
  benefitUnitCheck: false,
  benefitContentCheck: false,
  benefitMemo: "化粧品、食料品など",
};
const DEFAULT_COMPANY_PRESETS = [
  { symbol: "4927.T", companyName: "ポーラ・オルビス", label: "ポーラ" },
  { symbol: "7203.T", companyName: "トヨタ自動車", label: "トヨタ" },
  { symbol: "6758.T", companyName: "ソニーグループ", label: "ソニーG" },
  { symbol: "7974.T", companyName: "任天堂", label: "任天堂" },
];

const els = {};
let state = loadState();
let marketState = {
  prices: [],
  intraday: [],
  meta: null,
  rsi: null,
  news: [],
};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  renderAll();
  refreshExternalData();
  window.setInterval(refreshExternalData, 60000);
});

function cacheElements() {
  [
    "headerProfit",
    "headerCount",
    "targetProfit",
    "tenRowProjection",
    "rowsToFifty",
    "averageProfit",
    "rangeLow",
    "rangeHigh",
    "currentLotPrice",
    "watchTitle",
    "symbolInput",
    "companyNameInput",
    "companyPresetMenu",
    "companyPresetList",
    "addCompanyPresetButton",
    "rangeMeterFill",
    "rangeLowLabel",
    "rangePositionLabel",
    "rangeHighLabel",
    "strategySignal",
    "marketUpdated",
    "refreshMarketButton",
    "rsiValue",
    "rsiSignal",
    "rsiPin",
    "holdingShares",
    "nearLowerCheck",
    "reboundCheck",
    "reportCheck",
    "annualDividendPerShare",
    "dividendYield",
    "yieldStatus",
    "benefitUnitCheck",
    "benefitContentCheck",
    "benefitMemo",
    "chartRange",
    "chartStatus",
    "marketChart",
    "markerList",
    "refreshNewsButton",
    "newsUpdated",
    "newsList",
    "addRowButton",
    "addTenButton",
    "fillTargetButton",
    "resetButton",
    "prevPageButton",
    "nextPageButton",
    "openTradesOnlyButton",
    "pageStatus",
    "tradeList",
    "tradeRowTemplate",
    "profitChart",
    "profitScale",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  els.targetProfit.addEventListener("input", () => {
    state.targetProfit = parseMoney(els.targetProfit.value) || 0;
    saveState();
    renderSummary();
    renderTradeRowsStateOnly();
    renderProfitChart();
  });

  els.targetProfit.addEventListener("blur", () => {
    els.targetProfit.value = state.targetProfit ? formatPlain(state.targetProfit) : "";
  });

  document.querySelectorAll("[data-target-value]").forEach((button) => {
    button.addEventListener("click", () => {
      state.targetProfit = Number(button.dataset.targetValue);
      saveState();
      renderAll();
    });
  });

  ["rangeLow", "rangeHigh", "currentLotPrice"].forEach((id) => {
    els[id].addEventListener("input", () => {
      state.watch[id] = els[id].value.trim() === "" ? "" : parseMoney(els[id].value);
      saveState();
      renderWatch();
    });
    els[id].addEventListener("blur", () => {
      els[id].value = state.watch[id] === "" ? "" : formatPlain(state.watch[id]);
    });
  });

  els.annualDividendPerShare.addEventListener("input", () => {
    state.watch.annualDividendPerShare = parseDecimal(els.annualDividendPerShare.value);
    saveState();
    renderWatch();
  });

  els.annualDividendPerShare.addEventListener("blur", () => {
    els.annualDividendPerShare.value = state.watch.annualDividendPerShare === "" ? "" : formatDecimal(state.watch.annualDividendPerShare);
  });

  ["symbolInput", "companyNameInput"].forEach((id) => {
    els[id].addEventListener("change", () => {
      if (id === "symbolInput") {
        state.watch.symbol = cleanSymbol(els[id].value);
      } else {
        state.watch.companyName = els[id].value.trim() || state.watch.symbol;
      }
      saveState();
      renderWatch();
      refreshExternalData();
    });
    els[id].addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        els[id].blur();
      }
    });
  });

  els.companyNameInput.addEventListener("focus", openCompanyMenu);
  els.companyNameInput.addEventListener("click", openCompanyMenu);
  els.companyPresetList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-symbol-preset]");
    if (!button) return;
    selectCompanyPreset(button.dataset.symbolPreset, button.dataset.companyPreset);
  });
  els.addCompanyPresetButton.addEventListener("click", addCurrentCompanyPreset);
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".company-field")) closeCompanyMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCompanyMenu();
  });

  els.benefitMemo.addEventListener("input", () => {
    state.watch.benefitMemo = els.benefitMemo.value;
    saveState();
  });

  [
    "holdingShares",
    "nearLowerCheck",
    "reboundCheck",
    "reportCheck",
    "benefitUnitCheck",
    "benefitContentCheck",
  ].forEach((id) => {
    els[id].addEventListener("change", () => {
      state.watch[id] = els[id].checked;
      saveState();
      renderWatch();
    });
  });

  document.querySelectorAll("[data-trend]").forEach((button) => {
    button.addEventListener("click", () => {
      state.watch.trend = button.dataset.trend;
      if (state.watch.trend === "rebound") state.watch.reboundCheck = true;
      saveState();
      renderWatch();
    });
  });

  els.refreshMarketButton.addEventListener("click", refreshExternalData);
  els.refreshNewsButton.addEventListener("click", refreshNews);
  els.chartRange.addEventListener("change", () => {
    state.chartRange = els.chartRange.value;
    normalizeChartSelection();
    saveState();
    renderChartControls();
    refreshMarket();
  });
  document.querySelectorAll("[data-chart-interval]").forEach((button) => {
    button.addEventListener("click", () => {
      state.chartInterval = button.dataset.chartInterval;
      normalizeChartSelection();
      saveState();
      renderChartControls();
      refreshMarket();
    });
  });

  els.addRowButton.addEventListener("click", () => addRows(1));
  els.addTenButton.addEventListener("click", () => addRows(10));
  els.fillTargetButton.addEventListener("click", fillTargetSellPrices);
  els.resetButton.addEventListener("click", resetTrades);
  els.prevPageButton.addEventListener("click", () => changeTradePage(-1));
  els.nextPageButton.addEventListener("click", () => changeTradePage(1));
  els.openTradesOnlyButton.addEventListener("click", () => {
    state.tradeView = state.tradeView === "open" ? "all" : "open";
    state.tradePage = 0;
    saveState();
    renderTradeList();
  });

  els.tradeList.addEventListener("input", handleTradeInput);
  els.tradeList.addEventListener("change", handleTradeInput);
  els.tradeList.addEventListener("focus", handleTradeFocus, true);
  els.tradeList.addEventListener("blur", handleTradeBlur, true);
  els.tradeList.addEventListener("click", handleRowAction);
  window.addEventListener("resize", () => {
    renderMarketChart();
    renderProfitChart();
  });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    const trades = Array.isArray(parsed.trades) ? parsed.trades : [];
    return {
      targetProfit: Number(parsed.targetProfit) || 5000,
      chartRange: parsed.chartRange || "6mo",
      chartInterval: normalizeChartInterval(parsed.chartInterval),
      tradePage: Number.isInteger(parsed.tradePage) ? parsed.tradePage : 0,
      tradeView: parsed.tradeView === "open" ? "open" : "all",
      watch: normalizeWatch(parsed.watch),
      companyPresets: normalizeCompanyPresets(parsed.companyPresets),
      seenNews: Array.isArray(parsed.seenNews) ? parsed.seenNews : [],
      trades: trades.length ? trades.map(normalizeTrade) : createDefaultTrades(10),
    };
  } catch {
    return createDefaultState();
  }
}

function createDefaultState() {
  return {
    targetProfit: 5000,
    chartRange: "6mo",
    chartInterval: "1d",
    tradePage: 0,
    tradeView: "all",
    watch: normalizeWatch(),
    companyPresets: normalizeCompanyPresets(),
    seenNews: [],
    trades: createDefaultTrades(10),
  };
}

function normalizeWatch(watch = {}) {
  return {
    ...DEFAULT_WATCH,
    ...watch,
    symbol: cleanSymbol(watch.symbol || DEFAULT_WATCH.symbol),
    companyName: String(watch.companyName || DEFAULT_WATCH.companyName),
    rangeLow: normalizeMoneyValue(watch.rangeLow ?? DEFAULT_WATCH.rangeLow),
    rangeHigh: normalizeMoneyValue(watch.rangeHigh ?? DEFAULT_WATCH.rangeHigh),
    currentLotPrice: normalizeMoneyValue(watch.currentLotPrice ?? DEFAULT_WATCH.currentLotPrice),
    annualDividendPerShare: normalizeDecimalValue(watch.annualDividendPerShare ?? DEFAULT_WATCH.annualDividendPerShare),
    trend: ["falling", "rebound", "rising"].includes(watch.trend) ? watch.trend : DEFAULT_WATCH.trend,
  };
}

function normalizeCompanyPresets(presets = []) {
  const merged = [...DEFAULT_COMPANY_PRESETS, ...(Array.isArray(presets) ? presets : [])];
  const seen = new Set();
  return merged.reduce((items, item) => {
    const symbol = cleanSymbol(item?.symbol);
    if (seen.has(symbol)) return items;
    seen.add(symbol);
    const companyName = String(item?.companyName || item?.label || symbol).trim() || symbol;
    items.push({
      symbol,
      companyName,
      label: String(item?.label || companyName.replace(/(株式会社|グループ|自動車)$/g, "")).trim() || symbol,
    });
    return items;
  }, []);
}

function normalizeChartInterval(interval) {
  return ["1d", "1m", "5m"].includes(interval) ? interval : "1d";
}

function normalizeChartSelection() {
  state.chartInterval = normalizeChartInterval(state.chartInterval);
  if (state.chartInterval === "1m") state.chartRange = "1d";
  if (state.chartInterval === "5m" && !["1d", "5d", "1mo"].includes(state.chartRange)) {
    state.chartRange = "5d";
  }
  if (!["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y"].includes(state.chartRange)) {
    state.chartRange = "6mo";
  }
}

function createDefaultTrades(count) {
  return Array.from({ length: count }, () => createBlankTrade());
}

function createBlankTrade() {
  return {
    id: makeId(),
    buyDate: offsetDate(today(), -3),
    sellDate: today(),
    buyPrice: "",
    sellPrice: "",
  };
}

function normalizeTrade(trade) {
  const buyDate = trade.buyDate || monthToTradeDate(trade.buyMonth) || offsetDate(today(), -3);
  const sellDate = trade.sellDate || monthToTradeDate(trade.sellMonth) || today();
  return {
    id: trade.id || makeId(),
    buyDate: isTradeDate(buyDate) ? buyDate : offsetDate(today(), -3),
    sellDate: isTradeDate(sellDate) ? sellDate : today(),
    buyPrice: normalizeMoneyValue(trade.buyPrice),
    sellPrice: normalizeMoneyValue(trade.sellPrice),
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function renderAll() {
  normalizeChartSelection();
  els.targetProfit.value = state.targetProfit ? formatPlain(state.targetProfit) : "";
  renderCompanyPresets();
  renderChartControls();
  renderWatch();
  renderTradeList();
  renderSummary();
  renderMarketChart();
  renderProfitChart();
  renderNews();
}

function renderWatch() {
  const watch = state.watch;
  els.watchTitle.textContent = `${watch.companyName || watch.symbol} 監視`;
  setInputIfIdle("rangeLow", watch.rangeLow === "" ? "" : formatPlain(watch.rangeLow));
  setInputIfIdle("rangeHigh", watch.rangeHigh === "" ? "" : formatPlain(watch.rangeHigh));
  setInputIfIdle("currentLotPrice", watch.currentLotPrice === "" ? "" : formatPlain(watch.currentLotPrice));
  setInputIfIdle("symbolInput", watch.symbol || DEFAULT_WATCH.symbol);
  setInputIfIdle("companyNameInput", watch.companyName || "");
  setInputIfIdle("annualDividendPerShare", watch.annualDividendPerShare === "" ? "" : formatDecimal(watch.annualDividendPerShare));
  setInputIfIdle("benefitMemo", watch.benefitMemo || "");

  [
    "holdingShares",
    "nearLowerCheck",
    "reboundCheck",
    "reportCheck",
    "benefitUnitCheck",
    "benefitContentCheck",
  ].forEach((id) => {
    els[id].checked = Boolean(watch[id]);
  });

  document.querySelectorAll("[data-trend]").forEach((button) => {
    button.classList.toggle("active", button.dataset.trend === watch.trend);
  });

  document.querySelectorAll("[data-symbol-preset]").forEach((button) => {
    button.classList.toggle("active", cleanSymbol(button.dataset.symbolPreset) === watch.symbol);
  });

  const low = isFiniteNumber(watch.rangeLow) ? watch.rangeLow : 0;
  const high = isFiniteNumber(watch.rangeHigh) ? watch.rangeHigh : 0;
  const current = isFiniteNumber(watch.currentLotPrice) ? watch.currentLotPrice : null;
  const range = Math.max(1, high - low);
  const pct = current === null ? 0 : clamp((current - low) / range * 100, 0, 100);

  els.rangeLowLabel.textContent = low ? formatYen(low) : "下限未設定";
  els.rangeHighLabel.textContent = high ? formatYen(high) : "上限未設定";
  els.rangeMeterFill.style.width = `${pct}%`;
  els.rangePositionLabel.textContent = current === null ? "現在値待ち" : getRangePositionLabel(current, low, high);

  const signal = getStrategySignal({ low, high, current, range, watch });
  els.strategySignal.textContent = signal.text;
  els.strategySignal.className = `strategy-signal ${signal.tone}`.trim();

  renderDividendYield(watch, current, low);
}

function setInputIfIdle(id, value) {
  if (document.activeElement !== els[id]) els[id].value = value;
}

function renderCompanyPresets() {
  els.companyPresetList.innerHTML = state.companyPresets.map((item) => `
    <button type="button" data-symbol-preset="${escapeHtml(item.symbol)}" data-company-preset="${escapeHtml(item.companyName)}">
      ${escapeHtml(item.label || item.companyName)}
    </button>
  `).join("");

  document.querySelectorAll("[data-symbol-preset]").forEach((button) => {
    button.classList.toggle("active", cleanSymbol(button.dataset.symbolPreset) === state.watch.symbol);
  });
}

function openCompanyMenu() {
  els.companyPresetMenu.hidden = false;
  els.companyNameInput.setAttribute("aria-expanded", "true");
}

function closeCompanyMenu() {
  els.companyPresetMenu.hidden = true;
  els.companyNameInput.setAttribute("aria-expanded", "false");
}

function selectCompanyPreset(symbol, companyName) {
  state.watch.symbol = cleanSymbol(symbol);
  state.watch.companyName = companyName || state.watch.symbol;
  saveState();
  closeCompanyMenu();
  renderWatch();
  refreshExternalData();
}

function addCurrentCompanyPreset() {
  const symbol = cleanSymbol(els.symbolInput.value || state.watch.symbol);
  const companyName = (els.companyNameInput.value || state.watch.companyName || symbol).trim();
  const label = companyName.replace(/(株式会社|グループ|自動車)$/g, "") || symbol;
  state.watch.symbol = symbol;
  state.watch.companyName = companyName;
  state.companyPresets = normalizeCompanyPresets([
    { symbol, companyName, label },
    ...state.companyPresets.filter((item) => cleanSymbol(item.symbol) !== symbol),
  ]);
  saveState();
  renderCompanyPresets();
  renderWatch();
  openCompanyMenu();
  refreshExternalData();
}

function renderChartControls() {
  els.chartRange.value = state.chartRange || "6mo";
  document.querySelectorAll("[data-chart-interval]").forEach((button) => {
    button.classList.toggle("active", button.dataset.chartInterval === state.chartInterval);
  });
}

function renderTradeList() {
  els.tradeList.textContent = "";
  renderTradeViewControls();

  const visibleTrades = getVisibleTrades();
  if (!visibleTrades.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.tradeView === "open" ? "買値があり、売値が空欄の行はありません。" : "行を追加して取引を入力してください。";
    els.tradeList.appendChild(empty);
    renderPageControls();
    return;
  }

  normalizeTradePage();
  const start = state.tradePage * PAGE_SIZE;
  const pageTrades = visibleTrades.slice(start, start + PAGE_SIZE);
  const fragment = document.createDocumentFragment();
  pageTrades.forEach((trade) => {
    fragment.appendChild(createTradeRow(trade));
  });
  fragment.appendChild(createPageTotalRow(pageTrades));
  els.tradeList.appendChild(fragment);
  renderPageControls();
}

function createTradeRow(trade) {
  const fragment = els.tradeRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".trade-row");
  row.dataset.id = trade.id;

  setField(row, "buyDateCode", formatFullDate(trade.buyDate));
  setField(row, "sellDateCode", formatFullDate(trade.sellDate));
  setField(row, "buyPrice", trade.buyPrice === "" ? "" : formatPlain(trade.buyPrice));
  setField(row, "sellPrice", trade.sellPrice === "" ? "" : formatPlain(trade.sellPrice));
  updateRowState(row, trade);

  return row;
}

function setField(row, field, value) {
  const input = row.querySelector(`[data-field="${field}"]`);
  if (input) input.value = value;
}

function createPageTotalRow(pageTrades) {
  const row = document.createElement("div");
  row.className = "trade-total-row";
  row.innerHTML = `
    <div>10行合計</div>
    <div id="pageInputCount">入力済み 0件</div>
    <div>
      <span>差分合計</span>
      <strong id="pageDiffTotal">0円</strong>
    </div>
    <div></div>
  `;
  updatePageTotal(row, pageTrades);
  return row;
}

function renderPageControls() {
  const total = getVisibleTrades().length;
  const pageCount = getPageCount();
  const start = total ? state.tradePage * PAGE_SIZE + 1 : 0;
  const end = Math.min(total, (state.tradePage + 1) * PAGE_SIZE);
  els.pageStatus.textContent = total ? `${start}-${end} / ${total}` : "0 / 0";
  els.prevPageButton.disabled = state.tradePage <= 0;
  els.nextPageButton.disabled = state.tradePage >= pageCount - 1;
}

function updateCurrentPageTotal() {
  const start = state.tradePage * PAGE_SIZE;
  const pageTrades = getVisibleTrades().slice(start, start + PAGE_SIZE);
  updatePageTotal(els.tradeList.querySelector(".trade-total-row"), pageTrades);
}

function updatePageTotal(row, pageTrades) {
  if (!row) return;
  const diffs = pageTrades.map(getDiff).filter((value) => value !== null);
  const total = diffs.reduce((sum, value) => sum + value, 0);
  const totalEl = row.querySelector("#pageDiffTotal");
  const countEl = row.querySelector("#pageInputCount");
  if (totalEl) {
    totalEl.textContent = formatSignedYen(total);
    totalEl.style.color = total < 0 ? "var(--coral)" : "var(--green)";
  }
  if (countEl) countEl.textContent = `入力済み ${diffs.length}件`;
}

function getPageCount() {
  return Math.max(1, Math.ceil(getVisibleTrades().length / PAGE_SIZE));
}

function normalizeTradePage() {
  state.tradePage = clamp(Math.trunc(state.tradePage || 0), 0, getPageCount() - 1);
}

function changeTradePage(delta) {
  state.tradePage += delta;
  normalizeTradePage();
  saveState();
  renderTradeList();
}

function getVisibleTrades() {
  if (state.tradeView === "open") return state.trades.filter(isOpenTrade);
  return state.trades;
}

function isOpenTrade(trade) {
  return isFiniteNumber(trade.buyPrice) && trade.sellPrice === "";
}

function renderTradeViewControls() {
  const open = state.tradeView === "open";
  els.openTradesOnlyButton.classList.toggle("active", open);
  els.openTradesOnlyButton.setAttribute("aria-pressed", String(open));
}

function handleTradeInput(event) {
  const input = event.target.closest("[data-field]");
  if (!input) return;

  const row = event.target.closest(".trade-row");
  const trade = getTradeFromRow(row);
  if (!trade) return;

  const field = input.dataset.field;

  if (field === "buyPrice" || field === "sellPrice") {
    trade[field] = input.value.trim() === "" ? "" : parseMoney(input.value);
  }

  if (field === "buyDateCode" || field === "sellDateCode") {
    input.value = input.value.replace(/\D/g, "").slice(0, 8);
    const date = parseDateCode(input.value);
    if (date) {
      const dateField = field.replace("Code", "");
      trade[dateField] = date;
    }
  }

  saveState();
  updateRowState(row, trade);
  if (state.tradeView === "open" && !isOpenTrade(trade)) {
    normalizeTradePage();
    renderTradeList();
  } else {
    updateCurrentPageTotal();
  }
  renderSummary();
  renderProfitChart();
  renderMarketChart();
}

function handleTradeFocus(event) {
  const input = event.target.closest("[data-field]");
  if (!input) return;

  const row = event.target.closest(".trade-row");
  const trade = getTradeFromRow(row);
  if (!trade) return;

  const field = input.dataset.field;
  if (field === "buyDateCode" || field === "sellDateCode") {
    const dateField = field.replace("Code", "");
    input.value = dateToCode(trade[dateField]);
    input.select();
  }
}

function handleTradeBlur(event) {
  const input = event.target.closest("[data-field]");
  if (!input) return;

  const row = event.target.closest(".trade-row");
  const trade = getTradeFromRow(row);
  if (!trade) return;

  const field = input.dataset.field;
  if (field === "buyPrice" || field === "sellPrice") {
    input.value = trade[field] === "" ? "" : formatPlain(trade[field]);
  }

  if (field === "buyDateCode" || field === "sellDateCode") {
    const dateField = field.replace("Code", "");
    const date = parseDateCode(input.value);
    if (date) {
      trade[dateField] = date;
      saveState();
    }
    input.value = formatFullDate(trade[dateField]);
    renderMarketChart();
    renderProfitChart();
  }
}

function handleRowAction(event) {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const row = button.closest(".trade-row");
  const trade = getTradeFromRow(row);
  if (!trade) return;

  if (button.dataset.action === "delete") {
    state.trades = state.trades.filter((item) => item.id !== trade.id);
    normalizeTradePage();
    saveState();
    renderAll();
  }

  if (button.dataset.action === "apply-target" && isFiniteNumber(trade.buyPrice)) {
    trade.sellPrice = trade.buyPrice + state.targetProfit;
    saveState();
    renderAll();
  }
}

function addRows(count) {
  state.trades.push(...createDefaultTrades(count));
  state.tradePage = getPageCount() - 1;
  saveState();
  renderAll();
}

function fillTargetSellPrices() {
  state.trades.forEach((trade) => {
    if (isFiniteNumber(trade.buyPrice) && trade.sellPrice === "") {
      trade.sellPrice = trade.buyPrice + state.targetProfit;
    }
  });
  saveState();
  renderAll();
}

function resetTrades() {
  if (!window.confirm("入力済みの取引をすべて削除します。よろしいですか？")) return;
  state.trades = createDefaultTrades(10);
  state.tradePage = 0;
  saveState();
  renderAll();
}

function renderTradeRowsStateOnly() {
  els.tradeList.querySelectorAll(".trade-row").forEach((row) => {
    const trade = getTradeFromRow(row);
    if (trade) updateRowState(row, trade);
  });
}

function updateRowState(row, trade) {
  const diff = getDiff(trade);
  const diffEl = row.querySelector('[data-role="diff"]');
  const gapEl = row.querySelector('[data-role="targetGap"]');

  row.classList.remove("profit", "loss", "target-hit");

  if (diff === null) {
    diffEl.textContent = "未入力";
    gapEl.textContent = `目標差益 ${formatYen(state.targetProfit)}`;
    return;
  }

  diffEl.textContent = formatSignedYen(diff);
  if (diff >= 0) row.classList.add("profit");
  if (diff < 0) row.classList.add("loss");
  if (diff >= state.targetProfit) row.classList.add("target-hit");

  const gap = state.targetProfit - diff;
  gapEl.textContent = gap <= 0 ? `目標超過 ${formatYen(Math.abs(gap))}` : `目標まで ${formatYen(gap)}`;
}

function renderSummary() {
  const diffs = state.trades.map(getDiff).filter((value) => value !== null);
  const total = diffs.reduce((sum, value) => sum + value, 0);
  const average = diffs.length ? Math.round(total / diffs.length) : 0;
  const target = Math.max(0, state.targetProfit || 0);
  const rows = target ? Math.ceil(FIFTY_THOUSAND / target) : 0;

  els.headerProfit.textContent = formatSignedYen(total);
  els.headerProfit.style.color = total < 0 ? "var(--coral)" : "var(--green)";
  els.headerCount.textContent = `${diffs.length}件`;
  els.tenRowProjection.textContent = formatYen(target * 10);
  els.rowsToFifty.textContent = target ? `${rows}行` : "未設定";
  els.averageProfit.textContent = formatSignedYen(average);
}

async function refreshExternalData() {
  await Promise.all([refreshMarket(), refreshNews()]);
}

async function refreshMarket() {
  try {
    els.chartStatus.textContent = "取得中";
    normalizeChartSelection();
    renderChartControls();
    const chartParams = getChartRequestParams();
    const rsiParams = getRsiRequestParams();
    const chartUrl = buildMarketUrl(chartParams);
    const rsiUrl = buildMarketUrl(rsiParams);
    const chartData = await fetchJson(chartUrl);
    const rsiData = chartUrl === rsiUrl ? chartData : await fetchJson(rsiUrl);

    marketState.prices = chartData.prices || [];
    marketState.intraday = rsiData.prices || [];
    marketState.meta = chartData.meta || rsiData.meta || null;
    marketState.rsi = calculateRsi(marketState.intraday.map((point) => point.close), 14);

    const latestPrice = marketState.meta?.regularMarketPrice;
    if (Number.isFinite(latestPrice)) {
      state.watch.currentLotPrice = Math.round(latestPrice * LOT_SHARES);
      saveState();
    }

    const updated = marketState.meta?.regularMarketTime ? formatDateTime(marketState.meta.regularMarketTime * 1000) : formatDateTime(Date.now());
    els.marketUpdated.textContent = `${state.watch.symbol} / ${updated}`;
    els.chartStatus.textContent = `${chartData.source || "Yahoo Finance"} / ${getChartModeLabel()}`;
    renderWatch();
    renderRsi();
    renderMarketChart();
  } catch (error) {
    els.chartStatus.textContent = "取得できません";
    els.marketUpdated.textContent = "ローカルサーバーで起動してください";
    renderRsi();
  }
}

function getChartRequestParams() {
  return {
    range: state.chartRange || "6mo",
    interval: state.chartInterval || "1d",
  };
}

function getRsiRequestParams() {
  return {
    range: state.chartInterval === "1m" ? "1d" : "5d",
    interval: state.chartInterval === "1m" ? "1m" : "5m",
  };
}

function buildMarketUrl({ range, interval }) {
  return `/api/market?symbol=${encodeURIComponent(state.watch.symbol)}&range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`;
}

function getChartModeLabel() {
  const intervalLabel = {
    "1d": "日毎",
    "1m": "1分毎",
    "5m": "5分毎",
  }[state.chartInterval] || "日毎";
  return `${intervalLabel} / ${formatRangeName(state.chartRange)}`;
}

async function refreshNews() {
  try {
    els.newsUpdated.textContent = "取得中";
    const params = new URLSearchParams({
      symbol: state.watch.symbol,
      company: state.watch.companyName || state.watch.symbol,
    });
    const data = await fetchJson(`/api/news?${params.toString()}`);
    marketState.news = data.items || [];
    els.newsUpdated.textContent = data.updatedAt ? formatDateTime(data.updatedAt) : formatDateTime(Date.now());
    renderNews();
  } catch {
    els.newsUpdated.textContent = "取得できません";
    marketState.news = [];
    renderNews();
  }
}

async function fetchJson(url) {
  const candidates = [url];
  if (window.location.origin !== API_ORIGIN) candidates.push(`${API_ORIGIN}${url}`);

  let lastError = null;
  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Fetch failed");
}

function renderRsi() {
  const card = els.rsiValue.closest(".rsi-card");
  card.classList.remove("buy", "sell");

  if (!Number.isFinite(marketState.rsi)) {
    els.rsiValue.textContent = "--%";
    els.rsiSignal.textContent = "取得待ち";
    els.rsiPin.style.left = "0%";
    return;
  }

  const rsi = clamp(marketState.rsi, 0, 100);
  els.rsiValue.textContent = `${rsi.toFixed(1)}%`;
  els.rsiPin.style.left = `${rsi}%`;

  if (rsi <= 20) {
    card.classList.add("buy");
    els.rsiSignal.textContent = "買い目安";
  } else if (rsi >= 80) {
    card.classList.add("sell");
    els.rsiSignal.textContent = "売り目安";
  } else {
    els.rsiSignal.textContent = "待ち";
  }
}

function renderMarketChart() {
  const canvas = els.marketChart;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.round(rect.width));
  const height = Math.max(300, Math.round(rect.height));
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  drawChartFrame(ctx, width, height);

  const points = marketState.prices.filter((point) => Number.isFinite(point.close));
  if (!points.length) {
    drawEmptyText(ctx, width, height, "値動きデータを取得中");
    renderMarkerList([]);
    return;
  }

  const plot = createPlot(points, width, height, { top: 30, right: 18, bottom: 54, left: 70 });
  const low = state.watch.rangeLow || 0;
  const high = state.watch.rangeHigh || 0;
  const yValues = points.map((point) => point.close * LOT_SHARES);
  if (low) yValues.push(low);
  if (high) yValues.push(high);
  state.trades.forEach((trade) => {
    if (isFiniteNumber(trade.buyPrice)) yValues.push(trade.buyPrice);
    if (isFiniteNumber(trade.sellPrice)) yValues.push(trade.sellPrice);
  });
  plot.setYDomain(Math.min(...yValues) * 0.992, Math.max(...yValues) * 1.008);

  drawGridAndAxes(ctx, plot, points);
  drawHorizontalLine(ctx, plot, low, "#24735f", "下限");
  drawHorizontalLine(ctx, plot, high, "#bd5845", "上限");

  ctx.strokeStyle = "#2d69a8";
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((point, index) => {
    const x = plot.x(index);
    const y = plot.y(point.close * LOT_SHARES);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const markers = buildTradeMarkers(points, plot);
  drawTradeMarkers(ctx, markers);
  renderMarkerList(markers);
}

function createPlot(points, width, height, pad) {
  let yMin = 0;
  let yMax = 1;
  return {
    pad,
    width,
    height,
    chartWidth: width - pad.left - pad.right,
    chartHeight: height - pad.top - pad.bottom,
    setYDomain(min, max) {
      yMin = min;
      yMax = max <= min ? min + 1 : max;
    },
    x(index) {
      return pad.left + (points.length === 1 ? 0 : index / (points.length - 1) * this.chartWidth);
    },
    y(value) {
      return pad.top + (yMax - value) / (yMax - yMin) * this.chartHeight;
    },
    yMin: () => yMin,
    yMax: () => yMax,
  };
}

function drawGridAndAxes(ctx, plot, points) {
  const left = plot.pad.left;
  const right = plot.width - plot.pad.right;
  const top = plot.pad.top;
  const bottom = plot.height - plot.pad.bottom;
  const yTicks = buildValueTicks(plot.yMin(), plot.yMax(), 5);
  const xTicks = buildIndexTicks(points.length, 5);

  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(102, 115, 110, 0.16)";
  ctx.fillStyle = "#66736e";
  ctx.font = "11px Segoe UI, sans-serif";
  ctx.textBaseline = "middle";

  yTicks.forEach((value) => {
    const y = plot.y(value);
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    ctx.textAlign = "right";
    ctx.fillText(formatAxisYen(value), left - 8, y);
  });

  xTicks.forEach((index) => {
    const x = plot.x(index);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(formatChartTick(points[index]), x, bottom + 8);
    ctx.textBaseline = "middle";
  });

  ctx.strokeStyle = "rgba(102, 115, 110, 0.44)";
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(right, bottom);
  ctx.stroke();

  ctx.fillStyle = "#4e5d58";
  ctx.font = "11px Segoe UI, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("100株価格（円）", left, 16);
  ctx.textAlign = "right";
  ctx.fillText(state.chartInterval === "1d" ? "日付" : "日時", right, plot.height - 7);
  ctx.restore();
}

function formatChartTick(point) {
  if (!point) return "";
  if (state.chartInterval === "1d") return formatShortDate(point.date);
  if (state.chartInterval === "1m") return point.timeLabel || formatShortDate(point.date);
  const day = formatDate(point.date);
  return point.timeLabel ? `${day} ${point.timeLabel}` : day;
}

function buildValueTicks(min, max, count) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || count < 2) return [];
  const span = max - min || 1;
  return Array.from({ length: count }, (_, index) => min + span * index / (count - 1));
}

function buildIndexTicks(length, count) {
  if (length <= 0) return [];
  if (length === 1) return [0];
  const ticks = new Set();
  for (let index = 0; index < count; index += 1) {
    ticks.add(Math.round(index * (length - 1) / (count - 1)));
  }
  return Array.from(ticks).sort((a, b) => a - b);
}

function formatAxisYen(value) {
  const rounded = Math.round(value);
  if (Math.abs(rounded) >= 10000) {
    return `${Number((rounded / 10000).toFixed(1)).toLocaleString("ja-JP")}万円`;
  }
  return formatYen(rounded);
}

function drawHorizontalLine(ctx, plot, value, color, label) {
  if (!value) return;
  const y = plot.y(value);
  ctx.strokeStyle = color;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(plot.pad.left, y);
  ctx.lineTo(plot.width - plot.pad.right, y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = color;
  ctx.font = "12px Segoe UI, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${label} ${formatYen(value)}`, plot.pad.left + 4, Math.max(14, y - 6));
}

function drawAxisLabels(ctx, plot, points) {
  ctx.fillStyle = "#66736e";
  ctx.font = "12px Segoe UI, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(formatYen(Math.round(plot.yMax())), plot.pad.left - 6, plot.pad.top + 4);
  ctx.fillText(formatYen(Math.round(plot.yMin())), plot.pad.left - 6, plot.height - plot.pad.bottom);
  ctx.textAlign = "center";
  const first = points[0]?.date;
  const last = points[points.length - 1]?.date;
  if (first) ctx.fillText(formatShortDate(first), plot.pad.left, plot.height - 16);
  if (last) ctx.fillText(formatShortDate(last), plot.width - plot.pad.right, plot.height - 16);
}

function buildTradeMarkers(points, plot) {
  const markers = [];
  state.trades.forEach((trade, rowIndex) => {
    if (isTradeDate(trade.buyDate) && isFiniteNumber(trade.buyPrice)) {
      markers.push(createMarker(points, plot, trade.buyDate, trade.buyPrice, "buy", rowIndex + 1));
    }
    if (isTradeDate(trade.sellDate) && isFiniteNumber(trade.sellPrice)) {
      markers.push(createMarker(points, plot, trade.sellDate, trade.sellPrice, "sell", rowIndex + 1));
    }
  });
  return markers.filter(Boolean);
}

function createMarker(points, plot, date, price, type, rowNumber) {
  const chartDate = dateForChart(date);
  const nearest = findNearestPoint(points, chartDate);
  if (!nearest) return null;
  return {
    type,
    rowNumber,
    date,
    price,
    actual: Math.round(nearest.point.close * LOT_SHARES),
    x: plot.x(nearest.index),
    y: plot.y(price),
    actualY: plot.y(nearest.point.close * LOT_SHARES),
    actualDate: nearest.point.date,
  };
}

function drawTradeMarkers(ctx, markers) {
  markers.forEach((marker) => {
    ctx.strokeStyle = marker.type === "buy" ? "rgba(36, 115, 95, 0.55)" : "rgba(189, 88, 69, 0.55)";
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(marker.x, marker.actualY);
    ctx.lineTo(marker.x, marker.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = marker.type === "buy" ? "#24735f" : "#bd5845";
    ctx.beginPath();
    if (marker.type === "buy") {
      ctx.moveTo(marker.x, marker.y - 8);
      ctx.lineTo(marker.x - 7, marker.y + 7);
      ctx.lineTo(marker.x + 7, marker.y + 7);
    } else {
      ctx.moveTo(marker.x, marker.y + 8);
      ctx.lineTo(marker.x - 7, marker.y - 7);
      ctx.lineTo(marker.x + 7, marker.y - 7);
    }
    ctx.closePath();
    ctx.fill();
  });
}

function renderMarkerList(markers) {
  if (!markers.length) {
    els.markerList.innerHTML = '<div class="empty-state">売買日と値段を入力するとチャートに重ねます。</div>';
    return;
  }

  els.markerList.innerHTML = markers.slice(-8).map((marker) => {
    const diff = marker.price - marker.actual;
    const label = marker.type === "buy" ? "買" : "売";
    return `
      <div class="marker-item">
        <span class="marker-type ${marker.type}">${label} #${marker.rowNumber}</span>
        <span>${escapeHtml(formatDate(marker.date))} / 実値 ${escapeHtml(formatYen(marker.actual))}</span>
        <strong>${escapeHtml(formatSignedYen(diff))}</strong>
      </div>
    `;
  }).join("");
}

function renderNews() {
  if (!marketState.news.length) {
    els.newsList.innerHTML = '<div class="empty-state">ニュース取得待ち</div>';
    return;
  }

  const now = Date.now();
  els.newsList.innerHTML = marketState.news.slice(0, 8).map((item) => {
    const time = item.pubDate ? new Date(item.pubDate).getTime() : 0;
    const isNew = time && now - time < 1000 * 60 * 60 * 24 * 2;
    const cls = isNew ? "news-item new" : "news-item";
    return `
      <article class="${cls}">
        <a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>
        <div class="news-meta">${escapeHtml(item.source || "News")} / ${escapeHtml(item.pubDate ? formatDateTime(item.pubDate) : "")}</div>
      </article>
    `;
  }).join("");

  state.seenNews = marketState.news.slice(0, 20).map((item) => item.link);
  saveState();
}

function renderProfitChart() {
  const canvas = els.profitChart;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(320, Math.round(rect.width));
  const height = Math.max(220, Math.round(rect.height));
  const dpr = window.devicePixelRatio || 1;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const data = buildMonthlyData();
  drawChartFrame(ctx, width, height);

  if (!data.length) {
    drawEmptyText(ctx, width, height, "売値まで入力すると月別差益が表示されます");
    renderScale([]);
    return;
  }

  const pad = { top: 26, right: 18, bottom: 40, left: 58 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const maxAbs = Math.max(...data.map((item) => Math.abs(item.total)), state.targetProfit, 1);
  const zeroY = pad.top + chartHeight / 2;
  const barGap = 8;
  const barWidth = Math.max(14, (chartWidth - barGap * (data.length - 1)) / data.length);

  ctx.strokeStyle = "#d9e2de";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, zeroY);
  ctx.lineTo(width - pad.right, zeroY);
  ctx.stroke();

  data.forEach((item, index) => {
    const x = pad.left + index * (barWidth + barGap);
    const valueHeight = Math.abs(item.total) / maxAbs * (chartHeight / 2 - 12);
    const y = item.total >= 0 ? zeroY - valueHeight : zeroY;
    ctx.fillStyle = item.total >= 0 ? "#24735f" : "#bd5845";
    roundedRect(ctx, x, y, barWidth, Math.max(3, valueHeight), 5);
    ctx.fill();
    ctx.fillStyle = "#66736e";
    ctx.font = "12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(formatMonthLabel(item.month), x + barWidth / 2, height - 16);
  });

  renderScale(data);
}

function drawChartFrame(ctx, width, height) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#d9e2de";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
}

function drawEmptyText(ctx, width, height, text) {
  ctx.fillStyle = "#66736e";
  ctx.font = "14px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, width / 2, height / 2);
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, Math.abs(height) / 2, width / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function buildMonthlyData() {
  const groups = new Map();
  state.trades.forEach((trade) => {
    const diff = getDiff(trade);
    if (diff === null) return;
    const month = trade.sellDate.slice(0, 7);
    groups.set(month, (groups.get(month) || 0) + diff);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([month, total]) => ({ month, total }));
}

function renderScale(data) {
  if (!data.length) {
    els.profitScale.innerHTML = "";
    return;
  }

  const maxAbs = Math.max(...data.map((item) => Math.abs(item.total)), 1);
  els.profitScale.innerHTML = data.map((item) => {
    const width = Math.round(Math.abs(item.total) / maxAbs * 100);
    const negative = item.total < 0 ? " negative" : "";
    return `
      <div class="scale-row${negative}">
        <span>${escapeHtml(formatMonthLabel(item.month))}</span>
        <div class="scale-bar"><div class="scale-fill" style="width:${width}%"></div></div>
        <strong>${escapeHtml(formatSignedYen(item.total))}</strong>
      </div>
    `;
  }).join("");
}

function getStrategySignal({ low, high, current, range, watch }) {
  if (!low || !high || high <= low) {
    return { text: "下限と上限を設定してください。", tone: "warn" };
  }

  if (current === null) {
    return { text: "現在値を入力すると判定します。", tone: "" };
  }

  const lowerZone = low + range * 0.12;
  const upperZone = high - range * 0.12;

  if (watch.holdingShares && current >= upperZone) {
    return { text: "売り候補: 14万円付近です。", tone: "sell" };
  }

  if (!watch.holdingShares && current > lowerZone && watch.trend === "falling") {
    return { text: "早買い注意: 12万円付近か反転確認まで待つ設定です。", tone: "warn" };
  }

  if (!watch.holdingShares && current <= lowerZone) {
    if (watch.trend === "rebound" && watch.reboundCheck && watch.reportCheck) {
      return { text: "買い候補: 下限圏で反転確認済みです。", tone: "" };
    }
    return { text: "下限圏: 反転と決算内容を確認する位置です。", tone: "warn" };
  }

  if (watch.holdingShares && current >= low + range * 0.65 && watch.trend === "rising") {
    return { text: "売り準備: 上限に近づいています。", tone: "sell" };
  }

  return { text: "待ち: 買いは下限、売りは上限に引きつける設定です。", tone: "" };
}

function getRangePositionLabel(current, low, high) {
  if (!low || !high || high <= low) return "レンジ設定待ち";
  if (current <= low) return "下限以下";
  if (current >= high) return "上限以上";
  const percent = Math.round((current - low) / (high - low) * 100);
  return `レンジ内 ${percent}%`;
}

function renderDividendYield(watch, current, low) {
  const baseLotPrice = current || low;
  const annualDividend = watch.annualDividendPerShare;
  const box = els.dividendYield.closest(".yield-box");
  box.classList.remove("good", "bad");

  if (!isFiniteNumber(baseLotPrice) || !isFiniteNumber(annualDividend) || baseLotPrice <= 0) {
    els.dividendYield.textContent = "未計算";
    els.yieldStatus.textContent = "現在値と年間配当を入力";
    return;
  }

  const yieldPercent = annualDividend * LOT_SHARES / baseLotPrice * 100;
  els.dividendYield.textContent = `${yieldPercent.toFixed(2)}%`;
  if (yieldPercent >= 4) {
    box.classList.add("good");
    els.yieldStatus.textContent = "4%以上";
  } else {
    box.classList.add("bad");
    els.yieldStatus.textContent = "4%未満";
  }
}

function calculateRsi(values, period = 14) {
  const closes = values.filter(Number.isFinite);
  if (closes.length <= period) return null;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i += 1) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < closes.length; i += 1) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function findNearestPoint(points, date) {
  const target = new Date(`${dateForChart(date)}T00:00:00+09:00`).getTime();
  let best = null;
  points.forEach((point, index) => {
    const distance = Math.abs(new Date(`${point.date}T00:00:00+09:00`).getTime() - target);
    if (!best || distance < best.distance) best = { point, index, distance };
  });
  return best;
}

function getTradeFromRow(row) {
  return state.trades.find((trade) => trade.id === row?.dataset.id);
}

function getDiff(trade) {
  if (!isFiniteNumber(trade.buyPrice) || !isFiniteNumber(trade.sellPrice)) return null;
  return trade.sellPrice - trade.buyPrice;
}

function parseMoney(value) {
  const normalized = String(value).replace(/[^\d.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

function normalizeMoneyValue(value) {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : "";
}

function parseDecimal(value) {
  const normalized = String(value).replace(/[^\d.]/g, "");
  if (normalized === "") return "";
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : "";
}

function normalizeDecimalValue(value) {
  if (value === "" || value === null || value === undefined) return "";
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : "";
}

function formatPlain(value) {
  return Number(value).toLocaleString("ja-JP");
}

function formatDecimal(value) {
  return Number(value).toLocaleString("ja-JP", { maximumFractionDigits: 2 });
}

function formatYen(value) {
  return `${formatPlain(Math.round(value))}円`;
}

function formatSignedYen(value) {
  const rounded = Math.round(value);
  if (rounded === 0) return "0円";
  return `${rounded > 0 ? "+" : "-"}${formatYen(Math.abs(rounded))}`;
}

function today() {
  const now = new Date();
  return toDateInput(now);
}

function offsetDate(dateText, years) {
  const date = new Date(`${dateText}T00:00:00+09:00`);
  date.setFullYear(date.getFullYear() + years);
  return toDateInput(date);
}

function toDateInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00+09:00`);
  return !Number.isNaN(date.getTime()) && toDateInput(date) === value;
}

function isMonthOnly(value) {
  if (!/^\d{4}-\d{2}$/.test(value)) return false;
  const month = Number(value.slice(5, 7));
  return month >= 1 && month <= 12;
}

function isTradeDate(value) {
  return isDate(value) || isMonthOnly(value);
}

function dateToCode(date) {
  if (isDate(date)) return date.replaceAll("-", "");
  if (isMonthOnly(date)) return `${date.replaceAll("-", "")}00`;
  return "";
}

function parseDateCode(value) {
  const digits = String(value).replace(/\D/g, "");
  if (digits.length === 6) {
    return parsePackedDate(`20${digits}`);
  }
  if (digits.length === 8) {
    return parsePackedDate(digits);
  }
  return "";
}

function parsePackedDate(digits) {
  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6));
  const day = Number(digits.slice(6, 8));
  if (year < 1900 || year > 2200 || month < 1 || month > 12) return "";
  if (day === 0) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}`;
  const date = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  return isDate(date) ? date : "";
}

function monthToTradeDate(month) {
  if (!/^\d{4}-\d{2}$/.test(month || "")) return "";
  return month;
}

function dateForChart(value) {
  if (isDate(value)) return value;
  if (isMonthOnly(value)) return `${value}-01`;
  return today();
}

function formatDate(value) {
  if (isMonthOnly(value)) {
    const [, month] = value.split("-");
    return `${Number(month)}月`;
  }
  if (!isDate(value)) return "";
  const [, month, day] = value.split("-");
  return `${month}/${day}`;
}

function formatFullDate(value) {
  if (isMonthOnly(value)) {
    const [year, month] = value.split("-");
    return `${year}年${Number(month)}月`;
  }
  if (!isDate(value)) return "";
  const [year, month, day] = value.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

function formatShortDate(value) {
  if (isMonthOnly(value)) {
    const [year, month] = value.split("-");
    return `${year.slice(2)}/${month}`;
  }
  if (!isDate(value)) return "";
  const [year, month, day] = value.split("-");
  return `${year.slice(2)}/${month}/${day}`;
}

function formatDateTime(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatMonthLabel(month) {
  if (!/^\d{4}-\d{2}$/.test(month)) return "";
  const [year, rawMonth] = month.split("-");
  return `${year.slice(2)}/${rawMonth}`;
}

function formatRangeName(range) {
  return {
    "1d": "1日",
    "5d": "5日",
    "1mo": "1か月",
    "3mo": "3か月",
    "6mo": "6か月",
    "1y": "1年",
    "2y": "2年",
  }[range] || range;
}

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `trade-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function cleanSymbol(symbol) {
  return String(symbol || "4927.T").replace(/[^A-Z0-9.]/gi, "").toUpperCase() || "4927.T";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
