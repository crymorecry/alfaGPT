import { Metadata } from 'next'

const SEO_HEAD_WATERMARK = 'Volency'
const DOMAIN = '130.193.57.26:3000'
const SITE_URL = `http://${DOMAIN}`
const SITE_NAME = 'Volency — бизнес-помощник с ИИ'
const keywords =
    'бизнес-помощник, ИИ-ассистент, управление финансами, управление задачами, работники, аналитика, Volency, бизнес-инструменты'

export interface ISEOMetadataProps {
    title: string
    description: string
    watermark?: boolean
    ogURL?: string
    ogType?: string
    index?: boolean
    url?: string
}

export function generateMetadata(props: ISEOMetadataProps): Metadata {
    const {
        title,
        watermark = true,
        ogURL = '/default_og.jpg',
        ogType = 'website',
        description,
        index = true,
        url,
    } = props

    const finalTitle = watermark ? `${title} | ${SEO_HEAD_WATERMARK}` : title
    const absoluteOgImage = ogURL.startsWith('http') ? ogURL : `${SITE_URL}${ogURL}`
    const absoluteUrl = url ? (url.startsWith('http') ? url : `${SITE_URL}${url}`) : SITE_URL

    return {
        title: finalTitle,
        description: description,
        keywords: keywords,
        authors: [{ name: SITE_NAME }],
        publisher: SITE_NAME,
        robots: index ? 'index, follow' : 'noindex, nofollow',
        icons: {
            icon: [
                { url: '/favicon/favicon.ico', sizes: 'any' },
                { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
                { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
            ],
            apple: [
                { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
            ],
        },
        appleWebApp: {
            title: 'Volency',
        },
        openGraph: {
            type: ogType as 'website' | 'article',
            title: finalTitle,
            description: description,
            siteName: SITE_NAME,
            url: absoluteUrl,
            images: [
                {
                    url: absoluteOgImage,
                    width: 1200,
                    height: 630,
                    alt: finalTitle,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: finalTitle,
            description: description,
            images: [absoluteOgImage],
        },
    }
}