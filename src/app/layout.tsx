import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quan 看盤",
  description: "個人看盤：台股 / 美股 / 加密貨幣集中一頁即時行情",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// 在 React 接手前先套用主題，避免重新整理時閃一下白光（FOUC）。
// 邏輯需與 useTheme 一致：有存讀存的、沒存過跟隨系統。
const themeScript = `(function(){try{var k='quan-watchlist:theme';var t=localStorage.getItem(k);var d=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
