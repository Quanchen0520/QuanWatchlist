"use client";

import { useState } from "react";
import type { Market, WatchItem } from "@/lib/types";
import { MARKET_ORDER, MARKET_LABELS, MARKET_PLACEHOLDERS } from "@/lib/config";
import { normalizeSymbol } from "@/lib/symbol";

interface Props {
  onAdd: (item: WatchItem) => void;
}

/** 搜尋/新增標的：市場下拉 + 代號輸入框 */
export function AddSymbolForm({ onAdd }: Props) {
  const [market, setMarket] = useState<Market>("tw");
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const symbol = normalizeSymbol(market, value);
    if (!symbol) return;
    onAdd({ market, symbol });
    setValue("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
    >
      <select
        value={market}
        onChange={(e) => setMarket(e.target.value as Market)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-800 focus:border-gray-500 focus:outline-none sm:w-32"
        aria-label="選擇市場"
      >
        {MARKET_ORDER.map((m) => (
          <option key={m} value={m}>
            {MARKET_LABELS[m]}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={MARKET_PLACEHOLDERS[market]}
        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-800 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none"
        autoComplete="off"
      />

      <button
        type="submit"
        className="rounded-lg bg-gray-900 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-700 active:bg-gray-800"
      >
        加入
      </button>
    </form>
  );
}
