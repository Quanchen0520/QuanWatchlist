"use client";

import { useCallback, useEffect, useState } from "react";
import type { Market, WatchItem } from "@/lib/types";
import { loadWatchlist, saveWatchlist } from "@/lib/storage";

/**
 * 管理自選清單：載入 / 新增 / 刪除，並同步到 localStorage。
 * 第一次掛載後才從 localStorage 讀取，避免 SSR 與瀏覽器不一致。
 */
export function useWatchlist() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadWatchlist());
    setReady(true);
  }, []);

  const add = useCallback((item: WatchItem) => {
    setItems((prev) => {
      // 同市場同代號則略過，避免重複
      const exists = prev.some(
        (p) => p.market === item.market && p.symbol === item.symbol,
      );
      if (exists) return prev;
      const next = [...prev, item];
      saveWatchlist(next);
      return next;
    });
  }, []);

  const remove = useCallback((market: Market, symbol: string) => {
    setItems((prev) => {
      const next = prev.filter(
        (p) => !(p.market === market && p.symbol === symbol),
      );
      saveWatchlist(next);
      return next;
    });
  }, []);

  return { items, ready, add, remove };
}
