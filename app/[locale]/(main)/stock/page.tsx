'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Stock } from '@/components/stock/types'
import StockSearch from '@/components/stock/StockSearch'
import StockList from '@/components/stock/StockList'
import Title from '@/components/ui/title'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function StockPage() {
    const router = useRouter()
    const [stocks, setStocks] = useState<Stock[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [showFavorites, setShowFavorites] = useState(false)
    const [favorites, setFavorites] = useState<string[]>([])
    const [favoritesLoading, setFavoritesLoading] = useState(false)

    const t = useTranslations("stock")
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const response = await fetch('/api/stocks/favorites')
                if (response.ok) {
                    const data = await response.json()
                    setFavorites(data.favorites || [])
                }
            } catch (err) {
                console.error('Error loading favorites:', err)
            }
        }

        fetchFavorites()
    }, [])

    const fetchStocks = async (isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true)
            }
            const response = await fetch('/api/stocks')

            if (!response.ok) {
                setError('Ошибка при загрузке данных')
                return
            }

            const data = await response.json()
            setStocks(data)
            setError(null)
        } catch (err) {
            setError('Ошибка при загрузке данных')
        } finally {
            if (isInitial) {
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        fetchStocks(true)
        const interval = setInterval(() => {
            fetchStocks(false)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const toggleFavorite = async (ticker: string) => {
        const isFavorite = favorites.includes(ticker)

        setFavorites(prev => {
            if (isFavorite) {
                return prev.filter(t => t !== ticker)
            } else {
                return [...prev, ticker]
            }
        })

        try {
            setFavoritesLoading(true)
            const method = isFavorite ? 'DELETE' : 'POST'
            const response = await fetch('/api/stocks/favorites', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticker }),
            })

            if (!response.ok) {
                setFavorites(prev => {
                    if (isFavorite) {
                        return [...prev, ticker]
                    } else {
                        return prev.filter(t => t !== ticker)
                    }
                })
                const errorData = await response.json()
                console.error('Ошибка при изменении избранного:', errorData.error)
            }
        } catch (err) {
            setFavorites(prev => {
                if (isFavorite) {
                    return [...prev, ticker]
                } else {
                    return prev.filter(t => t !== ticker)
                }
            })
            console.error('Ошибка при изменении избранного:', err)
        } finally {
            setFavoritesLoading(false)
        }
    }

    const handleStockClick = (stock: Stock) => {
        router.push(`/stock/${stock.ticker}`)
    }

    const filteredStocks = useMemo(() => {
        let filtered = stocks

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                stock =>
                    stock.ticker.toLowerCase().includes(query) ||
                    stock.name.toLowerCase().includes(query)
            )
        }

        if (showFavorites) {
            filtered = filtered.filter(stock => favorites.includes(stock.ticker))
        }

        return filtered
    }, [stocks, searchQuery, showFavorites, favorites])

    if (loading && stocks.length === 0) {
        return (
            <div className="w-full flex items-center justify-center min-h-[400px]">
                <div className="text-gray-500 dark:text-gray-400">{t('loading')}</div>
            </div>
        )
    }

    if (error && stocks.length === 0) {
        return (
            <div className="w-full flex items-center justify-center min-h-[400px]">
                <div className="text-red-500">{t('error_loading_data')}</div>
            </div>
        )
    }

    return (
        <>
            <Title>Stock</Title>
            <div className="w-full flex flex-col gap-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
                    <StockSearch onSearch={setSearchQuery} />

                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={showFavorites}
                            onChange={(e) => setShowFavorites(e.target.checked)}
                            className="sr-only"
                        />
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 ${showFavorites
                            ? 'bg-[#1161EF]/10 border-[#1161EF] text-[#1161EF]'
                            : 'bg-white/90 dark:bg-zinc-900 border-gray-300 dark:border-zinc-800 text-gray-700 dark:text-gray-300 group-hover:border-[#1161EF]'
                            }`}>
                            <Star
                                className={`w-5 h-5 transition-all duration-200 ${showFavorites ? 'fill-[#1161EF] text-[#1161EF]' : ''
                                    }`}
                            />
                            <span className="text-sm font-medium">{t('favorites')}</span>
                        </div>
                    </label>
                </div>

                {error && stocks.length > 0 && (
                    <div className="text-yellow-500 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-2">
                        {t('error_update_data')}
                    </div>
                )}

                <StockList
                    stocks={filteredStocks}
                    onStockClick={handleStockClick}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                />
            </div>
        </>
    )
}
