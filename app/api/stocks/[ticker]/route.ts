import { NextRequest, NextResponse } from 'next/server'

const MOEX_BASE_URL = 'https://iss.moex.com/iss'

interface MoexSecurity {
  SECID: string
  SHORTNAME: string
  PREVPRICE?: number
  LAST?: number
  CHANGE?: number
  VOLUME?: number
  MARKETCAP?: number
}

function arrayToObject(columns: string[], data: any[]): Record<string, any> {
  const result: Record<string, any> = {}
  columns.forEach((column, index) => {
    result[column] = data[index]
  })
  return result
}

async function fetchStockDetail(ticker: string) {
  try {
    const [boardResponse, historyResponse] = await Promise.all([
      fetch(`${MOEX_BASE_URL}/engines/stock/markets/shares/boards/TQBR/securities/${ticker}.json?iss.meta=off`),
      fetch(`${MOEX_BASE_URL}/history/engines/stock/markets/shares/securities/${ticker}.json?iss.meta=off&limit=90&sort_order=desc`)
    ])

    if (!boardResponse.ok || !historyResponse.ok) {
      return null
    }

    const boardData = await boardResponse.json()
    const historyData = await historyResponse.json()

    const securitiesData = boardData.securities?.data || []
    const marketdataData = boardData.marketdata?.data || []
    const securitiesColumns = boardData.securities?.columns || []
    const marketdataColumns = boardData.marketdata?.columns || []
    const history = historyData.history?.data || []
    const historyColumns = historyData.history?.columns || []

    if (securitiesData.length === 0) {
      return null
    }

    const security = arrayToObject(securitiesColumns, securitiesData[0])
    const market = marketdataData.length > 0 
      ? arrayToObject(marketdataColumns, marketdataData[0])
      : {}

    const currentPrice = market.LAST || market.CLOSEPRICE || market.MARKETPRICE || security.PREVPRICE || 0
    const prevPrice = security.PREVPRICE || currentPrice
    const change = market.CHANGE !== undefined ? market.CHANGE : (currentPrice - prevPrice)
    const changePercent = prevPrice > 0 ? (change / prevPrice) * 100 : 0

    const open = market.OPEN || currentPrice
    const high = market.HIGH || currentPrice
    const low = market.LOW || currentPrice
    const volume = market.VOLTODAY || market.VOLUME || 0
    const marketCap = market.ISSUECAPITALIZATION || 0

    const historyPoints = history
      .reverse()
      .map((pointArray: any[]) => {
        const point = arrayToObject(historyColumns, pointArray)
        return {
          date: point.TRADEDATE,
          price: point.CLOSE || point.OPEN || 0,
          open: point.OPEN || 0,
          high: point.HIGH || 0,
          low: point.LOW || 0,
          volume: point.VOLUME || 0
        }
      })
      .filter((point: any) => point.price > 0)

    return {
      id: ticker,
      ticker: security.SECID,
      name: security.SHORTNAME,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      open: open,
      high: high,
      low: low,
      volume: volume,
      marketCap: marketCap,
      history: historyPoints.length > 0 ? historyPoints : [
        { date: new Date().toISOString().split('T')[0], price: currentPrice, open, high, low, volume: 0 }
      ]
    }
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const ticker = params.ticker.toUpperCase()

    const stock = await fetchStockDetail(ticker)

    if (!stock) {
      return NextResponse.json(
        { error: 'Акция не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json(stock)
  } catch (error) {
    console.error('Error fetching stock detail:', error)
    return NextResponse.json(
      { error: 'Ошибка при получении данных' },
      { status: 500 }
    )
  }
}


