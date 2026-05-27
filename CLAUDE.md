# QuanWatchlist 專案說明（給 Claude）

> 每次 session 自動載入，與 `~/.claude/CLAUDE.md`（全域偏好）疊加。
> 內容保持精簡：只放「README / git history / 程式碼看不出來」的脈絡與踩雷紀錄。

## 一句話定位

個人看盤網頁：Next.js 15 (App Router) + TS + Tailwind v4。前端只打自家 `/api/quotes`，後端代理三種市場（台股、美股、加密貨幣）並正規化成同一格式。**這版只做行情，尚未做損益**。

## 架構速覽

- `src/app/api/quotes/route.ts`：唯一對外的 Route Handler，依 `?market=` 分派到 `src/lib/providers/{binance,finnhub,twse}.ts`。
- 每個 provider 各自把第三方欄位 → 正規化成 `Quote`（`src/lib/types.ts`）。要新增資料來源就新增一個 provider，並在 route 加一個 case。
- 前端只有兩個 hook：`useWatchlist`（自選清單 + localStorage）、`useQuotes`（輪詢 + 分頁背景暫停）。
- 主題用 **class 策略**（`<html class="dark">`），切換靠 `useTheme`；防 FOUC 的內聯腳本寫在 `layout.tsx`，與 hook 的 storage key 必須一致（`quan-watchlist:theme`）。

## 約定 / 偏好

- 註解、commit 訊息、UI 文案一律 **繁體中文**。
- 顏色：**紅漲、綠跌**（台股慣例）。實作在 `src/lib/format.ts` 的 `changeColorClass`，深色下用 `rose-500 / emerald-500`。
- 輪詢間隔常數：`src/lib/config.ts` 的 `POLL_INTERVAL_MS`（20 秒）。要改間隔只動這裡。
- 代號正規化在 `src/lib/symbol.ts`，**存進 localStorage 之前**就要正規化，避免清單裡形式不一。
- 數字一律 `tabular-nums`，避免價格跳動時版面亂跑。
- 新元件要同時顧淺色與深色：別直接用裸 `bg-white` / `text-gray-X`，加 `dark:` 變體。

## 踩雷紀錄（不要做的事）

- 🚫 **加密貨幣不要改回 `api.binance.com`**：Vercel 美國節點會被 Binance 地區封鎖。一律用 `data-api.binance.vision`（同份資料、無地區限制）。
- 🚫 **TWSE mis 端點必須帶 `User-Agent` + `Referer`**（見 `providers/twse.ts`），少了會被擋。
- 🚫 **金鑰只能放 `.env.local` / Vercel 環境變數**，不要寫進前端或 commit。

## 常用指令

```bash
npm run dev                   # 本機開發 http://localhost:3000
npm run build                 # 正式 build + 型別檢查
npx vercel ls quanwatchlist   # 查線上部署狀態
```

push 到 `main` 會自動觸發 Vercel 部署（已連 GitHub）。

## 環境變數

| 變數 | 用途 | 狀態 |
|------|------|------|
| `FINNHUB_API_KEY` | 美股報價 | Vercel **production 已設**；preview **未設**；本機 `.env.local` |

## 接下來可能想做

- **損益計算**：在 `WatchItem`（`types.ts`）加 `shares` / `cost`，AddSymbolForm 加數量輸入，page 用既有 `Quote.price` 算市值與損益，沿用 `changeColorClass` 上色。
- 需要時補上 preview 的 `FINNHUB_API_KEY`：`npx vercel env add FINNHUB_API_KEY preview`。
