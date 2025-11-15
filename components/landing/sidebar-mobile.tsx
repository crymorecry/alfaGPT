'use client'

import { useState } from 'react'
import { Drawer, Portal } from '@chakra-ui/react'
import { Menu, XIcon } from 'lucide-react'
import Logo from '../ui/logo'
import { Home, TrendingUp, DollarSign, Megaphone, Scale, Settings, MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
    {
        name: 'Main',
        href: '/',
        icon: Home
    },
    {
        name: 'Stock',
        href: '/stock',
        icon: TrendingUp
    },
    {
        name: 'Finance',
        href: '/finance',
        icon: DollarSign
    },
    {
        name: 'Marketing',
        href: '/marketing',
        icon: Megaphone
    },
    {
        name: 'Legal',
        href: '/legal',
        icon: Scale
    },
    {
        name: 'Operations',
        href: '/operations',
        icon: Settings
    },
    {
        name: 'Chat',
        href: '/chat',
        icon: MessageSquare
    },
]

export default function SideBarMobile() {
    const [isOpen, setIsOpen] = useState(false)
    const t = useTranslations('sidebar')
    const pathname = usePathname()

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden z-50 rounded-lg"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            <Drawer.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} placement="start">
                <Portal>
                    <Drawer.Backdrop />
                    <Drawer.Positioner>
                        <Drawer.Content className="w-[280px]">
                            <Drawer.Header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
                                <div className="w-32">
                                    <Logo />
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                                    aria-label="Close menu"
                                >
                                    <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </Drawer.Header>
                            <Drawer.Body className="p-4">
                                <nav className="flex flex-col gap-y-2">
                                    {links.map((link) => {
                                        const Icon = link.icon
                                        const isActive = pathname === link.href
                                        return (
                                            <Link
                                                href={link.href}
                                                key={link.name}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <div
                                                    className={`
                            flex gap-x-3 items-center rounded-lg p-3 transition-all
                            ${isActive
                                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                                        }
                          `}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="text-sm font-medium">{t(link.name)}</span>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </nav>
                            </Drawer.Body>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </>
    )
}