import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const DASHBOARD_ROUTES = ['/overview', '/attendance', '/leave', '/employees', '/departments', '/positions', '/settings']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isDashboardRoute = DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  )

  const isOnboarding = pathname === '/onboarding'
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isDashboardRoute && user) {
    const onboardingComplete = user.user_metadata?.onboarding_complete === true
    if (!onboardingComplete) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  if (isOnboarding && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isOnboarding && user) {
    const onboardingComplete = user.user_metadata?.onboarding_complete === true
    if (onboardingComplete) {
      return NextResponse.redirect(new URL('/overview', request.url))
    }
  }

  if (isAuthPage && user) {
    const onboardingComplete = user.user_metadata?.onboarding_complete === true
    return NextResponse.redirect(
      new URL(onboardingComplete ? '/overview' : '/onboarding', request.url)
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}