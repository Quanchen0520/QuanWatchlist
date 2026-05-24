import type { Market } from "./types";

// ─── 新增標的時的代號正規化 ─────────────────────────────────────

/** 常見計價幣：判斷使用者是否已輸入完整交易對 */
const QUOTE_ASSETS = ["USDT", "USDC", "FDUSD", "TUSD", "BUSD", "BNB", "BTC", "ETH"];

/**
 * 把使用者輸入轉成標準代號。
 * - tw：保留英數（多為數字，少數 ETF 含字母），轉大寫
 * - us：去除空白、轉大寫
 * - crypto：若已是完整交易對（如 BTCUSDT、ETHBTC）就保留；
 *           否則視為幣別並自動補上 USDT（BTC -> BTCUSDT）
 * 回傳空字串代表輸入無效。
 */
export function normalizeSymbol(market: Market, raw: string): string {
  const value = raw.trim().toUpperCase();
  if (!value) return "";

  switch (market) {
    case "tw":
      return value.replace(/[^0-9A-Z]/g, "");
    case "us":
      return value.replace(/[^0-9A-Z.\-]/g, "");
    case "crypto": {
      const clean = value.replace(/[^0-9A-Z]/g, "");
      if (!clean) return "";
      const isFullPair = QUOTE_ASSETS.some(
        (q) => clean.length > q.length && clean.endsWith(q),
      );
      return isFullPair ? clean : `${clean}USDT`;
    }
  }
}
