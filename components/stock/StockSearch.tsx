'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface StockSearchProps {
  onSearch: (query: string) => void
}

export default function StockSearch({ onSearch }: StockSearchProps) {
  const t = useTranslations("stock")
  const [query, setQuery] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={t('search_stocks')}
        className="w-full pl-10 pr-4 py-3 bg-white/90 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-xl text-gray-900 dark:text-gray-200 outline-none transition-all duration-200 focus:border-[#1161EF] focus:ring-2 focus:ring-[#1161EF] focus:outline-none"
      />
    </div>
  )
}

