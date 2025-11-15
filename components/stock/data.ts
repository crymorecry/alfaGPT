import { Stock } from './types'

const generateHistory = (basePrice: number, days: number = 30): { date: string; price: number }[] => {
  const history = []
  const today = new Date()
  let currentPrice = basePrice * 0.85

  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const variation = (Math.random() - 0.5) * 0.1
    currentPrice = currentPrice * (1 + variation)
    history.push({
      date: date.toISOString().split('T')[0],
      price: Number(currentPrice.toFixed(2))
    })
  }

  return history
}

export const popularStocks: Stock[] = [
  {
    id: '1',
    ticker: 'SBER',
    name: 'Сбербанк',
    price: 285.50,
    change: 5.20,
    changePercent: 1.86,
    volume: 125000000,
    marketCap: 6250000000000,
    history: generateHistory(285.50)
  },
  {
    id: '2',
    ticker: 'GAZP',
    name: 'Газпром',
    price: 198.75,
    change: -2.15,
    changePercent: -1.07,
    volume: 98000000,
    marketCap: 4680000000000,
    history: generateHistory(198.75)
  },
  {
    id: '3',
    ticker: 'LKOH',
    name: 'Лукойл',
    price: 7245.00,
    change: 125.50,
    changePercent: 1.76,
    volume: 4500000,
    marketCap: 5450000000000,
    history: generateHistory(7245.00)
  },
  {
    id: '4',
    ticker: 'YNDX',
    name: 'Яндекс',
    price: 3124.80,
    change: -45.20,
    changePercent: -1.43,
    volume: 3200000,
    marketCap: 1120000000000,
    history: generateHistory(3124.80)
  },
  {
    id: '5',
    ticker: 'GMKN',
    name: 'Норникель',
    price: 15230.00,
    change: 280.00,
    changePercent: 1.87,
    volume: 1800000,
    marketCap: 2410000000000,
    history: generateHistory(15230.00)
  },
  {
    id: '6',
    ticker: 'ROSN',
    name: 'Роснефть',
    price: 485.90,
    change: 8.30,
    changePercent: 1.74,
    volume: 75000000,
    marketCap: 5120000000000,
    history: generateHistory(485.90)
  },
  {
    id: '7',
    ticker: 'NVTK',
    name: 'Новатэк',
    price: 1845.50,
    change: -12.40,
    changePercent: -0.67,
    volume: 2500000,
    marketCap: 556000000000,
    history: generateHistory(1845.50)
  },
  {
    id: '8',
    ticker: 'TATN',
    name: 'Татнефть',
    price: 645.20,
    change: 15.80,
    changePercent: 2.51,
    volume: 4200000,
    marketCap: 1420000000000,
    history: generateHistory(645.20)
  },
  {
    id: '9',
    ticker: 'MGNT',
    name: 'Магнит',
    price: 7820.00,
    change: -95.00,
    changePercent: -1.20,
    volume: 850000,
    marketCap: 1560000000000,
    history: generateHistory(7820.00)
  },
  {
    id: '10',
    ticker: 'MOEX',
    name: 'Московская биржа',
    price: 185.40,
    change: 3.20,
    changePercent: 1.76,
    volume: 15000000,
    marketCap: 425000000000,
    history: generateHistory(185.40)
  },
  {
    id: '11',
    ticker: 'ALRS',
    name: 'Алроса',
    price: 78.90,
    change: 1.50,
    changePercent: 1.94,
    volume: 25000000,
    marketCap: 585000000000,
    history: generateHistory(78.90)
  },
  {
    id: '12',
    ticker: 'PLZL',
    name: 'Полюс',
    price: 12450.00,
    change: 180.00,
    changePercent: 1.47,
    volume: 1200000,
    marketCap: 2340000000000,
    history: generateHistory(12450.00)
  }
]

