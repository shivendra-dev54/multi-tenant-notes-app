import { NextResponse, NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
    const accessToken = request.cookies.get('access_token')?.value

    const isApi = request.nextUrl.pathname.startsWith('/api/')

    if (!accessToken) {
        if (isApi) {
            return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
                status: 401,
                headers: { 'content-type': 'application/json' },
            })
        }

        return NextResponse.redirect(new URL('/', request.url))
    }

    try {
        const secret = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET ?? '')
        const { payload } = await jwtVerify(accessToken, secret)

        const requestHeaders = new Headers(request.headers)
        try {
            requestHeaders.set('x-user', JSON.stringify(payload))
        } catch (e) {
            requestHeaders.set('x-user', JSON.stringify({ sub: payload.sub ?? null }))
            console.log(e);
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    } catch (err) {
        console.error('Auth error:', err)
        if (isApi) {
            return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
                status: 401,
                headers: { 'content-type': 'application/json' },
            })
        }

        return NextResponse.redirect(new URL('/', request.url))
    }
}

// protected routes
export const config = {
    matcher: [
        '/about/:path*',
        '/dashboard/:path*',
        '/api/tenant/:path*',
        '/api/note/:path*',
        '/api/user/:path*',
        '/api/admin/:path*',
    ],
}
