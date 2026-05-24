// ─── 共用型別定義 ───────────────────────────────────────────────

/** 支援的市場別 */
export type Market = "tw" | "us" | "crypto";

/** 自選清單中的單一項目（存在 localStorage） */
export interface WatchItem {
  market: Market;
  /** 標準化後的代號：台股=2330、美股=AAPL、加密=BTCUSDT */
  symbol: string;
}

/** 後端正規化後回傳的單一報價 */
export interface Quote {
  market: Market;
  symbol: string;
  /** 顯示用名稱（台股為中文名、加密為 BTC/USDT、美股目前同代號） */
  name: string;
  /** 現價 */
  price: number;
  /** 漲跌金額（相對昨收 / 前收盤） */
  change: number;
  /** 漲跌幅（%） */
  changePercent: number;
  /** 計價幣別：TWD / USD / USDT */
  currency: string;
  /** 此報價的時間（epoch ms） */
  updatedAt: number;
}

/** 單一代號抓取失敗的描述 */
export interface QuoteError {
  symbol: string;
  message: string;
}

/** Route Handler 統一回傳格式 */
export interface QuoteResult {
  quotes: Quote[];
  errors: QuoteError[];
}
