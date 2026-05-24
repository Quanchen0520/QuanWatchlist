"use client";

import { useEffect, useState } from "react";

// ─── 深色模式狀態管理 ───────────────────────────────────────────
// 策略：localStorage 有存就用存的；沒存過則跟隨系統設定。
// 首次套用主題的工作由 layout 內的內聯腳本在繪製前完成（避免閃白），
// 這個 hook 只負責讓 UI 狀態與目前主題同步、以及切換。

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "quan-watchlist:theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return getSystemTheme();
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("light");
  // 是否已在瀏覽器掛載；用來避免 SSR 與實際主題不一致時的閃爍
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // 無痕模式等寫入失敗時，至少當下切換仍生效
      }
      applyTheme(next);
      return next;
    });
  };

  return { theme, toggle, mounted };
}
