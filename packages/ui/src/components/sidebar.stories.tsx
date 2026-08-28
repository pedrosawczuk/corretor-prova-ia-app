import type { Meta, StoryObj } from '@storybook/react'
import {
	BookOpen,
	Camera,
	FileText,
	GraduationCap,
	LayoutDashboard,
	LogOut,
	MoreVertical,
	Plus,
	Sparkles,
} from 'lucide-react'
import { Badge } from './badge'
import { Button } from './button'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from './sidebar'

const meta: Meta<typeof Sidebar> = {
	title: 'Components/Sidebar',
	component: Sidebar,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Barra lateral de navegação completa e responsiva do **Gabarita.app**. Suporta colapso para modo ícones, gaveta mobile com overlay, atalho global de teclado (`Ctrl+B` / `⌘B`), grupos de navegação, badges de notificação e menus aninhados.',
			},
		},
	},
}

export default meta
type Story = StoryObj<typeof Sidebar>

export const GabaritaAppSidebar: Story = {
	render: () => (
		<SidebarProvider defaultOpen>
			<Sidebar variant="sidebar" collapsible="icon">
				<SidebarHeader>
					<div className="flex items-center justify-between px-1 py-1">
						<div className="flex items-center gap-2.5 min-w-0">
							<div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
								G
							</div>
							<div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
								<span className="font-bold text-sm text-foreground tracking-tight flex items-center gap-1.5">
									Gabarita.app
									<Badge size="xs" variant="primary">
										AI
									</Badge>
								</span>
								<span className="text-[11px] text-muted-foreground truncate">
									Colégio São Paulo
								</span>
							</div>
						</div>
					</div>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton isActive>
										<LayoutDashboard />
										<span>Painel Geral</span>
									</SidebarMenuButton>
								</SidebarMenuItem>

								<SidebarMenuItem>
									<SidebarMenuButton>
										<Sparkles className="text-primary" />
										<span>Gerar Prova com IA</span>
									</SidebarMenuButton>
								</SidebarMenuItem>

								<SidebarMenuItem>
									<SidebarMenuButton>
										<FileText />
										<span>Minhas Avaliações</span>
									</SidebarMenuButton>
								</SidebarMenuItem>

								<SidebarMenuItem>
									<SidebarMenuButton>
										<Camera className="text-success" />
										<span>Modo Scanner</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>

					<SidebarGroup>
						<div className="flex items-center justify-between">
							<SidebarGroupLabel>Minhas Turmas</SidebarGroupLabel>
							<SidebarGroupAction aria-label="Criar nova turma">
								<Plus />
							</SidebarGroupAction>
						</div>
						<SidebarGroupContent>
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton>
										<BookOpen />
										<span>8º Ano A - História</span>
									</SidebarMenuButton>
									<SidebarMenuAction aria-label="Mais opções">
										<MoreVertical />
									</SidebarMenuAction>
								</SidebarMenuItem>

								<SidebarMenuItem>
									<SidebarMenuButton>
										<BookOpen />
										<span>9º Ano B - História</span>
									</SidebarMenuButton>
								</SidebarMenuItem>

								<SidebarMenuItem>
									<SidebarMenuButton>
										<GraduationCap />
										<span>3º EM - Sociologia</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>

				<SidebarFooter>
					<div className="flex items-center justify-between p-1 rounded-xl bg-muted/40 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent">
						<div className="flex items-center gap-2.5 min-w-0">
							<div className="size-8 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-xs shrink-0">
								PS
							</div>
							<div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
								<span className="text-xs font-semibold text-foreground truncate">
									Prof. Pedro Santos
								</span>
								<span className="text-[10px] text-muted-foreground">
									Plano PRO Docente
								</span>
							</div>
						</div>
						<Button
							size="icon-xs"
							variant="ghost"
							className="group-data-[collapsible=icon]:hidden"
							aria-label="Sair"
						>
							<LogOut className="size-3.5 text-muted-foreground" />
						</Button>
					</div>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-card px-4">
					<div className="flex items-center gap-2">
						<SidebarTrigger />
						<div className="h-4 w-px bg-border" />
						<span className="text-sm font-semibold">Painel de Avaliações</span>
					</div>
					<Button size="sm" variant="default" leftIcon={<Sparkles />}>
						Criar Nova Prova
					</Button>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-6 bg-muted/20">
					<div className="grid auto-rows-min gap-4 md:grid-cols-3">
						<div className="h-32 rounded-2xl bg-card border p-4 shadow-xs flex flex-col justify-between">
							<span className="text-xs text-muted-foreground">
								Provas Criadas
							</span>
							<strong className="text-2xl font-bold">14</strong>
							<span className="text-xs text-success flex items-center gap-1">
								+3 esta semana
							</span>
						</div>
						<div className="h-32 rounded-2xl bg-card border p-4 shadow-xs flex flex-col justify-between">
							<span className="text-xs text-muted-foreground">
								Folhas Escaneadas
							</span>
							<strong className="text-2xl font-bold">428</strong>
							<span className="text-xs text-primary flex items-center gap-1">
								IA Vision 99.2% confiança
							</span>
						</div>
						<div className="h-32 rounded-2xl bg-card border p-4 shadow-xs flex flex-col justify-between">
							<span className="text-xs text-muted-foreground">
								Tempo Economizado
							</span>
							<strong className="text-2xl font-bold">18h</strong>
							<span className="text-xs text-muted-foreground">
								Estimativa mensal
							</span>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	),
}

