'use client'
import { Menu } from '@chakra-ui/react'
import { useAuth } from '../auth/AuthProvider'
import { useTranslations } from 'next-intl'
import { Globe, Wrench, LogOut } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { startTransition } from 'react'
import { useLocale } from 'next-intl'

export default function UserButton() {
    const { user, logout } = useAuth()
    const t = useTranslations('user')
    const router = useRouter()
    const pathname = usePathname()
    const locale = useLocale()

    function onSelectChange(selectedLocale: string) {
        startTransition(() => {
          let newPath = pathname
          
          if (locale === 'ru' && selectedLocale === 'en') {
            newPath = `/${selectedLocale}${pathname}`
          } else if (locale === 'en' && selectedLocale === 'ru') {
            newPath = pathname.replace('/en', '')
          } else if (locale === 'en' && selectedLocale === 'en') {
            newPath = pathname
          } else {
            newPath = pathname.replace(`/${locale}`, `/${selectedLocale}`)
          }
          
          router.replace(newPath)
        })
      }


    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <button className="w-10 h-10 rounded-full bg-[#1161EF] flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                    <span className="text-white text-xl font-medium leading-[0]">{user?.email?.[0]?.toUpperCase() || 'U'}</span>
                </button>
            </Menu.Trigger>
            <Menu.Positioner>
                <Menu.Content className="min-w-[200px]">
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-zinc-700">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {t('email')}: {user?.email}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                            {t('login')}: {user?.email?.split('@')[0] || ''}
                        </div>
                    </div>

                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        {t('select_language')}
                    </div>
                    <Menu.RadioItemGroup value={locale}>
                        <Menu.RadioItem value="ru" onClick={() => onSelectChange('ru')}>
                            {locale === "ru" ? <Menu.ItemIndicator /> : null}
                            <span>Русский</span>
                        </Menu.RadioItem>
                        <Menu.RadioItem value="en" onClick={() => onSelectChange('en')}>
                            {locale === "en" ? <Menu.ItemIndicator /> : null}
                            <span>English</span>
                        </Menu.RadioItem>
                    </Menu.RadioItemGroup>
                    <Menu.Separator />
                    <Menu.ItemGroup>
                        <Menu.Item value="development" className="flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            <span>{t('in_development')}</span>
                        </Menu.Item>
                        <Menu.Item
                            value="logout"
                            className="flex items-center gap-2 text-red-600 dark:text-red-400"
                            onClick={logout}
                        >
                            <LogOut className="w-4 h-4" />
                            <span>{t('logout')}</span>
                        </Menu.Item>
                    </Menu.ItemGroup>
                </Menu.Content>
            </Menu.Positioner>
        </Menu.Root>
    )
}