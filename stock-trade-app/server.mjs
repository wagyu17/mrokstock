import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 5175);
const host = "127.0.0.1";
const cache = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      sendText(res, "", 204);
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/api/market") {
      const symbol = cleanSymbol(url.searchParams.get("symbol") || "4927.T");
      const range = cleanRange(url.searchParams.get("range") || "6mo");
      const interval = cleanInterval(url.searchParams.get("interval") || "1d");
      const data = await cached(`market:${symbol}:${range}:${interval}`, 30_000, () => fetchMarket(symbol, range, interval));
      sendJson(res, data);
      return;
    }

    if (url.pathname === "/api/news") {
      const symbol = cleanSymbol(url.searchParams.get("symbol") || "4927.T");
      const company = cleanNewsTerm(url.searchParams.get("company") || "ポーラ・オルビス");
      const data = await cached(`news:${symbol}:${company}`, 120_000, () => fetchNews(symbol, company));
      sendJson(res, data);
      return;
    }

    await serveStatic(url.pathname, res);
  } catch (error) {
    sendJson(res, { error: error.message || "Server error" }, 500);
  }
}).listen(port, host, () => {
  console.log(`Stock trade app: http://${host}:${port}/`);
});

async function serveStatic(pathname, res) {
  const requested = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = normalize(join(root, requested));
  if (!filePath.startsWith(root)) {
    sendText(res, "Forbidden", 403);
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    sendText(res, "Not found", 404);
  }
}

async function fetchMarket(symbol, range, interval) {
  const endpoint = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  endpoint.searchParams.set("range", range);
  endpoint.searchParams.set("interval", interval);

  const response = await fetchWithTimeout(endpoint, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json",
    },
  }, 15_000);
  if (!response.ok) throw new Error(`Yahoo Finance ${response.status}`);

  const json = await response.json();
  const result = json.chart?.result?.[0];
  if (!result) throw new Error("Market data not available");

  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const prices = timestamps.map((time, index) => ({
    time,
    date: toJstDate(time),
    dateTime: toJstDateTime(time),
    timeLabel: toJstTime(time),
    close: numberOrNull(quote.close?.[index]),
    open: numberOrNull(quote.open?.[index]),
    high: numberOrNull(quote.high?.[index]),
    low: numberOrNull(quote.low?.[index]),
    volume: numberOrNull(quote.volume?.[index]),
  })).filter((point) => Number.isFinite(point.close));

  return {
    symbol,
    source: "Yahoo Finance",
    meta: result.meta || {},
    prices,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchNews(symbol, company) {
  const code = symbol.replace(/\.T$/i, "");
  const query = encodeURIComponent(`${company} ${code}`);
  const url = `https://news.google.com/rss/search?q=${query}&hl=ja&gl=JP&ceid=JP:ja`;
  const response = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/rss+xml,text/xml",
    },
  }, 15_000);
  if (!response.ok) throw new Error(`Google News ${response.status}`);

  const xml = await response.text();
  return {
    source: "Google News RSS",
    updatedAt: new Date().toISOString(),
    items: parseRssItems(xml).slice(0, 20),
  };
}

function parseRssItems(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml))) {
    const itemXml = match[1];
    items.push({
      title: decodeXml(readTag(itemXml, "title")),
      link: decodeXml(readTag(itemXml, "link")),
      pubDate: readTag(itemXml, "pubDate"),
      source: decodeXml(readTag(itemXml, "source")),
    });
  }
  return items;
}

function readTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function decodeXml(value) {
  return value
    .replaceAll("<![CDATA[", "")
    .replaceAll("]]>", "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'");
}

async function cached(key, ttlMs, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < ttlMs) return hit.value;
  const value = await loader();
  cache.set(key, { time: Date.now(), value });
  return value;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function cleanSymbol(symbol) {
  return symbol.replace(/[^A-Z0-9.]/gi, "").slice(0, 16) || "4927.T";
}

function cleanNewsTerm(term) {
  return String(term || "").replace(/[<>]/g, "").slice(0, 80) || "ポーラ・オルビス";
}

function cleanRange(range) {
  return ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y"].includes(range) ? range : "6mo";
}

function cleanInterval(interval) {
  return ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1h", "1d", "5d", "1wk", "1mo"].includes(interval) ? interval : "1d";
}

function numberOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

function toJstDate(unixSeconds) {
  const date = new Date(unixSeconds * 1000 + 9 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

function toJstDateTime(unixSeconds) {
  const date = new Date(unixSeconds * 1000 + 9 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 16);
}

function toJstTime(unixSeconds) {
  return toJstDateTime(unixSeconds).slice(11, 16);
}

function sendJson(res, value, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(value));
}

function sendText(res, value, status = 200) {
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(value);
}
