import '@/app/globals.css'
import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import { Providers } from '@/context/ChakraProvider'
import { generateMetadata } from '@/utils/seo-head'

export const metadata = generateMetadata({
    title: 'Тесты Playwright',
    description: 'Тесты Playwright для Volency',
    url: '/playwright',
    index: false
})

export default function PlaywrightLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const locale = useLocale();
    const messages = useMessages();
    return (
        <html lang={locale}>
            <body>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
                    <Providers>
                        <NextIntlClientProvider locale={locale} messages={messages}>
                            {children}
                        </NextIntlClientProvider>
                    </Providers>
                </ThemeProvider>
            </body >
        </html >
    )
}