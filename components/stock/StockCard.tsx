'use client'

import { Stock } from './types'
import { TrendingUp, TrendingDown } from 'lucide-react'
import StockChart from './StockChart'

interface StockCardProps {
  stock: Stock
  onClick?: () => void
}

export default function StockCard({ stock, onClick }: StockCardProps) {
  const isPositive = stock.change >= 0
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500'
  const bgColor = isPositive ? 'bg-green-500/10' : 'bg-red-500/10'

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatMarketCap = (cap: number) => {
    if (cap >= 1e12) return `${(cap / 1e12).toFixed(2)} трлн ₽`
    if (cap >= 1e9) return `${(cap / 1e9).toFixed(2)} млрд ₽`
    return `${(cap / 1e6).toFixed(2)} млн ₽`
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-800 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-[#1161EF]' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {stock.ticker}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {stock.name}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-lg flex items-center gap-1 ${bgColor} ${changeColor}`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-semibold">
            {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="">
        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {formatPrice(stock.price)} ₽
        </div>
        <div className={`text-sm font-medium ${changeColor}`}>
          {isPositive ? '+' : ''}{formatPrice(stock.change)} ₽
        </div>
      </div>

    </div>
  )
}

