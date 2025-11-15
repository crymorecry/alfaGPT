import '@/app/globals.css'
import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import { Montserrat } from 'next/font/google'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { Providers } from '@/context/ChakraProvider'

const font = Montserrat({
  subsets: ['latin'],
})
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale();
  const messages = useMessages();
  return (
    <html lang={locale}>
      <body className={font.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
          <Providers>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <AuthProvider>
                <main className='h-screen w-full flex items-center justify-center lg:max-w-md mx-auto'>
                  {children}
                </main>
              </AuthProvider>
            </NextIntlClientProvider>
          </Providers>
        </ThemeProvider>
      </body >
    </html >
  )
}