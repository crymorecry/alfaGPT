export interface Stock {
  id: string
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  history: PricePoint[]
}

export interface PricePoint {
  date: string
  price: number
}

