import { SidebarInset, SidebarProvider, SidebarTrigger } from '@app/ui'
import { redirect } from 'next/navigation'
import type * as React from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { getAuthSession } from '@/lib/auth-server'

// Keep in sync with ADMIN_SESSION_FRESH_MINUTES in apps/api/src/lib/auth/get-authenticated-admin.ts
const ADMIN_SESSION_FRESH_MINUTES = 30

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const authSession = await getAuthSession()

	if (!authSession) {
		redirect('/entrar')
	}

	if (authSession.user.role !== 'admin') {
		redirect('/dashboard')
	}

	if (!authSession.user.twoFactorEnabled) {
		redirect('/dashboard/configuracoes?ativar-2fa=admin')
	}

	const sessionAgeMinutes =
		(Date.now() - new Date(authSession.session.createdAt).getTime()) / 60_000

	if (sessionAgeMinutes > ADMIN_SESSION_FRESH_MINUTES) {
		redirect('/entrar')
	}

	return (
		<SidebarProvider>
			<AdminSidebar />

			<SidebarInset>
				<div className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-4 md:hidden">
					<SidebarTrigger />
				</div>

				{children}
			</SidebarInset>
		</SidebarProvider>
	)
}
