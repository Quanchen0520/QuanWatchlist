import type { Quote, QuoteError, QuoteResult } from "../types";

// ─── 美股：Finnhub 免費方案 ─────────────────────────────────────
// 免費版 /quote 端點即有美股即時報價，限制 60 次/分鐘。
// API Key 由環境變數 FINNHUB_API_KEY 提供，只在後端使用，不外洩到前端。

const BASE = "https://finnhub.io/api/v1";

interface FinnhubQuote {
  c: number; // 現價 current price
  d: number | null; // 漲跌金額 change
  dp: number | null; // 漲跌幅 percent change
  pc: number; // 前收盤 previous close
  t: number; // 時間（epoch 秒）
}

async function fetchOne(symbol: string, apiKey: string): Promise<Quote> {
  const url = `${BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Finnhub 請求過於頻繁（已達免費額度）");
    throw new Error(`抓取失敗（HTTP ${res.status}）`);
  }
  const d = (await res.json()) as FinnhubQuote;

  // 查無代號時 Finnhub 會回傳全 0
  if (!d || (d.c === 0 && d.pc === 0)) {
    throw new Error("查無此美股代號");
  }

  const change = d.d ?? d.c - d.pc;
  const changePercent = d.dp ?? (d.pc ? ((d.c - d.pc) / d.pc) * 100 : 0);

  return {
    market: "us",
    symbol,
    name: symbol,
    price: d.c,
    change,
    changePercent,
    currency: "USD",
    updatedAt: d.t ? d.t * 1000 : Date.now(),
  };
}

export async function fetchFinnhubQuotes(
  symbols: string[],
  apiKey: string | undefined,
): Promise<QuoteResult> {
  if (symbols.length === 0) return { quotes: [], errors: [] };

  // 未設定金鑰：明確提示，而不是讓整頁壞掉
  if (!apiKey) {
    return {
      quotes: [],
      errors: symbols.map((s) => ({
        symbol: s,
        message: "尚未設定 FINNHUB_API_KEY",
      })),
    };
  }

  // Finnhub /quote 不支援多代號批次，逐檔查（個人用量在免費額度內）
  const quotes: Quote[] = [];
  const errors: QuoteError[] = [];
  const settled = await Promise.allSettled(symbols.map((s) => fetchOne(s, apiKey)));
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") quotes.push(r.value);
    else
      errors.push({
        symbol: symbols[i],
        message: r.reason instanceof Error ? r.reason.message : "抓取失敗",
      });
  });
  return { quotes, errors };
}
