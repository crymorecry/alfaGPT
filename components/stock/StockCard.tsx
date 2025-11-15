'use client'

import { Stock } from './types'
import { TrendingUp, TrendingDown, Star } from 'lucide-react'
import StockChart from './StockChart'

interface StockCardProps {
  stock: Stock
  onClick?: () => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export default function StockCard({ stock, onClick, isFavorite = false, onToggleFavorite }: StockCardProps) {
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.()
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-800 transition-all duration-200 relative ${
        onClick ? 'cursor-pointer hover:shadow-lg hover:border-[#1161EF]' : ''
      }`}
    >
      <button
        onClick={handleFavoriteClick}
        className="absolute top-4 right-4 z-10 p-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-zinc-800"
        aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
      >
        <Star 
          className={`w-5 h-5 transition-all duration-200 ${
            isFavorite 
              ? 'fill-[#1161EF] text-[#1161EF]' 
              : 'text-gray-400 dark:text-gray-500 hover:text-[#1161EF]'
          }`} 
        />
      </button>

      <div className="flex items-start justify-between mb-4 pr-8">
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

