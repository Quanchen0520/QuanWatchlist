"use client";

import type { Market, Quote, WatchItem } from "@/lib/types";
import { MARKET_LABELS } from "@/lib/config";
import { itemKey } from "@/lib/storage";
import { QuoteRow } from "./QuoteRow";

interface Props {
  market: Market;
  items: WatchItem[];
  quotes: Record<string, Quote>;
  errors: Record<string, string>;
  onRemove: (market: Market, symbol: string) => void;
}

/** 各市場標題顏色點 */
const DOT_COLORS: Record<Market, string> = {
  tw: "bg-rose-500",
  us: "bg-blue-500",
  crypto: "bg-amber-500",
};

/** 單一市場分組（標題 + 卡片清單）；該市場無標的時不顯示 */
export function MarketSection({ market, items, quotes, errors, onRemove }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${DOT_COLORS[market]}`} />
        <h2 className="text-lg font-semibold text-gray-800">
          {MARKET_LABELS[market]}
        </h2>
        <span className="text-sm text-gray-400">{items.length}</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const key = itemKey(item.market, item.symbol);
          return (
            <QuoteRow
              key={key}
              market={item.market}
              symbol={item.symbol}
              quote={quotes[key]}
              error={errors[key]}
              onRemove={() => onRemove(item.market, item.symbol)}
            />
          );
        })}
      </div>
    </section>
  );
}
