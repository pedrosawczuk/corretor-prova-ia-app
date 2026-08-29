import { cookies } from 'next/headers'

export interface AuthUser {
	id: string
	name: string
	email: string
	emailVerified: boolean
	image?: string | null
	phoneNumber?: string | null
	createdAt: string
	updatedAt: string
}

export interface AuthSession {
	id: string
	token: string
	userId: string
	createdAt: string
	updatedAt: string
	expiresAt: string
	ipAddress?: string | null
	userAgent?: string | null
}

export interface AuthSessionData {
	session: AuthSession
	user: AuthUser
}

async function authFetch(path: string) {
	const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'
	const cookieStore = await cookies()

	return fetch(`${apiUrl}/api/auth${path}`, {
		headers: { cookie: cookieStore.toString() },
		cache: 'no-store',
	})
}

export async function getAuthSession(): Promise<AuthSessionData | null> {
	try {
		const response = await authFetch('/get-session')
		if (!response.ok) return null
		return await response.json()
	} catch {
		return null
	}
}

export async function getAuthSessionsList(): Promise<AuthSession[] | null> {
	try {
		const response = await authFetch('/list-sessions')
		if (!response.ok) return null
		return await response.json()
	} catch {
		return null
	}
}
