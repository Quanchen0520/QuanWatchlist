"use client";

import type { Market, Quote } from "@/lib/types";
import {
  changeColorClass,
  formatChange,
  formatPercent,
  formatPrice,
} from "@/lib/format";

interface Props {
  market: Market;
  symbol: string;
  quote?: Quote;
  error?: string;
  onRemove: () => void;
}

/** 單一標的的卡片：名稱/代號、現價、漲跌、漲跌幅，含載入/錯誤狀態 */
export function QuoteRow({ market, symbol, quote, error, onRemove }: Props) {
  const colorClass = quote
    ? changeColorClass(quote.change)
    : "text-gray-400 dark:text-gray-500";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* 左側：名稱與代號 */}
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-medium text-gray-900 dark:text-gray-100">
          {quote?.name ?? symbol}
        </div>
        <div className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {symbol}
          {quote?.currency ? ` · ${quote.currency}` : ""}
        </div>
      </div>

      {/* 中間：價格與漲跌 */}
      <div className="text-right">
        {error ? (
          <div className="text-sm text-amber-600 dark:text-amber-500">{error}</div>
        ) : quote ? (
          <>
            <div className={`text-2xl font-semibold tabular-nums ${colorClass}`}>
              {formatPrice(quote.price, market)}
            </div>
            <div className={`mt-0.5 text-sm tabular-nums ${colorClass}`}>
              {formatChange(quote.change)} ({formatPercent(quote.changePercent)})
            </div>
          </>
        ) : (
          <div className="text-base text-gray-400 dark:text-gray-500">載入中…</div>
        )}
      </div>

      {/* 右側：移除 */}
      <button
        onClick={onRemove}
        aria-label={`移除 ${symbol}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
      >
        ×
      </button>
    </div>
  );
}
