'use client'

import { useEffect, useMemo, useState } from 'react'

type AuthCode = {
  id: string
  email: string
  code: string
  verified: boolean
  createdAt: string
  expiresAt: string
}

export default function AuthCodePage() {
  const [codes, setCodes] = useState<AuthCode[]>([])
  const [loading, setLoading] = useState(false)

  const fetchCodes = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/codes?limit=30', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setCodes(data)
      }
    } catch (e) {
      console.error('Failed to load codes', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCodes()
    const interval = setInterval(fetchCodes, 5000)
    return () => clearInterval(interval)
  }, [])

  const sorted = useMemo(
    () => [...codes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [codes]
  )

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Auth codes</h1>
            <p className="text-sm text-slate-500">Автообновление каждые 5 сек</p>
          </div>
          <button
            onClick={fetchCodes}
            className="px-4 py-2 rounded-lg bg-slate-100 text-sm hover:bg-slate-200 transition border border-slate-200"
            disabled={loading}
          >
            {loading ? 'Обновление...' : 'Обновить'}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-left">Expires</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{item.email}</td>
                  <td className="px-4 py-3 text-lg font-semibold text-emerald-600">{item.code}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        item.verified
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.verified ? 'verified' : 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(item.createdAt).toLocaleString('ru-RU')}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(item.expiresAt).toLocaleString('ru-RU')}
                  </td>
                </tr>
              ))}
              {!sorted.length && (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                    {loading ? 'Загрузка...' : 'Коды не найдены'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}