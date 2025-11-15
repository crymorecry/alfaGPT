import { useTranslations } from "next-intl"
import SideBarMobile from "../landing/sidebar-mobile"
import UserButton from "../user/user-button"

export default function Title({ children }: { children: React.ReactNode }) {
    const t = useTranslations("sidebar")
    return (
        <div className="lg:flex w-full py-3 lg:py-10 bg-[#F3F4F6] lg:bg-transparent grid grid-cols-3 lg:relative fixed top-0 left-0 right-0 z-50 px-4 lg:px-0">
            <div className="lg:hidden flex h-full items-center">
                <SideBarMobile />
            </div>
            <h1 className="text-xl lg:text-3xl text-gray-800 dark:text-zinc-200 font-semibold lg:font-bold text-center lg:text-left h-full flex items-center justify-center">{t(children)}</h1>
            <div className="lg:hidden flex h-full items-center justify-end">
                <UserButton />
            </div>
        </div>
    )
}