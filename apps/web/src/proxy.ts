import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'

const AUTH_ROUTES = [
	'/entrar',
	'/criar-conta',
	'/recuperar-senha',
	'/redefinir-senha',
]
const PUBLIC_INFORMATIVE_ROUTES = ['/', '/privacidade', '/termos', '/sair']

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl
	const sessionCookie = getSessionCookie(request)

	const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))
	const isPublicRoute =
		isAuthRoute || PUBLIC_INFORMATIVE_ROUTES.some((route) => pathname === route)
	const isPrivateRoute = !isPublicRoute

	if (isPrivateRoute && !sessionCookie) {
		const signInUrl = request.nextUrl.clone()
		signInUrl.pathname = '/entrar'
		return NextResponse.redirect(signInUrl)
	}

	if (isAuthRoute && sessionCookie) {
		const dashboardUrl = request.nextUrl.clone()
		dashboardUrl.pathname = '/dashboard'
		return NextResponse.redirect(dashboardUrl)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
