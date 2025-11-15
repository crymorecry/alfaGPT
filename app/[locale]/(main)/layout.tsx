import '@/app/globals.css'
import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import { Montserrat } from 'next/font/google'
import { Providers } from '@/context/ChakraProvider'
import { AuthProvider } from '@/components/auth/AuthProvider'
import SideBar from '@/components/landing/sidebar'

const font = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
                <div className='relative flex h-screen max-h-screen flex-col lg:overflow-y-hidden'>
                  <div className='flex relative h-full pt-16 lg:pt-0'>
                    <SideBar />
                    <div className='h-full w-full overflow-y-scroll px-4 py-8 pb-[200px] lg:px-8 2xl:px-16'>
                      <main className='w-full max-w-screen-2xl mx-auto'>
                        {children}
                      </main>
                    </div>
                  </div>
                </div>
              </AuthProvider>
            </NextIntlClientProvider>
          </Providers>
        </ThemeProvider>
      </body >
    </html >
  )
}