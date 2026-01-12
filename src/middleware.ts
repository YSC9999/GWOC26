import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('basho_token')
    const { pathname } = request.nextUrl

    // Protected Routes - admin only
    const adminRoutes = ['/admin']
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

    if (isAdminRoute) {
        if (!token) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }

        try {
            const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as any
            
            if (decoded.role !== 'admin') {
                // User is not an admin, redirect to home
                return NextResponse.redirect(new URL('/', request.url))
            }
        } catch (error) {
            // Invalid token, redirect to login
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
    ],
}
