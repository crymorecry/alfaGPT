import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['ru'],
  defaultLocale: 'ru'
});
 
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)','/dashboard/:path*']
}