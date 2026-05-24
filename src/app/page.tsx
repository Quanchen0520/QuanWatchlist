"use client";

import { useWatchlist } from "@/hooks/useWatchlist";
import { useQuotes } from "@/hooks/useQuotes";
import { MARKET_ORDER } from "@/lib/config";
import { AddSymbolForm } from "@/components/AddSymbolForm";
import { MarketSection } from "@/components/MarketSection";
import { StatusBar } from "@/components/StatusBar";

export default function Home() {
  const { items, ready, add, remove } = useWatchlist();
  const { quotes, errors, lastUpdated, isLoading, refresh } = useQuotes(items);

  const errorCount = Object.keys(errors).length;
  const isEmpty = ready && items.length === 0;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {/* 標題 */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Quan 看盤
        </h1>
        <p className="mt-1 text-base text-gray-500">
          台股 · 美股 · 加密貨幣，集中一頁即時行情
        </p>
      </header>

      {/* 新增標的 */}
      <div className="mb-5">
        <AddSymbolForm onAdd={add} />
      </div>

      {/* 狀態列 */}
      <div className="mb-8">
        <StatusBar
          lastUpdated={lastUpdated}
          isLoading={isLoading}
          errorCount={errorCount}
          onRefresh={refresh}
        />
      </div>

      {/* 空清單提示 */}
      {isEmpty && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-medium text-gray-700">尚無追蹤標的</p>
          <p className="mt-2 text-base text-gray-500">
            用上方輸入框選擇市場、輸入代號即可加入追蹤。
          </p>
        </div>
      )}

      {/* 各市場分組 */}
      {!isEmpty &&
        MARKET_ORDER.map((market) => (
          <MarketSection
            key={market}
            market={market}
            items={items.filter((i) => i.market === market)}
            quotes={quotes}
            errors={errors}
            onRemove={remove}
          />
        ))}

      <footer className="mt-12 text-center text-sm text-gray-400">
        漲跌色：
        <span className="text-rose-600">紅漲</span> /{" "}
        <span className="text-emerald-600">綠跌</span>
        　·　資料僅供參考，非投資建議
      </footer>
    </main>
  );
}
