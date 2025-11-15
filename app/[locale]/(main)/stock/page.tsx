'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Stock } from '@/components/stock/types'
import StockSearch from '@/components/stock/StockSearch'
import StockList from '@/components/stock/StockList'

export default function StockPage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [stocks, setStocks] = useState<Stock[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchStocks = async () => {
            try {
                setLoading(true)
                const response = await fetch('/api/stocks')
                
                if (!response.ok) {
                    setError('Ошибка при загрузке данных')
                    return
                }

                const data = await response.json()
                setStocks(data)
            } catch (err) {
                setError('Ошибка при загрузке данных')
            } finally {
                setLoading(false)
            }
        }

        fetchStocks()
    }, [])

    const filteredStocks = useMemo(() => {
        if (!searchQuery.trim()) {
            return stocks
        }

        const query = searchQuery.toLowerCase()
        return stocks.filter(
            (stock) =>
                stock.ticker.toLowerCase().includes(query) ||
                stock.name.toLowerCase().includes(query)
        )
    }, [searchQuery, stocks])

    const handleSearch = (query: string) => {
        setSearchQuery(query)
    }

    const handleStockClick = (stock: Stock) => {
        router.push(`/stock/${stock.ticker}`)
    }

    if (loading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500 dark:text-gray-400">Загрузка...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full flex items-center justify-center min-h-[400px]">
                <div className="text-red-500">{error}</div>
            </div>
        )
    }

    return (
        <div className="w-full flex flex-col gap-y-4">
            <div className="flex w-full justify-between items-center">
                <div className='flex flex-col gap-y-0.5'>
                    <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
                        Акции РФ
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Популярные акции российских компаний
                    </p>
                </div>
                <StockSearch onSearch={handleSearch} />
            </div>
            <StockList stocks={filteredStocks} onStockClick={handleStockClick} />
        </div>
    )
}
