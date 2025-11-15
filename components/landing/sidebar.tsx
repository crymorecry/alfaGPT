import Logo from "@/components/ui/logo"
import ThemeToggler from "@/components/ui/ThemeChanger"
import { ChartLineIcon, FileIcon, MessageCircleIcon, NewspaperIcon, SettingsIcon, SquarePen } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import React from "react"
import UserButton from "../user/user-button"

const links = [
    {
        name: "New Chat",
        href: "/",
        icon: <SquarePen />
    },
    {
        name: "News",
        href: "/news",
        icon: <NewspaperIcon />
    },
    {
        name: "Stock",
        href: "/stock",
        icon: <ChartLineIcon />
    }
]
export default function SideBar() {
    const t = useTranslations("sidebar")
    return (
        <div className='flex flex-col w-[20rem] dark:bg-white bg-white h-full z-50 rounded-r-3xl items-start py-4 px-4 relative'>
            <div className="flex flex-col gap-y-4 w-full flex-shrink-0">
                <div className="flex gap-x-4 items-center justify-between px-8">
                    <Logo />
                </div>
                <div className="flex flex-col gap-y-2">
                    {links.map((link) => (
                        <Link href={link.href} key={link.name}>
                            <div className="flex gap-x-2 items-center hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg p-2 transition-all">
                                {React.cloneElement(link.icon, { className: "w-5 h-5 text-zinc-800 dark:text-white" })}
                                <span className="text-sm font-medium text-zinc-800 dark:text-white">{t(link.name)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="flex flex-1 overflow-y-auto w-full min-h-0 mt-8">
                <div className="w-full h-[13245px]">sfgfsg</div>
            </div>
            <UserButton />
        </div>
    )
}