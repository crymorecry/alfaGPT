'use client'
import { MoonIcon } from 'lucide-react';
import { SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggler() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme()
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }
    return (
        <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className='flex items-center justify-center rounded-lg w-10 h-10 hover:dark:bg-zinc-900 hover:bg-zinc-300 transition-all border border-slate-300 dark:border-zinc-800 p-2'>
            {theme === 'light' ? (
                <SunIcon width={24} height={24} className="text-zinc-900 outline-none" />
            ) : (
                <MoonIcon width={24} height={24} className="text-slate-50 outline-none" />
            )}
        </button >
    )
}