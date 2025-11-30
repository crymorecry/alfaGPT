'use client'

import Logo from "@/components/ui/logo"
import { Home, DollarSign, Settings, MessageSquare, Users, BarChart3 } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"
import UserButton from "../user/user-button"

const links = [
    {
        name: "Main",
        href: "/",
        icon: Home
    },
    {
        name: "Analytics",
        href: "/analytics",
        icon: BarChart3
    },
    {
        name: "Finance",
        href: "/finance",
        icon: DollarSign
    },
    {
        name: "Employees",
        href: "/employees",
        icon: Users
    },
    {
        name: "Operations",
        href: "/operations",
        icon: Settings
    },
    {
        name: "Chat",
        href: "/chat",
        icon: MessageSquare
    },
]
export default function SideBar() {
    const t = useTranslations("sidebar")
    const pathname = usePathname()

    return (
        <div className='h-full fixed w-[230px] flex-shrink-0 hidden lg:flex'>
            <div className="flex flex-shrink-0 w-full flex-col px-2 gap-y-6 pt-4 pb-10">
                <div className="flex flex-col gap-y-4 w-full flex-shrink-0">
                    <div className="w-32">
                        <Logo />
                    </div>
                    <div className="flex flex-col gap-y-2">
                        {links.map((link) => {
                            const Icon = link.icon
                            const isActive = pathname === link.href
                            return (
                                <Link href={link.href} key={link.name}>
                                    <div className={`flex gap-x-2 items-center hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg p-2 transition-all group ${isActive ? 'bg-blue-100 dark:bg-blue-900' : ''}`}>
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-800 dark:text-white'}`} />
                                        <span className={`text-sm font-medium ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-800 dark:text-white'}`}>{t(link.name)}</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4 ml-auto text-blue-500 opacity-0 translate-x-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    )
}