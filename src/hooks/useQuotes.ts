"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Market, Quote, QuoteResult, WatchItem } from "@/lib/types";
import { POLL_INTERVAL_MS } from "@/lib/config";
import { itemKey } from "@/lib/storage";

interface UseQuotesResult {
  /** 以 "market:symbol" 為鍵的報價表 */
  quotes: Record<string, Quote>;
  /** 以 "market:symbol" 為鍵的錯誤訊息表 */
  errors: Record<string, string>;
  /** 最後一次成功更新的時間（epoch ms） */
  lastUpdated: number | null;
  /** 是否正在抓取 */
  isLoading: boolean;
  /** 手動立即更新 */
  refresh: () => void;
}

/** 把自選清單依市場分組 */
function groupByMarket(items: WatchItem[]): Record<Market, string[]> {
  const groups: Record<Market, string[]> = { tw: [], us: [], crypto: [] };
  for (const item of items) groups[item.market].push(item.symbol);
  return groups;
}

/**
 * 依自選清單輪詢報價。
 * - 每 POLL_INTERVAL_MS 抓一次，依市場分別打 /api/quotes。
 * - 分頁切到背景（document.hidden）時暫停輪詢以省流量；回到前景立即補抓並恢復。
 * - 清單變動時立即重抓。
 */
export function useQuotes(items: WatchItem[]): UseQuotesResult {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 用 ref 保存最新清單，讓 interval callback 不必重建即可讀到最新值
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const fetchAll = useCallback(async () => {
    const current = itemsRef.current;
    if (current.length === 0) {
      setQuotes({});
      setErrors({});
      return;
    }

    setIsLoading(true);
    const groups = groupByMarket(current);

    // 各市場並行抓取；單一市場失敗只影響該市場
    const requests = (Object.entries(groups) as [Market, string[]][])
      .filter(([, syms]) => syms.length > 0)
      .map(async ([market, syms]) => {
        try {
          const res = await fetch(
            `/api/quotes?market=${market}&symbols=${encodeURIComponent(syms.join(","))}`,
          );
          const data = (await res.json()) as QuoteResult;
          return { market, data };
        } catch {
          return {
            market,
            data: {
              quotes: [],
              errors: syms.map((s) => ({ symbol: s, message: "連線失敗" })),
            } as QuoteResult,
          };
        }
      });

    const results = await Promise.all(requests);

    const nextQuotes: Record<string, Quote> = {};
    const nextErrors: Record<string, string> = {};
    for (const { market, data } of results) {
      for (const q of data.quotes) nextQuotes[itemKey(market, q.symbol)] = q;
      for (const e of data.errors) nextErrors[itemKey(market, e.symbol)] = e.message;
    }

    setQuotes(nextQuotes);
    setErrors(nextErrors);
    setLastUpdated(Date.now());
    setIsLoading(false);
  }, []);

  // 啟動輪詢 + 分頁可見性控制
  useEffect(() => {
    fetchAll();
    const timer = setInterval(() => {
      if (!document.hidden) fetchAll();
    }, POLL_INTERVAL_MS);

    const onVisibility = () => {
      if (!document.hidden) fetchAll(); // 回到前景立即補抓
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchAll]);

  // 自選清單變動時立即重抓
  useEffect(() => {
    fetchAll();
  }, [items, fetchAll]);

  return { quotes, errors, lastUpdated, isLoading, refresh: fetchAll };
}
