import type { Market } from "./types";

// ─── 全域可調整常數 ─────────────────────────────────────────────

/**
 * 輪詢間隔（毫秒）。預設 20 秒。
 * 想更頻繁/更省流量時改這裡即可。
 */
export const POLL_INTERVAL_MS = 20_000;

/** 市場顯示順序與中文標籤 */
export const MARKET_ORDER: Market[] = ["tw", "us", "crypto"];

export const MARKET_LABELS: Record<Market, string> = {
  tw: "台股",
  us: "美股",
  crypto: "加密貨幣",
};

/** 新增框的提示字 */
export const MARKET_PLACEHOLDERS: Record<Market, string> = {
  tw: "輸入台股代號，例如 2330",
  us: "輸入美股代號，例如 AAPL",
  crypto: "輸入幣別，例如 BTC（自動配成 BTCUSDT）",
};
