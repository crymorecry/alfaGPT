'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import StockChart from '@/components/stock/StockChart'
import { Stock } from '@/components/stock/types'
import Title from '@/components/ui/title'
import { useTranslations } from 'next-intl'

export default function StockDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticker = params.ticker as string
  const [stock, setStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const t = useTranslations("stock")
  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/stocks/${ticker}`)

        if (!response.ok) {
          setError(t('stock_not_found'))
          return
        }

        const data = await response.json()
        setStock(data)
      } catch (err) {
        setError(t('error_loading_data'))
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchStock()
    }
  }, [ticker])

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">{t('loading')}</div>
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className="w-full">
        <button
          onClick={() => router.push('/stock')}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-[#1161EF] rounded-lg p-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('back_to_list')}</span>
        </button>
        <div className="text-center py-12">
          <p className="text-red-500 text-lg">{error || t('stock_not_found')}</p>
        </div>
      </div>
    )
  }

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
    if (cap >= 1e12) return `${(cap / 1e12).toFixed(2)} ${t('trillion')} ₽`
    if (cap >= 1e9) return `${(cap / 1e9).toFixed(2)} ${t('billion')}`
    return `${(cap / 1e6).toFixed(2)} ${t('million')}`
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)} ${t('billion')}`
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)} ${t('million')}`
    return `${(volume / 1e3).toFixed(2)} ${t('thousand')}`
  }

  const extendedStock = stock as any

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 lg:flex-row justify-between items-center">
        <Title>Stock</Title>
        <button
          onClick={() => router.push('/stock')}
          className="flex items-center gap-2 text-white dark:hover:text-white transition-colors bg-[#1161EF] rounded-lg p-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium whitespace-nowrap">{t('back_to_list')}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl p-8 border border-gray-200 dark:border-zinc-800">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              {stock.ticker}
            </h1>
            <p className="text-xl text-zinc-900 dark:text-white">
              {stock.name}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${bgColor} ${changeColor}`}>
            {isPositive ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span className="text-lg font-semibold">
              {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('current_price')}</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">
              {formatPrice(stock.price)} ₽
            </div>
            <div className={`text-sm font-medium mt-1 ${changeColor}`}>
              {isPositive ? '+' : ''}{formatPrice(stock.change)} ₽
            </div>
          </div>

          {extendedStock.open && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-zinc-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('opening')}</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {formatPrice(extendedStock.open)} ₽
              </div>
            </div>
          )}

          {extendedStock.high && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-zinc-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('maximum')}</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {formatPrice(extendedStock.high)} ₽
              </div>
            </div>
          )}

          {extendedStock.low && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-zinc-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('minimum')}</div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                {formatPrice(extendedStock.low)} ₽
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
            {t('price_chart')}
          </h2>
          <div className="h-96 bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800">
            <StockChart stock={stock} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-zinc-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('capitalization')}</div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">
              {formatMarketCap(stock.marketCap)}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-gray-200 dark:border-zinc-800">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('volume')}</div>
            <div className="text-xl font-bold text-zinc-900 dark:text-white">
              {formatVolume(stock.volume)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

