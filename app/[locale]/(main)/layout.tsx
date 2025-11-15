import '@/app/globals.css'
import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl'
import { ThemeProvider } from 'next-themes'
import { Providers } from '@/context/ChakraProvider'
import { AuthProvider } from '@/components/auth/AuthProvider'
import SideBar from '@/components/landing/sidebar'
import BgSVG from '@/components/ui/bgSVG'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '@/components/landing/navbar'

export default function RootLayout({
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
              <AuthProvider>
                <div className='flex flex-col w-full 2xl:px-20'>
                  <div className='flex w-full h-full'>
                    <SideBar />
                    <div className='h-full w-[230px] flex-shrink-0 hidden lg:flex'></div>
                    <div className='relative w-full'>
                      <BgSVG />
                      <div className='flex flex-col w-full'>
                        <Navbar />
                        <main className='w-full lg:w-full 2xl:w-full mx-auto px-4 lg:px-6 2xl:px-10 lg:mt-0 pb-[100px]'>
                          {children}
                        </main>
                      </div>
                    </div>
                  </div>
                </div>
                <Toaster />
              </AuthProvider>
            </NextIntlClientProvider>
          </Providers>
        </ThemeProvider>
      </body >
    </html >
  )
}