import { NextResponse } from 'next/server'

const MOEX_BASE_URL = 'https://iss.moex.com/iss'

const POPULAR_TICKERS = [
  'SBER',
  'GAZP',
  'LKOH',
  'YNDX',
  'GMKN',
  'ROSN',
  'NVTK',
  'TATN',
  'MGNT',
  'MOEX',
  'ALRS',
  'PLZL'
]

async function fetchStockHistory(ticker: string) {
  try {
    const response = await fetch(
      `${MOEX_BASE_URL}/history/engines/stock/markets/shares/securities/${ticker}.json?iss.meta=off&limit=30&sort_order=desc`
    )
    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const history = data.history?.data || []
    return history
      .reverse()
      .map((point: any) => ({
        date: point.TRADEDATE,
        price: point.CLOSE || point.OPEN || 0
      }))
      .filter((point: any) => point.price > 0)
  } catch (error) {
    return []
  }
}

export async function GET() {
  try {
    const tickersParam = POPULAR_TICKERS.join(',')
    const url = `${MOEX_BASE_URL}/engines/stock/markets/shares/boards/TQBR/securities.json?iss.meta=off&iss.only=securities,marketdata&securities=${tickersParam}&iss.json=extended`

    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Ошибка при получении данных' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const securities = data[1].securities || []
    const marketdata = data[1].marketdata || []
    const stocksMap = new Map()
    securities.forEach((security: any) => {
      stocksMap.set(security.SECID, {
        ticker: security.SECID,
        name: security.SHORTNAME,
        prevPrice: security.PREVPRICE || 0
      })
    })
    marketdata.forEach((market: any) => {
      const stock = stocksMap.get(market.SECID)
      if (stock) {
        const currentPrice = market.LAST || market.CLOSE || stock.prevPrice || 0
        const prevPrice = stock.prevPrice || currentPrice
        const change = currentPrice - prevPrice
        const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0

        stocksMap.set(market.SECID, {
          ...stock,
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: market.VOLUME || 0,
          marketCap: market.MARKETCAP || 0
        })
      }
    })

    const stocks = Array.from(stocksMap.values())
    const stocksWithHistory = await Promise.all(
      stocks.map(async (stock) => {
        const history = await fetchStockHistory(stock.ticker)
        return {
          id: stock.ticker,
          ticker: stock.ticker,
          name: stock.name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.changePercent,
          volume: stock.volume,
          marketCap: stock.marketCap,
          history: history.length > 0 ? history : [
            { date: new Date().toISOString().split('T')[0], price: stock.price }
          ]
        }
      })
    )

    return NextResponse.json(stocksWithHistory)
  } catch (error) {
    console.error('Error fetching stocks:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении данных' },
      { status: 500 }
    )
  }
}


