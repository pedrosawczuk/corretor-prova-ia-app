import type { Meta, StoryObj } from '@storybook/react'
import {
	AlertCircle,
	AlertTriangle,
	Award,
	BookOpen,
	Bot,
	CheckCircle,
	Clock,
	FileText,
	Info,
	Sparkles,
	Users,
} from 'lucide-react'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
	title: 'Components/Badge',
	component: Badge,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente Badge de status e categorização, suportando variantes semânticas, dots com animação de pulso, ícones, botão de remoção (dismiss) e links acessíveis.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: [
				'default',
				'secondary',
				'outline',
				'destructive',
				'destructive-outline',
				'success',
				'success-outline',
				'warning',
				'warning-outline',
				'info',
				'info-outline',
				'subtle',
				'ghost',
			],
			description: 'Variante visual e semântica do badge',
		},
		size: {
			control: 'select',
			options: ['xs', 'sm', 'default', 'lg'],
			description: 'Escala de tamanho',
		},
		shape: {
			control: 'select',
			options: ['default', 'pill', 'square'],
			description: 'Formato da borda',
		},
		dot: {
			control: 'boolean',
			description: 'Exibe indicador circular de status',
		},
		pulse: {
			control: 'boolean',
			description: 'Animação de pulso no indicador dot',
		},
		interactive: {
			control: 'boolean',
			description:
				'Aplica estilos de cursor e micro-interação ao passar o mouse',
		},
	},
}

export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
	args: {
		children: '8º Ano - História',
		variant: 'default',
		size: 'default',
	},
}

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-6 max-w-2xl">
			<div>
				<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
					Variantes Principais & Neutras
				</h4>
				<div className="flex flex-wrap items-center gap-2.5">
					<Badge variant="default">Primary (Linear Violet)</Badge>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="outline">Outline</Badge>
					<Badge variant="subtle">Subtle</Badge>
					<Badge variant="ghost">Ghost</Badge>
				</div>
			</div>

			<div>
				<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
					Feedback Sólido
				</h4>
				<div className="flex flex-wrap items-center gap-2.5">
					<Badge variant="success" leftIcon={<CheckCircle />}>
						100% Acertos
					</Badge>
					<Badge variant="warning" leftIcon={<AlertTriangle />}>
						Requer Revisão
					</Badge>
					<Badge variant="destructive" leftIcon={<AlertCircle />}>
						Resposta Incorreta
					</Badge>
					<Badge variant="info" leftIcon={<Info />}>
						Visão Computacional
					</Badge>
				</div>
			</div>

			<div>
				<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
					Feedback Outline / Sutil
				</h4>
				<div className="flex flex-wrap items-center gap-2.5">
					<Badge variant="success-outline" leftIcon={<CheckCircle />}>
						Gabarito Homologado
					</Badge>
					<Badge variant="warning-outline" leftIcon={<Clock />}>
						Dúvida na Alternativa
					</Badge>
					<Badge variant="destructive-outline" leftIcon={<AlertCircle />}>
						Falha no Scan
					</Badge>
					<Badge variant="info-outline" leftIcon={<Bot />}>
						Gerado por IA
					</Badge>
				</div>
			</div>
		</div>
	),
}

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge size="xs">Extra Small (xs)</Badge>
			<Badge size="sm">Small (sm)</Badge>
			<Badge size="default">Default (md)</Badge>
			<Badge size="lg">Large (lg)</Badge>
		</div>
	),
}

export const Shapes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge shape="default">Default Radius (8px)</Badge>
			<Badge shape="pill" variant="secondary" leftIcon={<Sparkles />}>
				Pill Radius (Full)
			</Badge>
			<Badge shape="square" variant="outline">
				Square Radius (0px)
			</Badge>
		</div>
	),
}

export const StatusDotsAndPills: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Badge variant="outline" shape="pill" dot>
				Rascunho
			</Badge>
			<Badge variant="warning-outline" shape="pill" dot pulse>
				Corrigindo prova via IA...
			</Badge>
			<Badge variant="success-outline" shape="pill" dot>
				Finalizada
			</Badge>
			<Badge variant="default" shape="pill" dot pulse leftIcon={<Bot />}>
				Streaming Ativo
			</Badge>
		</div>
	),
}

export const Dismissable: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-2.5">
			<Badge
				variant="secondary"
				shape="pill"
				leftIcon={<BookOpen />}
				onDismiss={() => alert('Filtro removido')}
			>
				História do Brasil
			</Badge>
			<Badge
				variant="outline"
				leftIcon={<Users />}
				onDismiss={() => alert('Turma removida')}
			>
				9º Ano B
			</Badge>
			<Badge
				variant="info-outline"
				leftIcon={<Award />}
				onDismiss={() => alert('Critério removido')}
			>
				Peso 2.0
			</Badge>
		</div>
	),
}

export const UseCasesInApp: Story = {
	render: () => (
		<div className="p-4 border rounded-xl bg-card max-w-md space-y-4">
			<div className="flex items-center justify-between border-b pb-3">
				<div className="flex items-center gap-2">
					<FileText className="size-4 text-primary" />
					<h3 className="font-semibold text-sm text-foreground">
						Prova Bimestral 1
					</h3>
				</div>
				<Badge variant="success-outline" shape="pill" dot>
					FINALIZADA
				</Badge>
			</div>

			<div className="flex flex-wrap gap-2">
				<Badge variant="secondary" size="sm" leftIcon={<Users />}>
					32 Alunos
				</Badge>
				<Badge variant="outline" size="sm">
					10 Questões
				</Badge>
				<Badge variant="info-outline" size="sm" leftIcon={<Bot />}>
					Confiança IA: 98%
				</Badge>
			</div>
		</div>
	),
}
