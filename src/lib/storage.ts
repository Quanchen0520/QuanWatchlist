import type { Market, WatchItem } from "./types";
import { MARKET_ORDER } from "./config";

// ─── localStorage 自選清單存取 ──────────────────────────────────

const STORAGE_KEY = "quan-watchlist:v1";

/** 產生唯一鍵，用來在前端比對 / 去重 / 對應報價 */
export function itemKey(market: Market, symbol: string): string {
  return `${market}:${symbol}`;
}

function isValidItem(value: unknown): value is WatchItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.symbol === "string" &&
    typeof v.market === "string" &&
    (MARKET_ORDER as string[]).includes(v.market)
  );
}

/** 讀取自選清單；任何異常都回傳空陣列，確保頁面不會壞掉 */
export function loadWatchlist(): WatchItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidItem);
  } catch {
    return [];
  }
}

/** 寫入自選清單 */
export function saveWatchlist(items: WatchItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage 寫入失敗（如無痕模式額度滿）時靜默忽略
  }
}
