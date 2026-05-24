import type { Market } from "./types";

// ─── 顯示用的格式化工具 ─────────────────────────────────────────

/** 依市場決定價格的小數位並格式化 */
export function formatPrice(price: number, market: Market): string {
  if (!Number.isFinite(price)) return "—";

  if (market === "crypto") {
    // 加密貨幣價格跨度大：高價少小數、低價多小數
    const digits = price >= 1000 ? 2 : price >= 1 ? 4 : 6;
    return price.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  return price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 漲跌金額（帶 +/- 號） */
export function formatChange(change: number): string {
  if (!Number.isFinite(change)) return "—";
  const sign = change > 0 ? "+" : "";
  return (
    sign +
    change.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** 漲跌幅（帶 +/- 號與 %） */
export function formatPercent(percent: number): string {
  if (!Number.isFinite(percent)) return "—";
  const sign = percent > 0 ? "+" : "";
  return `${sign}${percent.toFixed(2)}%`;
}

/** 時間（HH:mm:ss，24 小時制） */
export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("zh-TW", { hour12: false });
}

/**
 * 依漲跌方向回傳 Tailwind 文字顏色 class。
 * 採台股慣例：紅漲、綠跌、平盤灰。
 */
export function changeColorClass(change: number): string {
  if (change > 0) return "text-rose-600 dark:text-rose-500";
  if (change < 0) return "text-emerald-600 dark:text-emerald-500";
  return "text-gray-500 dark:text-gray-400";
}
