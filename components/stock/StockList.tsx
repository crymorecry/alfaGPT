'use client'

import { Stock } from './types'
import StockCard from './StockCard'
import { useTranslations } from 'next-intl'

interface StockListProps {
  stocks: Stock[]
  onStockClick?: (stock: Stock) => void
  favorites?: string[]
  onToggleFavorite?: (ticker: string) => void
}

export default function StockList({ stocks, onStockClick, favorites = [], onToggleFavorite }: StockListProps) {
  const t = useTranslations("stock")
  if (stocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
            {t('stocks_not_found')}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {stocks.map((stock) => (
        <StockCard
          key={stock.id}
          stock={stock}
          onClick={() => onStockClick?.(stock)}
          isFavorite={favorites.includes(stock.ticker)}
          onToggleFavorite={() => onToggleFavorite?.(stock.ticker)}
        />
      ))}
    </div>
  )
}

