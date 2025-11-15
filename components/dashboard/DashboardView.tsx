'use client'

import { DollarSign, Megaphone, Scale, Settings, BarChart3, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Title from '../ui/title'
import { useTranslations } from 'next-intl'
import CalendarView from './CalendarView'


const modules = [
    {
        id: 'finance',
        title: 'finance',
        description: 'finance_description',
        icon: DollarSign,
        color: 'blue',
        href: '/finance'
    },
    {
        id: 'marketing',
        title: 'marketing',
        description: 'marketing_description',
        icon: Megaphone,
        color: 'orange',
        href: '/marketing'
    },
    {
        id: 'legal',
        title: 'legal',
        description: 'legal_description',
        icon: Scale,
        color: 'purple',
        href: '/legal'
    },
    {
        id: 'operations',
        title: 'operations',
        description: 'operations_description',
        icon: Settings,
        color: 'green',
        href: '/operations'
    },
    {
        id: 'analytics',
        title: 'analytics',
        description: 'analytics_description',
        icon: BarChart3,
        color: 'red',
        href: '/analytics'
    },
    {
        id: 'stock',
        title: 'stock',
        description: 'stock_description',
        icon: TrendingUp,
        color: 'teal',
        href: '/stock'
    }
]

export default function DashboardView() {
    const router = useRouter()
    const t = useTranslations("dashboard")
    return (
        <div>
            <Title>Main</Title>

            <CalendarView />

            <div className="grid lg:grid-cols-3 2xl:grid-cols-4 w-full gap-4">
                {modules.map((module) => {
                    const Icon = module.icon
                    return (
                        <div
                            key={module.id}
                            className="p-4 bg-white rounded-2xl cursor-pointer shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 hover:border-blue-500 border-2 border-transparent flex flex-col gap-y-8"
                            onClick={() => router.push(module.href)}
                        >
                            <div className="text-zinc-800 p-2 h-14 w-14 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                                <Icon size={24} />
                            </div>
                            <div className="flex flex-col mt-auto">
                                <h2 className="text-xl font-semibold mb-2">{t(module.title)}</h2>
                                <p className="text-gray-600 text-sm">{t(module.description)}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
