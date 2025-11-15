'use client'
import { UserIcon } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

export default function UserButton() {
    const { user } = useAuth()
    return (
        <button className="flex items-center gap-x-2 text-sm font-medium text-zinc-800 dark:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg p-2 transition-all w-full">
            <div className="w-10 h-10 rounded-xl bg-[#1161EF] flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col gap-y-1.5 text-left">
                <span className="text-base font-medium text-zinc-800 dark:text-white leading-3">{user?.email.split('@')[0]}</span>
                <span className="text-xs text-zinc-500 dark:text-white">{user?.email}</span>
            </div>
        </button>
    )
}