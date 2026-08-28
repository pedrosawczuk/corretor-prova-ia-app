import { SidebarInset, SidebarProvider, SidebarTrigger } from '@app/ui'
import type * as React from 'react'
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'

export default function PrivateLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<SidebarProvider>
			<DashboardSidebar />

			<SidebarInset>
				<div className="flex h-12 shrink-0 items-center gap-2 border-b border-border/60 px-4 md:hidden">
					<SidebarTrigger />
				</div>

				{children}
			</SidebarInset>
		</SidebarProvider>
	)
}
