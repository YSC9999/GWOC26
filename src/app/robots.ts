import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/account/', '/api/'],
        },
        sitemap: 'https://basho-byy-shivangi.vercel.app/sitemap.xml',
    }
}
