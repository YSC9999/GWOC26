import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('basho_token')
    const { pathname } = request.nextUrl

    // Protected Routes
    const protectedRoutes = ['/admin', '/users']

    // Check if current path starts with any protected route
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url)
        // Add redirect param so we can send them back after login
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/users/:path*',
    ],
}
