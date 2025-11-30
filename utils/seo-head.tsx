import { Metadata } from 'next'

const SEO_HEAD_WATERMARK = 'Alfa Copilot'
const DOMAIN = 'alfa-copilot.vercel.app'
const SITE_URL = `https://${DOMAIN}`
const SITE_NAME = 'Alfa Copilot — бизнес-помощник с ИИ'
const keywords =
    'бизнес-помощник, ИИ-ассистент, управление финансами, управление задачами, работники, аналитика, alfa copilot, бизнес-инструменты'

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