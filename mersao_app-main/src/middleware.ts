import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Protege /admin: sem sessão válida, volta para /login.
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const { pathname } = request.nextUrl

  if (!url || !key) {
    if (pathname.startsWith('/admin')) return NextResponse.redirect(new URL('/login', request.url))
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(list: any[]) {
        list.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  return response
}

export const config = { matcher: ['/admin/:path*', '/login'] }
