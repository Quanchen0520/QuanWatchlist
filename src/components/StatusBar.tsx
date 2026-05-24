"use client";

import { POLL_INTERVAL_MS } from "@/lib/config";
import { formatTime } from "@/lib/format";

interface Props {
  lastUpdated: number | null;
  isLoading: boolean;
  errorCount: number;
  onRefresh: () => void;
}

/** 狀態列：最後更新時間、輪詢說明、錯誤提示、手動更新 */
export function StatusBar({ lastUpdated, isLoading, errorCount, onRefresh }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
      <span>
        最後更新：
        <span className="tabular-nums text-gray-700 dark:text-gray-300">
          {lastUpdated ? formatTime(lastUpdated) : "—"}
        </span>
      </span>

      <span className="text-gray-400 dark:text-gray-500">
        每 {POLL_INTERVAL_MS / 1000} 秒自動更新（背景分頁暫停）
      </span>

      {errorCount > 0 && (
        <span className="text-amber-600 dark:text-amber-500">
          {errorCount} 檔抓取異常
        </span>
      )}

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="ml-auto rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        {isLoading ? "更新中…" : "立即更新"}
      </button>
    </div>
  );
}
