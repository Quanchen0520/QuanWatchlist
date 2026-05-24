import { NextResponse } from "next/server";
import type { Market, QuoteResult } from "@/lib/types";
import { fetchBinanceQuotes } from "@/lib/providers/binance";
import { fetchFinnhubQuotes } from "@/lib/providers/finnhub";
import { fetchTwseQuotes } from "@/lib/providers/twse";

// 行情需即時，停用任何快取
export const dynamic = "force-dynamic";
export const revalidate = 0;

const VALID_MARKETS: Market[] = ["tw", "us", "crypto"];

function isMarket(value: string | null): value is Market {
  return value !== null && (VALID_MARKETS as string[]).includes(value);
}

/**
 * GET /api/quotes?market=<tw|us|crypto>&symbols=2330,2317
 * 統一的報價代理：依市場分派到對應 provider，回傳正規化後的報價。
 * 前端只需打這支，金鑰與第三方端點都封裝在後端。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const market = searchParams.get("market");
  const symbols = (searchParams.get("symbols") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!isMarket(market)) {
    return NextResponse.json({ error: "未知的市場別" }, { status: 400 });
  }
  if (symbols.length === 0) {
    return NextResponse.json({ quotes: [], errors: [] } satisfies QuoteResult);
  }

  try {
    let result: QuoteResult;
    switch (market) {
      case "crypto":
        result = await fetchBinanceQuotes(symbols);
        break;
      case "us":
        result = await fetchFinnhubQuotes(symbols, process.env.FINNHUB_API_KEY);
        break;
      case "tw":
        result = await fetchTwseQuotes(symbols);
        break;
    }
    return NextResponse.json(result);
  } catch (err) {
    // 來源端整批掛掉時，把每個代號標成錯誤，前端只壞那一區而不是整頁
    const message = err instanceof Error ? err.message : "資料來源暫時無法連線";
    return NextResponse.json({
      quotes: [],
      errors: symbols.map((s) => ({ symbol: s, message })),
    } satisfies QuoteResult);
  }
}
