# Quan 看盤（QuanWatchlist）

個人用的看盤網頁：把自己追蹤的 **台股 / 美股 / 加密貨幣** 集中在一頁顯示即時行情。
這版只做「行情」（現價、漲跌、漲跌幅），尚未做損益/持股/成本，但程式已模組化，方便日後擴充。

## 功能

- 自選清單：可新增/刪除標的，支援台股、美股、加密貨幣三種市場。
- 每檔顯示：名稱與代號、現價、漲跌金額、漲跌幅(%)。
- 漲跌色採台股慣例：**紅漲、綠跌**、平盤灰。
- 自動更新：預設每 **20 秒**輪詢一次（常數 `POLL_INTERVAL_MS`）；分頁切到背景時暫停輪詢省流量，回到前景立即補抓並恢復。
- 自選清單存在瀏覽器 **localStorage**，不需登入。
- 顯示「最後更新時間」與每檔的載入/錯誤狀態，單一來源出錯不會整頁壞掉。

## 技術堆疊

- Next.js（App Router）+ TypeScript + Tailwind CSS v4
- 後端用 Next.js **Route Handler** 當資料代理層（避免 CORS 與金鑰外洩，前端只打自家後端 `/api/quotes`）
- 可直接部署到 Vercel

## 資料來源

| 市場     | 來源                                   | 是否需金鑰 | 備註 |
| -------- | -------------------------------------- | ---------- | ---- |
| 加密貨幣 | Binance 公開行情 `data-api.binance.vision` | 否         | 用此端點避免 Vercel 美國節點被地區封鎖 |
| 美股     | Finnhub 免費方案 `/quote`              | **是**     | 免費版即有即時報價，限 60 次/分鐘 |
| 台股     | 證交所 `mis.twse.com.tw`               | 否         | 後端自動判斷上市(tse)/上櫃(otc) |

## 環境變數

只有美股的 Finnhub 需要金鑰。

1. 到 <https://finnhub.io/register> 免費註冊，登入後在 Dashboard 取得 **API Key**。
2. 複製 `.env.example` 成 `.env.local`，填入金鑰：

   ```bash
   cp .env.example .env.local
   ```

   ```env
   FINNHUB_API_KEY=你的_finnhub_金鑰
   ```

> `.env.local` 已被 `.gitignore` 忽略，不會進版控。未填金鑰時，台股與加密貨幣照常運作，美股會顯示「尚未設定 FINNHUB_API_KEY」。

## 本機啟動

需 Node.js 18.18 以上（建議 20+）。

```bash
npm install      # 安裝依賴
npm run dev      # 啟動開發伺服器
```

打開 <http://localhost:3000>。

其他指令：

```bash
npm run build    # 產生正式版
npm run start    # 啟動正式版（需先 build）
```

## 部署到 Vercel

1. 把專案推到 GitHub（或 GitLab/Bitbucket）。
2. 到 <https://vercel.com> → New Project → 匯入此 repo（框架會自動辨識為 Next.js）。
3. 在 **Settings → Environment Variables** 新增：
   - `FINNHUB_API_KEY` = 你的 Finnhub 金鑰
4. Deploy。之後 push 到主分支會自動重新部署。

> 加密貨幣已使用 `data-api.binance.vision`，即使函式跑在 Vercel 美國節點也不會被擋。

## 專案結構

```
src/
├── app/
│   ├── layout.tsx            # 全站外框與 metadata
│   ├── page.tsx              # 主頁面（組合各元件）
│   ├── globals.css           # 全域樣式（Tailwind v4 入口）
│   └── api/quotes/route.ts   # 統一報價代理，依市場分派
├── components/
│   ├── AddSymbolForm.tsx     # 市場下拉 + 代號輸入
│   ├── MarketSection.tsx     # 依市場分組
│   ├── QuoteRow.tsx          # 單檔卡片
│   └── StatusBar.tsx         # 更新時間/狀態/手動更新
├── hooks/
│   ├── useWatchlist.ts       # 自選清單 + localStorage
│   └── useQuotes.ts          # 輪詢 + 背景暫停
└── lib/
    ├── config.ts             # 常數（輪詢間隔、市場標籤）
    ├── types.ts              # 共用型別
    ├── format.ts             # 數字/顏色格式化
    ├── storage.ts            # localStorage 存取
    ├── symbol.ts             # 新增時的代號正規化
    └── providers/            # 三個資料來源各自的抓取/正規化
        ├── binance.ts
        ├── finnhub.ts
        └── twse.ts
```

## 之後想加「損益計算」時

資料流已預留空間：

- `WatchItem`（`src/lib/types.ts`）可加 `shares`（持股數）、`cost`（成本）等欄位。
- 新增表單再加數量/成本輸入，存進同一份 localStorage。
- 顯示層用既有的 `Quote.price` 乘上持股數即可算出市值與損益，沿用 `changeColorClass` 上色。

## 免責

行情資料來自第三方公開端點，可能有延遲或中斷，僅供個人參考，非投資建議。
