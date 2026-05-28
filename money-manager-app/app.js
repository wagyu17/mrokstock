const STORAGE_KEY = "money-manager-app:v1";

const DEFAULT_ACCOUNTS = [
  { id: "cash", name: "現金", type: "cash", initialBalance: 0, color: "#23795f" },
  { id: "bank-a", name: "三井住友銀行", type: "bank", initialBalance: 0, color: "#2f6fbc" },
  { id: "bank-b", name: "三菱UFJ銀行", type: "bank", initialBalance: 0, color: "#6b5ca5" },
  { id: "paypay", name: "PayPay", type: "wallet", initialBalance: 0, color: "#c75d49" },
  { id: "mobile-suica", name: "モバイルSuica", type: "wallet", initialBalance: 0, color: "#b77c25" },
];

const LEGACY_ACCOUNT_NAMES = {
  "bank-a": "銀行口座A",
  "bank-b": "銀行口座B",
};

const IMPORT_PRESETS = [
  { match: /transactions_.*\.csv$/i, accountId: "paypay", label: "PayPay" },
  { match: /^meisai.*\.csv$/i, accountId: "bank-a", label: "三井住友銀行" },
  { match: /^\d+_\d+\.csv$/i, accountId: "bank-b", label: "三菱UFJ銀行" },
];

const DEFAULT_CATEGORIES = [
  "陸上競技",
  "食費",
  "お菓子",
  "交際費",
  "マイクラ家庭教師",
  "トモノカイ",
  "支援金",
  "ポイント付与",
  "カフェ",
  "日用品",
  "交通費",
  "住居",
  "水道光熱費",
  "通信費",
  "医療",
  "教育",
  "娯楽",
  "給与",
  "振替",
  "その他",
];

const EXPENSE_CATEGORIES = ["陸上競技", "食費", "お菓子", "交際費"];
const INCOME_CATEGORIES = ["マイクラ家庭教師", "トモノカイ", "支援金", "ポイント付与"];

const DEFAULT_RULES = [
  { id: "rule-1", keyword: "セブン", category: "食費" },
  { id: "rule-2", keyword: "ローソン", category: "食費" },
  { id: "rule-3", keyword: "ファミリーマート", category: "食費" },
  { id: "rule-4", keyword: "スーパー", category: "食費" },
  { id: "rule-5", keyword: "イオン", category: "食費" },
  { id: "rule-5a", keyword: "おかしのまちおか", category: "お菓子" },
  { id: "rule-5b", keyword: "お菓子", category: "お菓子" },
  { id: "rule-6", keyword: "スタバ", category: "カフェ" },
  { id: "rule-7", keyword: "カフェ", category: "カフェ" },
  { id: "rule-8", keyword: "JR", category: "交通費" },
  { id: "rule-9", keyword: "メトロ", category: "交通費" },
  { id: "rule-10", keyword: "バス", category: "交通費" },
  { id: "rule-11", keyword: "SUICA", category: "交通費" },
  { id: "rule-12", keyword: "Amazon", category: "日用品" },
  { id: "rule-13", keyword: "楽天", category: "日用品" },
  { id: "rule-14", keyword: "電気", category: "水道光熱費" },
  { id: "rule-15", keyword: "ガス", category: "水道光熱費" },
  { id: "rule-16", keyword: "水道", category: "水道光熱費" },
  { id: "rule-17", keyword: "docomo", category: "通信費" },
  { id: "rule-18", keyword: "au", category: "通信費" },
  { id: "rule-19", keyword: "SoftBank", category: "通信費" },
  { id: "rule-20", keyword: "給料", category: "給与" },
  { id: "rule-21", keyword: "給与", category: "給与" },
  { id: "rule-22", keyword: "家賃", category: "住居" },
  { id: "rule-23", keyword: "マイクラ", category: "マイクラ家庭教師" },
  { id: "rule-24", keyword: "家庭教師", category: "マイクラ家庭教師" },
  { id: "rule-25", keyword: "トモノカイ", category: "トモノカイ" },
  { id: "rule-26", keyword: "支援金", category: "支援金" },
];

const TYPE_LABELS = {
  expense: "支出",
  income: "収入",
  transfer: "振替",
};

let state = loadState();
let importRows = [];
let importStatementInfo = null;
let openCategoryTxId = "";
let transactionView = "list";

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindEvents();
  hydrateFormOptions();
  renderAll();
});

function cacheElements() {
  [
    "headerTotal",
    "headerNet",
    "totalAssets",
    "monthlyIncome",
    "monthlyExpense",
    "monthlyNet",
    "accountBalances",
    "trendRange",
    "trendCanvas",
    "categoryMonth",
    "categoryBreakdown",
    "recentTransactions",
    "transactionForm",
    "txDate",
    "txType",
    "txAccount",
    "txToAccount",
    "txAmount",
    "txMerchant",
    "txCategory",
    "txMemo",
    "transferTargetWrap",
    "sampleButton",
    "filterMonth",
    "filterAccount",
    "filterSearch",
    "transactionListView",
    "transactionCalendar",
    "transactionTable",
    "csvFile",
    "importAccount",
    "importMode",
    "csvEncoding",
    "importButton",
    "importStatus",
    "importPreview",
    "suicaPdfFile",
    "suicaPdfButton",
    "suicaPdfStatus",
    "accountForm",
    "accountName",
    "accountType",
    "accountBalance",
    "accountSettings",
    "ruleForm",
    "ruleKeyword",
    "ruleCategory",
    "ruleSettings",
    "exportButton",
    "jsonImport",
    "resetButton",
  ].forEach((id) => {
    els[id] = document.getElementById(id);
  });
}

function bindEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });

  els.txDate.value = today();
  els.txType.addEventListener("change", () => {
    updateTransferFields();
    suggestCategory();
  });
  els.txMerchant.addEventListener("input", suggestCategory);
  els.transactionForm.addEventListener("submit", addTransactionFromForm);
  els.sampleButton.addEventListener("click", addSampleTransactions);

  [els.filterMonth, els.filterAccount, els.filterSearch].forEach((control) => {
    control.addEventListener("input", renderTransactions);
  });
  document.querySelectorAll("[data-transaction-view]").forEach((button) => {
    button.addEventListener("click", () => {
      transactionView = button.dataset.transactionView;
      renderTransactions();
    });
  });

  els.trendRange.addEventListener("change", renderTrend);
  els.categoryMonth.addEventListener("change", renderCategoryBreakdown);

  els.csvFile.addEventListener("change", readCsvFile);
  els.importAccount.addEventListener("change", reprocessImportRows);
  els.importMode.addEventListener("change", reprocessImportRows);
  els.csvEncoding.addEventListener("change", reprocessImportRows);
  els.importButton.addEventListener("click", commitImportRows);
  els.suicaPdfFile.addEventListener("change", () => {
    els.suicaPdfButton.disabled = !els.suicaPdfFile.files?.[0];
  });
  els.suicaPdfButton.addEventListener("click", importSuicaPdf);

  els.accountForm.addEventListener("submit", addAccount);
  els.ruleForm.addEventListener("submit", addRule);
  els.exportButton.addEventListener("click", exportJson);
  els.jsonImport.addEventListener("change", importJson);
  els.resetButton.addEventListener("click", resetData);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    return migrateState({
      version: 1,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : DEFAULT_ACCOUNTS,
      categories: Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES,
      rules: Array.isArray(parsed.rules) ? parsed.rules : DEFAULT_RULES,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
    });
  } catch {
    return createDefaultState();
  }
}

function createDefaultState() {
  return migrateState({
    version: 1,
    accounts: structuredClone(DEFAULT_ACCOUNTS),
    categories: [...DEFAULT_CATEGORIES],
    rules: structuredClone(DEFAULT_RULES),
    transactions: [],
  });
}

function migrateState(nextState) {
  nextState.categories = uniqueValues([...(nextState.categories || []), ...DEFAULT_CATEGORIES]);
  const existingRuleIds = new Set((nextState.rules || []).map((rule) => rule.id));
  nextState.rules = [...(nextState.rules || []), ...DEFAULT_RULES.filter((rule) => !existingRuleIds.has(rule.id))];
  nextState.accounts = nextState.accounts.map((account) => {
    const defaultAccount = DEFAULT_ACCOUNTS.find((item) => item.id === account.id);
    const legacyName = LEGACY_ACCOUNT_NAMES[account.id];
    if (defaultAccount && legacyName && account.name === legacyName) {
      return { ...account, name: defaultAccount.name };
    }
    return account;
  });
  nextState.transactions = nextState.transactions.map((tx) => applyAutomaticTransactionRules(migrateTransactionCategories(tx)));
  return nextState;
}

function migrateTransactionCategories(tx) {
  const categories = normalizeCategoryValues(tx.categories || tx.category, tx.type, `${tx.merchant || ""} ${tx.memo || ""}`);
  return {
    ...tx,
    categories,
    category: categories[0] || fallbackCategory(tx.type),
  };
}

function normalizeCategoryValues(value, type = "expense", text = "") {
  if (type === "transfer") return ["振替"];
  const raw = Array.isArray(value) ? value : String(value || "").split(/[、,/]/);
  const categories = uniqueValues(raw.map((item) => String(item || "").trim()).filter(Boolean));
  if (categories.length) return categories;
  return [fallbackCategory(type)];
}

function uniqueValues(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = String(value || "").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrateFormOptions() {
  fillAccountSelect(els.txAccount);
  fillAccountSelect(els.txToAccount);
  fillAccountSelect(els.importAccount);
  fillAccountFilter();
  fillCategorySelect(els.txCategory);
  fillCategorySelect(els.ruleCategory);
  updateMonthFilters();
  updateTransferFields();
}

function fillAccountSelect(select) {
  const current = select.value;
  select.innerHTML = state.accounts
    .map((account) => `<option value="${escapeHtml(account.id)}">${escapeHtml(account.name)}</option>`)
    .join("");
  if (state.accounts.some((account) => account.id === current)) select.value = current;
}

function fillAccountFilter() {
  const current = els.filterAccount.value;
  els.filterAccount.innerHTML = `<option value="all">すべての口座</option>${state.accounts
    .map((account) => `<option value="${escapeHtml(account.id)}">${escapeHtml(account.name)}</option>`)
    .join("")}`;
  els.filterAccount.value = state.accounts.some((account) => account.id === current) ? current : "all";
}

function fillCategorySelect(select) {
  const current = select.value;
  select.innerHTML = state.categories
    .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    .join("");
  if (state.categories.includes(current)) select.value = current;
}

function ensureCategories(categories) {
  const names = Array.isArray(categories) ? categories : [categories];
  const additions = names
    .map((category) => String(category || "").trim())
    .filter((category) => category && !state.categories.includes(category));
  if (additions.length) state.categories = uniqueValues([...state.categories, ...additions]);
}

function transactionCategories(tx) {
  const categories = normalizeCategoryValues(tx.categories || tx.category, tx.type, `${tx.merchant || ""} ${tx.memo || ""}`);
  return categories.length ? categories : [fallbackCategory(tx.type)];
}

function categoryText(tx) {
  return transactionCategories(tx).join(" / ");
}

function preferredCategories(type) {
  const primary = type === "income" ? INCOME_CATEGORIES : type === "transfer" ? ["振替"] : EXPENSE_CATEGORIES;
  return uniqueValues([...primary, ...state.categories]);
}

function updateMonthFilters() {
  const months = getAvailableMonths();
  const currentMonth = getMonthKey(new Date());
  if (!months.includes(currentMonth)) months.unshift(currentMonth);

  const monthOptions = months
    .map((month) => `<option value="${month}">${month}</option>`)
    .join("");
  const filterCurrent = els.filterMonth.value;
  els.filterMonth.innerHTML = `<option value="all">すべての月</option>${monthOptions}`;
  els.filterMonth.value = months.includes(filterCurrent) || filterCurrent === "all" ? filterCurrent : currentMonth;

  const categoryCurrent = els.categoryMonth.value;
  els.categoryMonth.innerHTML = monthOptions;
  els.categoryMonth.value = months.includes(categoryCurrent) ? categoryCurrent : currentMonth;
}

function getAvailableMonths() {
  return [...new Set(state.transactions.map((tx) => tx.date.slice(0, 7)))]
    .filter(Boolean)
    .sort()
    .reverse();
}

function activateTab(tabId) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active", view.id === tabId);
  });
  if (tabId === "dashboard") renderTrend();
}

function addTransactionFromForm(event) {
  event.preventDefault();
  const type = els.txType.value;
  const amount = Number(els.txAmount.value);
  if (!amount || amount <= 0) return;

  const transaction = normalizeTransaction({
    id: uid(),
    date: els.txDate.value,
    type,
    accountId: els.txAccount.value,
    toAccountId: type === "transfer" ? els.txToAccount.value : "",
    amount,
    merchant: els.txMerchant.value.trim(),
    categories: type === "transfer" ? ["振替"] : [els.txCategory.value],
    memo: els.txMemo.value.trim(),
    source: "manual",
    createdAt: new Date().toISOString(),
  });

  if (transaction.type === "transfer" && transaction.accountId === transaction.toAccountId) {
    alert("振替元と振替先を分けてください。");
    return;
  }

  state.transactions.unshift(transaction);
  saveAndRender();
  els.transactionForm.reset();
  els.txDate.value = today();
  hydrateFormOptions();
}

function normalizeTransaction(tx) {
  const type = ["expense", "income", "transfer"].includes(tx.type) ? tx.type : "expense";
  const suggested = type === "transfer" ? "振替" : categorize(tx.merchant || tx.memo || "");
  const categories = normalizeCategoryValues(tx.categories || tx.category || suggested, type, `${tx.merchant || ""} ${tx.memo || ""}`);
  ensureCategories(categories);
  const normalized = {
    id: tx.id || uid(),
    date: normalizeDate(tx.date) || today(),
    type,
    accountId: tx.accountId || state.accounts[0]?.id || "cash",
    toAccountId: type === "transfer" ? tx.toAccountId || "" : "",
    amount: Math.abs(Number(tx.amount) || 0),
    merchant: tx.merchant || "",
    categories,
    category: categories[0] || fallbackCategory(type),
    memo: tx.memo || "",
    source: tx.source || "manual",
    createdAt: tx.createdAt || new Date().toISOString(),
    mergedFingerprints: Array.isArray(tx.mergedFingerprints) ? tx.mergedFingerprints : [],
  };
  return applyAutomaticTransactionRules(normalized);
}

function updateTransferFields() {
  const isTransfer = els.txType.value === "transfer";
  els.transferTargetWrap.classList.toggle("hidden", !isTransfer);
  els.txCategory.disabled = isTransfer;
  if (isTransfer) {
    els.txCategory.value = "振替";
  } else if (els.txCategory.value === "振替") {
    els.txCategory.value = preferredCategories(els.txType.value)[0] || fallbackCategory(els.txType.value);
  } else if (els.txType.value === "income" && EXPENSE_CATEGORIES.includes(els.txCategory.value)) {
    els.txCategory.value = INCOME_CATEGORIES[0] || fallbackCategory("income");
  } else if (els.txType.value === "expense" && INCOME_CATEGORIES.includes(els.txCategory.value)) {
    els.txCategory.value = EXPENSE_CATEGORIES[0] || fallbackCategory("expense");
  }
}

function suggestCategory() {
  if (els.txType.value === "transfer") return;
  const suggested = categorize(els.txMerchant.value);
  if (suggested) els.txCategory.value = suggested;
}

function categorize(text) {
  const source = String(text || "").toLowerCase();
  const matched = state.rules.find((rule) => source.includes(String(rule.keyword).toLowerCase()));
  return matched?.category || "その他";
}

function fallbackCategory(type) {
  if (type === "transfer") return "振替";
  return "その他";
}

function applyAutomaticTransactionRules(tx) {
  const next = { ...tx };
  if (isPayPayPointIncome(next)) {
    next.categories = ["ポイント付与"];
    next.category = "ポイント付与";
    if (!next.merchant) next.merchant = "PayPayポイント付与";
  }
  return next;
}

function isPayPayPointIncome(tx) {
  return tx.type === "income" && isPayPayAccount(tx.accountId) && tx.amount > 0 && tx.amount <= 100 && tx.amount % 10 !== 0;
}

function isPayPayAccount(accountId) {
  return accountId === "paypay";
}

function isBankAccount(accountId) {
  return state.accounts.find((account) => account.id === accountId)?.type === "bank";
}

function renderAll() {
  hydrateFormOptions();
  renderDashboard();
  renderTransactions();
  renderSettings();
  renderImportPreview();
}

function saveAndRender() {
  saveState();
  renderAll();
}

function renderDashboard() {
  const balances = calculateBalances();
  const total = Object.values(balances).reduce((sum, value) => sum + value, 0);
  const month = getMonthKey(new Date());
  const monthly = summarizeMonth(month);

  els.headerTotal.textContent = formatCurrency(total);
  els.headerNet.textContent = formatCurrency(monthly.income - monthly.expense);
  els.totalAssets.textContent = formatCurrency(total);
  els.monthlyIncome.textContent = formatCurrency(monthly.income);
  els.monthlyExpense.textContent = formatCurrency(monthly.expense);
  els.monthlyNet.textContent = formatCurrency(monthly.income - monthly.expense);

  els.accountBalances.innerHTML = state.accounts
    .map((account) => {
      const balance = balances[account.id] || 0;
      return `
        <article class="account-balance-card">
          <div class="account-name">
            <span class="account-dot" style="background:${escapeHtml(account.color || "#23795f")}"></span>
            <div>
              <strong>${escapeHtml(account.name)}</strong>
              <div class="account-meta">${formatAccountType(account.type)}</div>
            </div>
          </div>
          <span class="balance-value">${formatCurrency(balance)}</span>
        </article>
      `;
    })
    .join("");

  renderTrend();
  renderCategoryBreakdown();
  renderRecentTransactions();
}

function calculateBalances() {
  const balances = {};
  state.accounts.forEach((account) => {
    balances[account.id] = Number(account.initialBalance) || 0;
  });

  state.transactions.forEach((tx) => {
    if (!(tx.accountId in balances)) balances[tx.accountId] = 0;
    if (tx.toAccountId && !(tx.toAccountId in balances)) balances[tx.toAccountId] = 0;

    if (tx.type === "income") balances[tx.accountId] += tx.amount;
    if (tx.type === "expense") balances[tx.accountId] -= tx.amount;
    if (tx.type === "transfer") {
      balances[tx.accountId] -= tx.amount;
      balances[tx.toAccountId] += tx.amount;
    }
  });

  return balances;
}

function summarizeMonth(monthKey) {
  return state.transactions
    .filter((tx) => tx.date.startsWith(monthKey))
    .reduce(
      (summary, tx) => {
        if (tx.type === "income") summary.income += tx.amount;
        if (tx.type === "expense") summary.expense += tx.amount;
        return summary;
      },
      { income: 0, expense: 0 }
    );
}

function renderTrend() {
  const canvas = els.trendCanvas;
  const ctx = canvas.getContext("2d");
  const months = getRecentMonths(Number(els.trendRange.value || 6));
  const summaries = months.map((month) => summarizeMonth(month));
  const maxValue = Math.max(1, ...summaries.flatMap((item) => [item.income, item.expense]));
  const width = canvas.width;
  const height = canvas.height;
  const pad = 44;
  const chartWidth = width - pad * 2;
  const chartHeight = height - pad * 2;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#dce4e0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 4; i += 1) {
    const y = pad + (chartHeight / 4) * i;
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
  }
  ctx.stroke();

  const groupWidth = chartWidth / months.length;
  const barWidth = Math.max(10, Math.min(26, groupWidth * 0.22));

  summaries.forEach((summary, index) => {
    const xCenter = pad + groupWidth * index + groupWidth / 2;
    const incomeHeight = (summary.income / maxValue) * chartHeight;
    const expenseHeight = (summary.expense / maxValue) * chartHeight;
    const baseY = height - pad;

    ctx.fillStyle = "#23795f";
    ctx.fillRect(xCenter - barWidth - 3, baseY - incomeHeight, barWidth, incomeHeight);
    ctx.fillStyle = "#c75d49";
    ctx.fillRect(xCenter + 3, baseY - expenseHeight, barWidth, expenseHeight);

    ctx.fillStyle = "#68746f";
    ctx.font = "13px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(months[index].slice(5), xCenter, height - 16);
  });

  ctx.fillStyle = "#23795f";
  ctx.fillRect(width - 156, 18, 12, 12);
  ctx.fillStyle = "#17201d";
  ctx.textAlign = "left";
  ctx.fillText("収入", width - 138, 29);
  ctx.fillStyle = "#c75d49";
  ctx.fillRect(width - 92, 18, 12, 12);
  ctx.fillStyle = "#17201d";
  ctx.fillText("支出", width - 74, 29);
}

function getRecentMonths(count) {
  const result = [];
  const date = new Date();
  date.setDate(1);
  for (let i = count - 1; i >= 0; i -= 1) {
    const copy = new Date(date.getFullYear(), date.getMonth() - i, 1);
    result.push(getMonthKey(copy));
  }
  return result;
}

function renderCategoryBreakdown() {
  const month = els.categoryMonth.value || getMonthKey(new Date());
  const totals = new Map();
  state.transactions
    .filter((tx) => tx.type === "expense" && tx.date.startsWith(month))
    .forEach((tx) => {
      transactionCategories(tx).forEach((category) => {
        totals.set(category, (totals.get(category) || 0) + tx.amount);
      });
    });

  const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map((row) => row[1]));
  if (!rows.length) {
    els.categoryBreakdown.innerHTML = emptyHtml();
    return;
  }

  els.categoryBreakdown.innerHTML = rows
    .map(([category, amount], index) => {
      const width = Math.max(3, (amount / max) * 100);
      const color = index % 3 === 0 ? "#c75d49" : index % 3 === 1 ? "#b77c25" : "#2f6fbc";
      return `
        <article class="category-row">
          <div class="category-row-top">
            <strong>${escapeHtml(category)}</strong>
            <span class="category-meta">${formatCurrency(amount)}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${width}%;background:${color}"></div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRecentTransactions() {
  const rows = sortedTransactions().slice(0, 8);
  if (!rows.length) {
    els.recentTransactions.innerHTML = emptyHtml();
    return;
  }

  els.recentTransactions.innerHTML = rows
    .map((tx) => {
      const merchant = tx.merchant || tx.memo || TYPE_LABELS[tx.type];
      return `
        <article class="recent-row">
          <div>
            <strong>${escapeHtml(merchant)}</strong>
            <div class="recent-meta">${escapeHtml(tx.date)} / ${escapeHtml(accountName(tx.accountId))} / ${escapeHtml(categoryText(tx))}</div>
          </div>
          <span class="${amountClass(tx.type)}">${formatSignedAmount(tx)}</span>
        </article>
      `;
    })
    .join("");
}

function renderTransactions() {
  updateMonthFilters();
  document.querySelectorAll("[data-transaction-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.transactionView === transactionView);
  });
  els.transactionListView.classList.toggle("hidden", transactionView !== "list");
  els.transactionCalendar.classList.toggle("hidden", transactionView !== "calendar");
  renderTransactionCalendar();

  const rows = filteredTransactions();
  if (!rows.length) {
    els.transactionTable.innerHTML = `<tr><td colspan="7">${emptyHtml()}</td></tr>`;
    return;
  }

  els.transactionTable.innerHTML = rows
    .map((tx) => {
      const account = tx.type === "transfer" ? `${accountName(tx.accountId)} → ${accountName(tx.toAccountId)}` : accountName(tx.accountId);
      return `
        <tr>
          <td>${escapeHtml(tx.date)}</td>
          <td><span class="badge ${tx.type}">${TYPE_LABELS[tx.type]}</span></td>
          <td>${escapeHtml(account)}</td>
          <td class="merchant-cell">${escapeHtml(tx.merchant || tx.memo || "")}</td>
          <td class="category-cell">${renderCategoryCell(tx)}</td>
          <td class="amount-col ${amountClass(tx.type)}">${formatSignedAmount(tx)}</td>
          <td><button class="icon-button" type="button" title="削除" aria-label="削除" data-delete="${escapeHtml(tx.id)}">×</button></td>
        </tr>
        ${openCategoryTxId === tx.id ? renderCategoryEditorRow(tx) : ""}
      `;
    })
    .join("");

  els.transactionTable.querySelectorAll("[data-edit-categories]").forEach((button) => {
    button.addEventListener("click", () => {
      openCategoryTxId = openCategoryTxId === button.dataset.editCategories ? "" : button.dataset.editCategories;
      renderTransactions();
    });
  });
  els.transactionTable.querySelectorAll("[data-category-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleTransactionCategory(button.dataset.txId, button.dataset.category));
  });
  els.transactionTable.querySelectorAll("[data-category-add]").forEach((form) => {
    form.addEventListener("submit", addCategoryFromTransaction);
  });
  els.transactionTable.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      state.transactions = state.transactions.filter((tx) => tx.id !== button.dataset.delete);
      if (openCategoryTxId === button.dataset.delete) openCategoryTxId = "";
      saveAndRender();
    });
  });
}

function renderCategoryCell(tx) {
  const categories = transactionCategories(tx);
  return `
    <button class="category-cell-button" type="button" data-edit-categories="${escapeHtml(tx.id)}" aria-label="カテゴリを編集">
      ${categories.map((category) => `<span class="category-pill">${escapeHtml(category)}</span>`).join("")}
    </button>
  `;
}

function renderCategoryEditorRow(tx) {
  const selected = new Set(transactionCategories(tx));
  const categories = preferredCategories(tx.type);
  return `
    <tr class="category-editor-row">
      <td colspan="7">
        <div class="category-editor">
          <div class="category-toggle-grid">
            ${categories
              .map((category) => {
                const isSelected = selected.has(category);
                return `
                  <button
                    class="category-toggle ${isSelected ? "active" : ""}"
                    type="button"
                    aria-pressed="${isSelected}"
                    data-tx-id="${escapeHtml(tx.id)}"
                    data-category-toggle
                    data-category="${escapeAttribute(category)}"
                  >${escapeHtml(category)}</button>
                `;
              })
              .join("")}
          </div>
          <form class="category-add-form" data-category-add="${escapeHtml(tx.id)}">
            <input class="category-add-input" type="text" placeholder="新しいカテゴリ">
            <button class="primary-button" type="submit">追加して選択</button>
          </form>
        </div>
      </td>
    </tr>
  `;
}

function toggleTransactionCategory(txId, category) {
  const tx = state.transactions.find((item) => item.id === txId);
  if (!tx || !category) return;
  if (tx.type === "transfer") {
    tx.categories = ["振替"];
    tx.category = "振替";
    saveAndRender();
    return;
  }

  const categories = transactionCategories(tx);
  const next = categories.includes(category)
    ? categories.filter((item) => item !== category)
    : [...categories, category];
  const normalized = next.length ? uniqueValues(next) : [fallbackCategory(tx.type)];
  ensureCategories(normalized);
  tx.categories = normalized;
  tx.category = normalized[0] || fallbackCategory(tx.type);
  openCategoryTxId = txId;
  saveAndRender();
}

function addCategoryFromTransaction(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const input = form.querySelector(".category-add-input");
  const category = input.value.trim();
  if (!category) return;
  ensureCategories([category]);
  const tx = state.transactions.find((item) => item.id === form.dataset.categoryAdd);
  if (tx) {
    const categories = uniqueValues([...transactionCategories(tx), category]);
    tx.categories = categories;
    tx.category = categories[0] || fallbackCategory(tx.type);
    openCategoryTxId = tx.id;
  }
  saveAndRender();
}

function renderTransactionCalendar() {
  const month = calendarMonth();
  const [year, monthNumber] = month.split("-").map(Number);
  const firstDay = new Date(year, monthNumber - 1, 1);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const startOffset = firstDay.getDay();
  const rows = filteredTransactions().filter((tx) => tx.date.startsWith(month));
  const byDate = rows.reduce((map, tx) => {
    if (!map.has(tx.date)) map.set(tx.date, []);
    map.get(tx.date).push(tx);
    return map;
  }, new Map());

  const cells = [];
  for (let i = 0; i < startOffset; i += 1) {
    cells.push(`<div class="calendar-day muted"></div>`);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${month}-${pad2(day)}`;
    const dayTransactions = byDate.get(date) || [];
    const incomeTotal = dayTransactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);
    const expenseTotal = dayTransactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
    cells.push(`
      <div class="calendar-day ${dayTransactions.length ? "has-events" : ""}">
        <div class="calendar-day-head">
          <strong>${day}</strong>
          ${dayTransactions.length ? `<span>${dayTransactions.length}件</span>` : ""}
        </div>
        ${dayTransactions.length ? `
          <div class="calendar-day-totals">
            ${incomeTotal ? `<span class="amount-income">+${formatCurrency(incomeTotal)}</span>` : ""}
            ${expenseTotal ? `<span class="amount-expense">-${formatCurrency(expenseTotal)}</span>` : ""}
          </div>
        ` : ""}
        <div class="calendar-events">
          ${dayTransactions.slice(0, 5).map(renderCalendarEvent).join("")}
          ${dayTransactions.length > 5 ? `<div class="calendar-more">他 ${dayTransactions.length - 5}件</div>` : ""}
        </div>
      </div>
    `);
  }

  els.transactionCalendar.innerHTML = `
    <div class="calendar-header">
      <strong>${month}</strong>
      <span>口座別の入出金</span>
    </div>
    <div class="calendar-weekdays">
      ${["日", "月", "火", "水", "木", "金", "土"].map((day) => `<span>${day}</span>`).join("")}
    </div>
    <div class="calendar-grid">${cells.join("")}</div>
  `;
}

function renderCalendarEvent(tx) {
  const label = tx.type === "transfer"
    ? `${accountName(tx.accountId)} → ${accountName(tx.toAccountId)}`
    : accountName(tx.accountId);
  const detail = tx.merchant || categoryText(tx);
  return `
    <div class="calendar-event ${tx.type}">
      <span>${escapeHtml(label)}</span>
      <strong>${formatSignedAmount(tx)}</strong>
      <small>${escapeHtml(detail)}</small>
    </div>
  `;
}

function calendarMonth() {
  const selected = els.filterMonth.value;
  return selected && selected !== "all" ? selected : getMonthKey(new Date());
}

function filteredTransactions() {
  const month = els.filterMonth.value;
  const account = els.filterAccount.value;
  const search = els.filterSearch.value.trim().toLowerCase();

  return sortedTransactions().filter((tx) => {
    const matchesMonth = month === "all" || tx.date.startsWith(month);
    const matchesAccount = account === "all" || tx.accountId === account || tx.toAccountId === account;
    const haystack = [tx.date, tx.type, accountName(tx.accountId), accountName(tx.toAccountId), tx.merchant, categoryText(tx), tx.memo]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    return matchesMonth && matchesAccount && matchesSearch;
  });
}

function sortedTransactions() {
  return [...state.transactions].sort((a, b) => {
    const dateDiff = b.date.localeCompare(a.date);
    if (dateDiff !== 0) return dateDiff;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}

function readCsvFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  applyImportPreset(file.name);
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const rows = parseCsv(decodeCsvBuffer(reader.result));
      importRows = processCsvRows(rows);
      renderImportPreview();
    } catch (error) {
      importRows = [];
      importStatementInfo = null;
      els.importStatus.textContent = `読み込み失敗: ${error.message}`;
      renderImportPreview();
    }
  };
  reader.readAsArrayBuffer(file);
}

function reprocessImportRows() {
  const file = els.csvFile.files?.[0];
  if (!file) return;
  readCsvFile({ target: els.csvFile });
}

function applyImportPreset(fileName) {
  const preset = IMPORT_PRESETS.find((item) => item.match.test(fileName));
  if (!preset) return;
  if (state.accounts.some((account) => account.id === preset.accountId)) {
    els.importAccount.value = preset.accountId;
    els.importStatus.textContent = `${preset.label}のCSVとして判定しました`;
  }
}

function processCsvRows(rows) {
  importStatementInfo = null;
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => String(header || "").trim());
  const body = rows.slice(1).filter((row) => row.some((cell) => String(cell || "").trim()));
  const map = inferCsvMap(headers);
  const existing = new Set(state.transactions.flatMap(transactionFingerprints));
  const parsedRows = body
    .map((row) => ({ row, tx: rowToTransaction(row, headers, map) }))
    .filter(({ tx }) => tx);

  importStatementInfo = inferStatementInfo(parsedRows, map);

  return parsedRows
    .map(({ tx }) => {
      const normalized = normalizeTransaction({ ...tx, id: uid(), source: "csv", createdAt: new Date().toISOString() });
      return {
        ...normalized,
        duplicate: existing.has(fingerprint(normalized)),
      };
    });
}

function rowToTransaction(row, headers, map) {
  const get = (key) => {
    const index = map[key];
    return index === undefined ? "" : String(row[index] || "").trim();
  };

  const date = normalizeDate(get("date"));
  if (!date) return null;

  const accountId = resolveAccount(get("account")) || els.importAccount.value || state.accounts[0]?.id;
  const typeCell = get("type");
  const amountCell = get("amount");
  const incomeCell = get("income");
  const expenseCell = get("expense");
  const merchant = get("merchant") || get("memo") || "";
  const memo = get("memo");
  const category = get("category") || categorize(`${merchant} ${memo}`);
  let toAccountId = resolveAccount(get("toAccount"));

  let type = inferType(typeCell);
  let amount = 0;
  const income = parseAmount(incomeCell);
  const expense = parseAmount(expenseCell);
  const signedAmount = parseAmount(amountCell);

  if (income > 0 || expense > 0) {
    if (income >= expense) {
      type = "income";
      amount = income;
    } else {
      type = "expense";
      amount = expense;
    }
  } else if (signedAmount !== 0) {
    const mode = els.importMode.value;
    if (type === "transfer") {
      amount = Math.abs(signedAmount);
    } else if (type === "income" || type === "expense") {
      amount = Math.abs(signedAmount);
    } else if (mode === "spending") {
      type = "expense";
      amount = Math.abs(signedAmount);
    } else if (mode === "income") {
      type = "income";
      amount = Math.abs(signedAmount);
    } else {
      type = type || (signedAmount < 0 ? "expense" : "income");
      amount = Math.abs(signedAmount);
    }
  }

  if (!amount) return null;
  type = type || "expense";

  if (type === "transfer" && !toAccountId) {
    const text = `${merchant} ${memo}`;
    if (/atm|引き出し|引出/i.test(text)) {
      toAccountId = state.accounts.find((account) => account.type === "cash" && account.id !== accountId)?.id || "";
    }
  }

  if (type === "transfer" && (!toAccountId || toAccountId === accountId)) return null;

  return {
    date,
    type,
    accountId,
    toAccountId,
    amount,
    merchant,
    categories: type === "transfer" ? ["振替"] : normalizeCategoryValues(category, type, `${merchant} ${memo}`),
    category: type === "transfer" ? "振替" : category,
    memo,
  };
}

function inferStatementInfo(parsedRows, map) {
  if (!parsedRows.length || map.balance === undefined) return null;

  const accountIds = uniqueValues(parsedRows.map(({ tx }) => tx.accountId).filter(Boolean));
  if (accountIds.length !== 1) return null;

  const accountId = accountIds[0];
  const withBalances = parsedRows
    .map(({ row, tx }) => ({ tx, rawBalance: String(row[map.balance] || "").trim(), balance: parseAmount(row[map.balance]) }))
    .filter(({ rawBalance, balance }) => rawBalance && Number.isFinite(balance));

  if (!withBalances.length) return null;

  const first = withBalances[0];
  const last = withBalances[withBalances.length - 1];
  const openingBalance = first.balance - transactionDeltaForAccount(first.tx, accountId);
  const netChange = parsedRows.reduce((sum, { tx }) => sum + transactionDeltaForAccount(tx, accountId), 0);
  const expectedLastBalance = openingBalance + netChange;

  if (Math.round(expectedLastBalance) !== Math.round(last.balance)) return null;

  return {
    accountId,
    firstDate: first.tx.date,
    lastDate: last.tx.date,
    openingBalance: Math.round(openingBalance),
    statementBalance: Math.round(last.balance),
  };
}

function transactionDeltaForAccount(tx, accountId) {
  const amount = Number(tx.amount) || 0;
  if (tx.type === "income" && tx.accountId === accountId) return amount;
  if (tx.type === "expense" && tx.accountId === accountId) return -amount;
  if (tx.type === "transfer") {
    let delta = 0;
    if (tx.accountId === accountId) delta -= amount;
    if (tx.toAccountId === accountId) delta += amount;
    return delta;
  }
  return 0;
}

function inferCsvMap(headers) {
  const normalized = headers.map(normalizeHeader);
  const find = (candidates) => {
    const normalizedCandidates = candidates.map(normalizeHeader);
    for (const candidate of normalizedCandidates) {
      const index = normalized.findIndex((header) => header === candidate || header.includes(candidate));
      if (index >= 0) return index;
    }
    return -1;
  };

  const entries = {
    date: find(["date", "日付", "利用日", "取引日", "入出金日", "決済日", "年月日"]),
    account: find(["account", "口座", "財布", "支払元"]),
    toAccount: find(["to account", "振替先", "入金先"]),
    type: find(["type", "種別", "入出金", "取引区分"]),
    amount: find(["amount", "金額", "利用金額", "支払金額", "取引金額", "決済金額"]),
    income: find(["income", "入金", "入金金額", "預入", "お預入れ", "預かり金額", "預り金額", "deposit", "credit"]),
    expense: find(["expense", "出金", "出金金額", "支出", "支払", "支払い金額", "引出", "お引出し", "withdrawal", "debit"]),
    balance: find(["balance", "差引残高", "取引後残高", "現在残高", "残高"]),
    merchant: find(["merchant", "取引先", "摘要内容", "お取り扱い内容", "店名", "利用店", "加盟店", "取引内容", "内容", "摘要", "description"]),
    category: find(["category", "カテゴリ", "分類"]),
    memo: find(["memo", "メモ", "備考", "note", "詳細"]),
  };

  return Object.fromEntries(Object.entries(entries).filter(([, index]) => index >= 0));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function decodeCsvBuffer(buffer) {
  const encoding = els.csvEncoding.value;
  if (encoding === "utf-8") return new TextDecoder("utf-8").decode(buffer);
  if (encoding === "shift_jis") return new TextDecoder("shift_jis").decode(buffer);

  const utf8 = new TextDecoder("utf-8").decode(buffer);
  if (!utf8.includes("�")) return utf8;

  try {
    return new TextDecoder("shift_jis").decode(buffer);
  } catch {
    return utf8;
  }
}

function getStatementBalanceGap(info) {
  if (!info) return null;
  const account = state.accounts.find((item) => item.id === info.accountId);
  if (!account) return null;

  const currentStatementBalance = calculateAccountBalanceOnDate(info.accountId, info.lastDate);
  const difference = Math.round(info.statementBalance - currentStatementBalance);

  if (difference === 0) return null;
  return { account, currentStatementBalance, difference };
}

function calculateAccountBalanceOnDate(accountId, endDate) {
  const account = state.accounts.find((item) => item.id === accountId);
  let balance = Number(account?.initialBalance) || 0;

  state.transactions.forEach((tx) => {
    if (tx.date <= endDate) balance += transactionDeltaForAccount(tx, accountId);
  });

  return Math.round(balance);
}

function renderImportPreview() {
  if (!importRows.length) {
    els.importPreview.innerHTML = `<tr><td colspan="7">${emptyHtml()}</td></tr>`;
    els.importButton.disabled = true;
    if (!els.importStatus.textContent) els.importStatus.textContent = "";
    return;
  }

  const importable = importRows.filter((row) => !row.duplicate).length;
  const statementNote = importStatementInfo
    ? `。${accountName(importStatementInfo.accountId)}の開始前残高は${formatCurrency(importStatementInfo.openingBalance)}、明細残高は${formatCurrency(importStatementInfo.statementBalance)}（${importStatementInfo.lastDate}）です`
    : "";
  const adjustmentNote = importStatementInfo ? "。残高は自動変更しません" : "";
  els.importStatus.textContent = `${importRows.length}件中 ${importable}件を取り込み対象にしました${statementNote}${adjustmentNote}`;
  els.importButton.disabled = importable === 0;
  els.importPreview.innerHTML = importRows
    .slice(0, 80)
    .map((tx) => `
      <tr>
        <td>${escapeHtml(tx.date)}</td>
        <td><span class="badge ${tx.type}">${TYPE_LABELS[tx.type]}</span></td>
        <td>${escapeHtml(accountName(tx.accountId))}</td>
        <td class="merchant-cell">${escapeHtml(tx.merchant || tx.memo || "")}</td>
        <td>${escapeHtml(categoryText(tx))}</td>
        <td class="amount-col ${amountClass(tx.type)}">${formatSignedAmount(tx)}</td>
        <td>${tx.duplicate ? "重複" : "新規"}</td>
      </tr>
    `)
    .join("");
}

function commitImportRows() {
  const rows = importRows.filter((row) => !row.duplicate).map(({ duplicate, ...tx }) => tx);
  if (!rows.length) return;
  const result = reconcileImportedTransactions(rows);
  state.transactions = result.transactions;
  const balanceGap = getStatementBalanceGap(importStatementInfo);
  const notes = [];
  if (result.transferCount) notes.push(`振替${result.transferCount}件`);
  if (result.pointCount) notes.push(`ポイント付与${result.pointCount}件`);
  if (balanceGap) {
    notes.push(
      `${balanceGap.account.name}は明細残高と${formatCurrency(balanceGap.difference)}差（アプリ ${formatCurrency(balanceGap.currentStatementBalance)}、明細 ${formatCurrency(importStatementInfo.statementBalance)}）`
    );
  }
  importRows = [];
  importStatementInfo = null;
  els.csvFile.value = "";
  els.importStatus.textContent = `${rows.length}件を処理しました${notes.length ? `（${notes.join("、")}）` : ""}`;
  saveAndRender();
}

async function importSuicaPdf() {
  const file = els.suicaPdfFile.files?.[0];
  if (!file) return;

  importStatementInfo = null;
  els.suicaPdfButton.disabled = true;
  els.suicaPdfStatus.textContent = "PDFを解析しています";

  try {
    const response = await fetch("/api/suica-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/pdf",
        "X-File-Name": encodeURIComponent(file.name),
      },
      body: await file.arrayBuffer(),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "PDFを解析できませんでした");

    const existing = new Set(state.transactions.flatMap(transactionFingerprints));
    importStatementInfo = result.statementInfo || null;
    importRows = (result.transactions || []).map((tx) => {
      const normalized = normalizeTransaction({
        ...tx,
        id: uid(),
        source: "suica-pdf",
        createdAt: new Date().toISOString(),
      });
      return {
        ...normalized,
        duplicate: existing.has(fingerprint(normalized)),
      };
    });

    renderImportPreview();
    const importable = importRows.filter((row) => !row.duplicate).length;
    const statementNote = importStatementInfo
      ? `。開始前残高は${formatCurrency(importStatementInfo.openingBalance)}、明細残高は${formatCurrency(importStatementInfo.statementBalance)}（${importStatementInfo.lastDate}）です`
      : "";
    els.suicaPdfStatus.textContent = `${importRows.length}件中 ${importable}件を取込プレビューに追加しました${statementNote}`;
  } catch (error) {
    importStatementInfo = null;
    els.suicaPdfStatus.textContent = `${error.message}。node server.mjs で起動しているか確認してください。`;
  } finally {
    els.suicaPdfButton.disabled = !els.suicaPdfFile.files?.[0];
  }
}

function reconcileImportedTransactions(rows) {
  const incoming = rows.map((tx) => markImportOrigin(applyAutomaticTransactionRules(tx), "incoming"));
  const existing = state.transactions.map((tx) => markImportOrigin(applyAutomaticTransactionRules(tx), "existing"));
  const all = [...incoming, ...existing];
  const matched = new Set();
  const transfers = [];

  const paypayIncomes = all.filter((tx) => isPayPayTransferCandidate(tx));
  paypayIncomes.forEach((paypayTx) => {
    if (matched.has(paypayTx.id)) return;
    const bankTx = all.find((tx) => isBankTransferCandidate(tx, paypayTx, matched));
    if (!bankTx) return;

    matched.add(paypayTx.id);
    matched.add(bankTx.id);
    transfers.push(markImportOrigin(buildBankPayPayTransfer(bankTx, paypayTx), "incoming"));
  });

  const remaining = all.filter((tx) => !matched.has(tx.id));
  const transactions = [...transfers, ...remaining].map(stripImportOrigin);
  return {
    transactions,
    transferCount: transfers.length,
    pointCount: incoming.filter(isPayPayPointIncome).length,
  };
}

function markImportOrigin(tx, origin) {
  return { ...tx, __origin: origin };
}

function stripImportOrigin(tx) {
  const { __origin, ...clean } = tx;
  return clean;
}

function isPayPayTransferCandidate(tx) {
  return tx.type === "income" && isPayPayAccount(tx.accountId) && !isPayPayPointIncome(tx);
}

function isBankTransferCandidate(tx, paypayTx, matched) {
  return (
    tx.type === "expense" &&
    isBankAccount(tx.accountId) &&
    !matched.has(tx.id) &&
    tx.date === paypayTx.date &&
    Number(tx.amount) === Number(paypayTx.amount)
  );
}

function buildBankPayPayTransfer(bankTx, paypayTx) {
  const merchantParts = [bankTx.merchant, paypayTx.merchant].filter(Boolean);
  return normalizeTransaction({
    id: uid(),
    date: paypayTx.date,
    type: "transfer",
    accountId: bankTx.accountId,
    toAccountId: paypayTx.accountId,
    amount: paypayTx.amount,
    merchant: "銀行からPayPayへチャージ",
    memo: merchantParts.join(" / "),
    source: "auto-transfer",
    createdAt: new Date().toISOString(),
    categories: ["振替"],
    mergedFingerprints: uniqueValues([...transactionFingerprints(bankTx), ...transactionFingerprints(paypayTx)]),
  });
}

function addAccount(event) {
  event.preventDefault();
  const account = {
    id: slugify(els.accountName.value) || uid(),
    name: els.accountName.value.trim(),
    type: els.accountType.value,
    initialBalance: Number(els.accountBalance.value) || 0,
    color: pickAccountColor(state.accounts.length),
  };

  if (!account.name) return;
  while (state.accounts.some((item) => item.id === account.id)) account.id = `${account.id}-${uid().slice(0, 4)}`;

  state.accounts.push(account);
  els.accountForm.reset();
  saveAndRender();
}

function renderSettings() {
  els.accountSettings.innerHTML = state.accounts
    .map((account) => `
      <div class="setting-row" data-account="${escapeHtml(account.id)}">
        <input value="${escapeAttribute(account.name)}" data-field="name" aria-label="口座名">
        <select data-field="type" aria-label="口座種別">
          ${["cash", "bank", "wallet", "other"].map((type) => `<option value="${type}" ${account.type === type ? "selected" : ""}>${formatAccountType(type)}</option>`).join("")}
        </select>
        <input type="number" step="1" value="${Number(account.initialBalance) || 0}" data-field="initialBalance" aria-label="初期残高">
        <button class="icon-button" type="button" title="削除" aria-label="削除" data-remove-account="${escapeHtml(account.id)}">×</button>
      </div>
    `)
    .join("");

  els.ruleSettings.innerHTML = state.rules
    .map((rule) => `
      <div class="setting-row rule" data-rule="${escapeHtml(rule.id)}">
        <input value="${escapeAttribute(rule.keyword)}" data-field="keyword" aria-label="キーワード">
        <select data-field="category" aria-label="カテゴリ">
          ${state.categories.map((category) => `<option value="${escapeAttribute(category)}" ${rule.category === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
        </select>
        <button class="icon-button" type="button" title="削除" aria-label="削除" data-remove-rule="${escapeHtml(rule.id)}">×</button>
      </div>
    `)
    .join("");

  els.accountSettings.querySelectorAll("input, select").forEach((control) => {
    control.addEventListener("change", updateAccountSetting);
  });
  els.ruleSettings.querySelectorAll("input, select").forEach((control) => {
    control.addEventListener("change", updateRuleSetting);
  });
  els.accountSettings.querySelectorAll("[data-remove-account]").forEach((button) => {
    button.addEventListener("click", () => removeAccount(button.dataset.removeAccount));
  });
  els.ruleSettings.querySelectorAll("[data-remove-rule]").forEach((button) => {
    button.addEventListener("click", () => removeRule(button.dataset.removeRule));
  });
}

function updateAccountSetting(event) {
  const row = event.target.closest("[data-account]");
  const account = state.accounts.find((item) => item.id === row.dataset.account);
  if (!account) return;
  const field = event.target.dataset.field;
  account[field] = field === "initialBalance" ? Number(event.target.value) || 0 : event.target.value.trim();
  saveAndRender();
}

function updateRuleSetting(event) {
  const row = event.target.closest("[data-rule]");
  const rule = state.rules.find((item) => item.id === row.dataset.rule);
  if (!rule) return;
  rule[event.target.dataset.field] = event.target.value.trim();
  saveAndRender();
}

function removeAccount(accountId) {
  const used = state.transactions.some((tx) => tx.accountId === accountId || tx.toAccountId === accountId);
  if (used) {
    alert("取引で使われている口座は削除できません。");
    return;
  }
  if (state.accounts.length <= 1) return;
  state.accounts = state.accounts.filter((account) => account.id !== accountId);
  saveAndRender();
}

function addRule(event) {
  event.preventDefault();
  const keyword = els.ruleKeyword.value.trim();
  if (!keyword) return;
  state.rules.unshift({
    id: uid(),
    keyword,
    category: els.ruleCategory.value,
  });
  els.ruleForm.reset();
  saveAndRender();
}

function removeRule(ruleId) {
  state.rules = state.rules.filter((rule) => rule.id !== ruleId);
  saveAndRender();
}

function addSampleTransactions() {
  const sampleDate = new Date();
  const current = getMonthKey(sampleDate);
  const bank = state.accounts.find((account) => account.type === "bank")?.id || state.accounts[0].id;
  const cash = state.accounts.find((account) => account.id === "cash")?.id || state.accounts[0].id;
  const paypay = state.accounts.find((account) => account.id === "paypay")?.id || state.accounts[0].id;
  const suica = state.accounts.find((account) => account.id === "mobile-suica")?.id || state.accounts[0].id;

  const samples = [
    { date: `${current}-01`, type: "income", accountId: bank, amount: 120000, merchant: "給与", category: "給与" },
    { date: `${current}-03`, type: "expense", accountId: paypay, amount: 690, merchant: "セブンイレブン", category: "食費" },
    { date: `${current}-06`, type: "expense", accountId: suica, amount: 420, merchant: "JR東日本", category: "交通費" },
    { date: `${current}-09`, type: "transfer", accountId: bank, toAccountId: cash, amount: 10000, merchant: "ATM引き出し", category: "振替" },
  ];

  state.transactions = [
    ...samples.map((tx) => normalizeTransaction({ ...tx, id: uid(), source: "sample", createdAt: new Date().toISOString() })),
    ...state.transactions,
  ];
  saveAndRender();
}

function exportJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `money-manager-${today()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      if (!Array.isArray(parsed.accounts) || !Array.isArray(parsed.transactions)) throw new Error("invalid");
      state = migrateState({
        version: 1,
        accounts: parsed.accounts,
        categories: Array.isArray(parsed.categories) ? parsed.categories : DEFAULT_CATEGORIES,
        rules: Array.isArray(parsed.rules) ? parsed.rules : DEFAULT_RULES,
        transactions: parsed.transactions,
      });
      saveAndRender();
    } catch {
      alert("JSONを読み込めませんでした。");
    } finally {
      els.jsonImport.value = "";
    }
  };
  reader.readAsText(file, "utf-8");
}

function resetData() {
  if (!confirm("すべてのデータを初期化しますか？")) return;
  state = createDefaultState();
  importRows = [];
  saveAndRender();
}

function parseAmount(value) {
  const raw = String(value || "").trim();
  if (!raw) return 0;
  const negative = raw.includes("-") || raw.includes("▲") || (raw.startsWith("(") && raw.endsWith(")"));
  const cleaned = raw.replace(/[,\s円¥￥+()▲]/g, "").replace(/[^0-9.-]/g, "");
  const number = Number(cleaned);
  if (!Number.isFinite(number)) return 0;
  return negative ? -Math.abs(number) : number;
}

function inferType(value) {
  const normalized = String(value || "").toLowerCase();
  if (!normalized) return "";
  if (["支出", "出金", "引落", "引き落とし", "debit", "expense", "payment", "利用"].some((word) => normalized.includes(word.toLowerCase()))) return "expense";
  if (["収入", "入金", "預入", "credit", "income", "deposit"].some((word) => normalized.includes(word.toLowerCase()))) return "income";
  if (["振替", "transfer"].some((word) => normalized.includes(word.toLowerCase()))) return "transfer";
  return "";
}

function normalizeDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const ymd = raw.match(/(\d{4})[\/\-.年](\d{1,2})[\/\-.月](\d{1,2})/);
  if (ymd) return `${ymd[1]}-${pad2(ymd[2])}-${pad2(ymd[3])}`;

  const md = raw.match(/(\d{1,2})[\/\-.月](\d{1,2})/);
  if (md) return `${new Date().getFullYear()}-${pad2(md[1])}-${pad2(md[2])}`;

  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return today(parsed);
  return "";
}

function normalizeHeader(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-（）()]/g, "");
}

function resolveAccount(value) {
  const normalized = normalizeHeader(value);
  if (!normalized) return "";
  return state.accounts.find((account) => normalizeHeader(account.name) === normalized || normalizeHeader(account.id) === normalized)?.id || "";
}

function fingerprint(tx) {
  return [
    tx.date,
    tx.type,
    tx.accountId,
    tx.toAccountId || "",
    Number(tx.amount).toFixed(2),
    normalizeHeader(tx.merchant),
    normalizeHeader(tx.memo),
  ].join("|");
}

function transactionFingerprints(tx) {
  return uniqueValues([fingerprint(tx), ...(Array.isArray(tx.mergedFingerprints) ? tx.mergedFingerprints : [])]);
}

function accountName(accountId) {
  return state.accounts.find((account) => account.id === accountId)?.name || "";
}

function formatAccountType(type) {
  return {
    cash: "現金",
    bank: "銀行",
    wallet: "電子マネー",
    other: "その他",
  }[type] || "その他";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatSignedAmount(tx) {
  if (tx.type === "income") return `+${formatCurrency(tx.amount)}`;
  if (tx.type === "expense") return `-${formatCurrency(tx.amount)}`;
  return formatCurrency(tx.amount);
}

function amountClass(type) {
  if (type === "income") return "amount-income";
  if (type === "expense") return "amount-expense";
  return "amount-transfer";
}

function today(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}`;
}

function pad2(value) {
  return String(value).padStart(2, "0");
}

function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-ぁ-んァ-ヶ一-龠ー]/g, "")
    .slice(0, 40);
}

function pickAccountColor(index) {
  return ["#23795f", "#2f6fbc", "#c75d49", "#b77c25", "#6b5ca5", "#27808d"][index % 6];
}

function emptyHtml() {
  return document.getElementById("emptyTemplate").innerHTML;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
