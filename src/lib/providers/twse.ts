import type { Quote, QuoteError, QuoteResult } from "../types";

// ─── 台股：台灣證交所 mis.twse.com.tw 公開報價 ──────────────────
// 此端點需帶合理的 User-Agent / Referer 才不易被擋，故一律走後端代理。
// 代號分上市（tse_）與上櫃（otc_）；策略：先全部以 tse 試一次，
// 查不到的再以 otc 補一次，使用者輸入時不必自己分。

const BASE = "https://mis.twse.com.tw/stock/api/getStockInfo.jsp";

const REQUEST_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Referer: "https://mis.twse.com.tw/stock/index.jsp",
  Accept: "application/json, text/plain, */*",
};

/** mis 端點回傳的單筆原始資料（僅列出會用到的欄位） */
interface TwseRaw {
  c: string; // 股票代號
  n: string; // 股票名稱（中文）
  z: string; // 最近成交價（無成交時可能為 "-"）
  y: string; // 昨收價
  o: string; // 開盤價
  b?: string; // 五檔買價，"_" 分隔
  a?: string; // 五檔賣價，"_" 分隔
  tlong?: string; // 時間戳（epoch ms 字串）
}

/** 從 "67.3000_67.2000_" 這種字串取第一個有效數字 */
function firstNumber(raw?: string): number {
  if (!raw) return NaN;
  for (const part of raw.split("_")) {
    const n = parseFloat(part);
    if (Number.isFinite(n)) return n;
  }
  return NaN;
}

function toQuote(item: TwseRaw): Quote {
  const prevClose = parseFloat(item.y);

  // 現價優先序：成交價 z → 賣一 a → 買一 b → 開盤 o → 昨收 y
  let price = parseFloat(item.z);
  if (!Number.isFinite(price)) price = firstNumber(item.a);
  if (!Number.isFinite(price)) price = firstNumber(item.b);
  if (!Number.isFinite(price)) price = parseFloat(item.o);
  if (!Number.isFinite(price)) price = prevClose;

  const change = Number.isFinite(prevClose) ? price - prevClose : 0;
  const changePercent =
    Number.isFinite(prevClose) && prevClose !== 0 ? (change / prevClose) * 100 : 0;

  return {
    market: "tw",
    symbol: item.c,
    name: item.n || item.c,
    price,
    change,
    changePercent,
    currency: "TWD",
    updatedAt: item.tlong ? Number(item.tlong) : Date.now(),
  };
}

/** 以指定交易所前綴查一批代號，回傳「代號 -> 原始資料」 */
async function query(prefix: "tse" | "otc", symbols: string[]): Promise<Map<string, TwseRaw>> {
  const exch = symbols.map((s) => `${prefix}_${s}.tw`).join("|");
  const url = `${BASE}?ex_ch=${encodeURIComponent(exch)}&json=1&delay=0&_=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store", headers: REQUEST_HEADERS });
  if (!res.ok) throw new Error(`抓取失敗（HTTP ${res.status}）`);

  const data = (await res.json()) as { msgArray?: TwseRaw[] };
  const map = new Map<string, TwseRaw>();
  for (const item of data.msgArray ?? []) {
    // 只收下確實有昨收或成交價的資料，避免空殼
    if (item.c) map.set(item.c, item);
  }
  return map;
}

export async function fetchTwseQuotes(symbols: string[]): Promise<QuoteResult> {
  if (symbols.length === 0) return { quotes: [], errors: [] };

  const quotes: Quote[] = [];
  const found = new Set<string>();

  // 第一輪：當作上市（tse）
  try {
    const tseMap = await query("tse", symbols);
    for (const s of symbols) {
      const item = tseMap.get(s);
      if (item && (Number.isFinite(parseFloat(item.y)) || Number.isFinite(parseFloat(item.z)))) {
        quotes.push(toQuote(item));
        found.add(s);
      }
    }
  } catch {
    // 整批失敗就讓第二輪 / 錯誤處理接手
  }

  // 第二輪：剩下的當作上櫃（otc）
  const remaining = symbols.filter((s) => !found.has(s));
  if (remaining.length > 0) {
    try {
      const otcMap = await query("otc", remaining);
      for (const s of remaining) {
        const item = otcMap.get(s);
        if (item && (Number.isFinite(parseFloat(item.y)) || Number.isFinite(parseFloat(item.z)))) {
          quotes.push(toQuote(item));
          found.add(s);
        }
      }
    } catch {
      // 同上
    }
  }

  const errors: QuoteError[] = symbols
    .filter((s) => !found.has(s))
    .map((s) => ({ symbol: s, message: "查無此台股代號" }));

  return { quotes, errors };
}
