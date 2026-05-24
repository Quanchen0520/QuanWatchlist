import type { Quote, QuoteError, QuoteResult } from "../types";

// ─── 加密貨幣：Binance 公開行情 ─────────────────────────────────
// 使用 data-api.binance.vision（官方公開行情端點），免金鑰，
// 且不會像 api.binance.com 那樣封鎖部分地區 IP（如 Vercel 美國節點）。

const BASE = "https://data-api.binance.vision";

/** 常見計價幣，用來把 BTCUSDT 拆成 BTC / USDT 做顯示與幣別判斷 */
const QUOTE_ASSETS = ["USDT", "USDC", "FDUSD", "TUSD", "BUSD", "BNB", "BTC", "ETH"];

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
}

/** 把交易對拆成 base / quote，例如 BTCUSDT -> { base:"BTC", quote:"USDT" } */
function splitPair(symbol: string): { base: string; quote: string } {
  for (const q of QUOTE_ASSETS) {
    if (symbol.length > q.length && symbol.endsWith(q)) {
      return { base: symbol.slice(0, -q.length), quote: q };
    }
  }
  return { base: symbol, quote: "" };
}

function toQuote(t: BinanceTicker): Quote {
  const { base, quote } = splitPair(t.symbol);
  return {
    market: "crypto",
    symbol: t.symbol,
    name: quote ? `${base}/${quote}` : t.symbol,
    price: parseFloat(t.lastPrice),
    change: parseFloat(t.priceChange),
    changePercent: parseFloat(t.priceChangePercent),
    currency: quote || "USDT",
    updatedAt: Date.now(),
  };
}

/** 單一交易對查詢（批次失敗時的後備，確保壞掉的代號不會拖垮其他正常代號） */
async function fetchOne(symbol: string): Promise<Quote> {
  const url = `${BASE}/api/v3/ticker/24hr?symbol=${encodeURIComponent(symbol)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("查無此交易對");
  const data = (await res.json()) as BinanceTicker;
  return toQuote(data);
}

export async function fetchBinanceQuotes(symbols: string[]): Promise<QuoteResult> {
  if (symbols.length === 0) return { quotes: [], errors: [] };

  // 先嘗試批次查詢（一次 request 拿多檔）
  try {
    const param = encodeURIComponent(JSON.stringify(symbols));
    const url = `${BASE}/api/v3/ticker/24hr?symbols=${param}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as BinanceTicker[];
      const found = new Set(data.map((t) => t.symbol));
      const quotes = data.map(toQuote);
      const errors: QuoteError[] = symbols
        .filter((s) => !found.has(s))
        .map((s) => ({ symbol: s, message: "查無此交易對" }));
      return { quotes, errors };
    }
  } catch {
    // 批次失敗就掉到逐檔查詢
  }

  // 後備：逐檔查詢，任一檔失敗只標記該檔錯誤
  const quotes: Quote[] = [];
  const errors: QuoteError[] = [];
  const settled = await Promise.allSettled(symbols.map(fetchOne));
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") quotes.push(r.value);
    else errors.push({ symbol: symbols[i], message: "查無此交易對" });
  });
  return { quotes, errors };
}
