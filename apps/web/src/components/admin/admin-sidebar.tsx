'use client'

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@app/ui'
import {
	Activity,
	ArrowLeft,
	BookOpen,
	Gift,
	LayoutDashboard,
	LogOut,
	MailPlus,
	MonitorSmartphone,
	Star,
	Users,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
	{ title: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
	{ title: 'Usuários', href: '/admin/usuarios', icon: Users },
	{ title: 'Disciplinas', href: '/admin/disciplinas', icon: BookOpen },
	{ title: 'Convites', href: '/admin/convites', icon: MailPlus },
	{ title: 'Privilegiados', href: '/admin/privilegiados', icon: Star },
	{ title: 'Cortesias', href: '/admin/cortesias', icon: Gift },
	{ title: 'Sessões', href: '/admin/sessoes', icon: MonitorSmartphone },
	{ title: 'Atividade', href: '/admin/atividade', icon: Activity },
]

export function AdminSidebar() {
	const pathname = usePathname()

	return (
		<Sidebar variant="sidebar" collapsible="icon">
			<SidebarHeader>
				<Link
					href="/admin"
					className="flex items-center gap-2.5 px-1 py-1 min-w-0"
				>
					<div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
						A
					</div>
					<span className="font-bold text-sm text-foreground tracking-tight truncate group-data-[collapsible=icon]:hidden">
						Corrige <span className="text-success">Go</span> <span className="text-muted-foreground font-medium">Admin</span>
					</span>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{NAV_ITEMS.map((item) => {
								const isActive =
									item.href === '/admin'
										? pathname === item.href
										: pathname.startsWith(item.href)

								return (
									<SidebarMenuItem key={item.href}>
										<SidebarMenuButton asChild isActive={isActive}>
											<Link href={item.href}>
												<item.icon />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								)
							})}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<Link href="/dashboard">
								<ArrowLeft />
								<span>Voltar ao Dashboard</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton asChild>
							<Link href="/sair">
								<LogOut />
								<span>Sair</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	)
}
