'use client'

import { Stock } from './types'
import StockCard from './StockCard'

interface StockListProps {
  stocks: Stock[]
  onStockClick?: (stock: Stock) => void
}

export default function StockList({ stocks, onStockClick }: StockListProps) {
  if (stocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Акции не найдены
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
        />
      ))}
    </div>
  )
}

