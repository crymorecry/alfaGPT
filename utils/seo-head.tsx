import { Metadata } from 'next'

const SEO_HEAD_WATERMARK = 'Volency'
const DOMAIN = 'volency.vercel.app'
const SITE_URL = `https://${DOMAIN}`
const SITE_NAME = 'Volency — быстрая дистрибуция музыки'
const keywords =
    'дистрибуция музыки, Spotify, Apple Music, Яндекс.Музыка, VK Музыка, роялти, артисты, музыканты, стриминг, публикация музыки, музыкальная дистрибуция, volency, volency.ru'

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