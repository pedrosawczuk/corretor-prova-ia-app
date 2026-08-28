import type { Meta, StoryObj } from '@storybook/react'
import {
	Bell,
	BookOpen,
	ChevronRight,
	HelpCircle,
	Search,
	Sparkles,
} from 'lucide-react'
import { Badge } from './badge'
import { Button } from './button'
import {
	Header,
	HeaderActions,
	HeaderBrand,
	HeaderDivider,
	HeaderNav,
	HeaderNavItem,
} from './header'
import { Input } from './input'

const meta: Meta<typeof Header> = {
	title: 'Components/Header',
	component: Header,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Componente de cabeçalho principal do **Gabarita.app**, atendendo tanto a Landing Page pública com efeito de vidro fosco (`glass`), quanto a Topbar privada com barra de ferramentas e perfil do docente.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'glass', 'floating', 'transparent', 'bordered'],
			description: 'Estilo visual da superfície do header',
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
			description: 'Altura e espaçamento do cabeçalho',
		},
	},
}

export default meta
type Story = StoryObj<typeof Header>

export const PublicLandingPageHeader: Story = {
	render: () => (
		<div className="min-h-48 bg-muted/20">
			<Header variant="glass">
				<HeaderBrand>
					<div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
						G
					</div>
					<span className="text-base font-bold text-foreground tracking-tight">
						Gabarita<span className="text-primary">.app</span>
					</span>
				</HeaderBrand>

				<HeaderNav>
					<HeaderNavItem href="#recursos" isActive>
						Recursos
					</HeaderNavItem>
					<HeaderNavItem href="#scanner">Como Funciona</HeaderNavItem>
					<HeaderNavItem href="#precos">Preços & Planos</HeaderNavItem>
					<HeaderNavItem href="#faq">Dúvidas Frequentes</HeaderNavItem>
				</HeaderNav>

				<HeaderActions>
					<Button variant="ghost" size="sm">
						Entrar
					</Button>
					<Button variant="default" size="sm" leftIcon={<Sparkles />}>
						Começar Grátis
					</Button>
				</HeaderActions>
			</Header>
		</div>
	),
}

export const FloatingLandingHeader: Story = {
	render: () => (
		<div className="min-h-48 bg-gradient-to-b from-primary/5 via-transparent to-transparent p-4">
			<Header variant="floating">
				<HeaderBrand>
					<div className="size-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
						G
					</div>
					<span className="text-sm font-bold text-foreground">
						Gabarita.app
					</span>
					<Badge size="xs" variant="primary">
						BETA
					</Badge>
				</HeaderBrand>

				<HeaderNav>
					<HeaderNavItem href="#sobre">Plataforma</HeaderNavItem>
					<HeaderNavItem href="#instituicoes">Para Escolas</HeaderNavItem>
					<HeaderNavItem href="#seguranca">Segurança</HeaderNavItem>
				</HeaderNav>

				<HeaderActions>
					<Button variant="outline" size="sm">
						Login Docente
					</Button>
					<Button variant="default" size="sm">
						Criar Conta
					</Button>
				</HeaderActions>
			</Header>
		</div>
	),
}

export const PrivateDashboardTopbar: Story = {
	render: () => (
		<div className="min-h-48 bg-muted/20">
			<Header variant="default" size="sm">
				<div className="flex items-center gap-2">
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<BookOpen className="size-3.5" />
						<span>Turmas</span>
						<ChevronRight className="size-3 text-muted-foreground/60" />
						<span className="font-semibold text-foreground">
							8º Ano A - História
						</span>
					</div>
				</div>

				<div className="hidden sm:block w-72">
					<Input
						size="xs"
						placeholder="Buscar avaliação ou aluno..."
						leftIcon={<Search />}
					/>
				</div>

				<HeaderActions>
					<Button size="icon-xs" variant="ghost" aria-label="Notificações">
						<Bell className="size-4 text-muted-foreground" />
					</Button>
					<Button size="icon-xs" variant="ghost" aria-label="Ajuda">
						<HelpCircle className="size-4 text-muted-foreground" />
					</Button>

					<HeaderDivider />

					<div className="flex items-center gap-2">
						<div className="size-7 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-xs">
							PS
						</div>
						<div className="hidden md:flex flex-col text-left">
							<span className="text-xs font-semibold leading-none">
								Prof. Pedro
							</span>
							<span className="text-[10px] text-muted-foreground">Docente</span>
						</div>
					</div>
				</HeaderActions>
			</Header>
		</div>
	),
}

