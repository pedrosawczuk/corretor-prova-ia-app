import type { Meta, StoryObj } from '@storybook/react'
import {
	BookOpen,
	FileText,
	Filter,
	Plus,
	Printer,
	QrCode,
	Share2,
	Sparkles,
} from 'lucide-react'
import { Badge } from './badge'
import { Button } from './button'
import { Separator } from './separator'

const meta: Meta<typeof Separator> = {
	title: 'Components/Separator',
	component: Separator,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente Separator baseado no `@radix-ui/react-separator`, para divisão semântica de seções, toolbars, formulários e listas com suporte a texto intermediário, estilos pontilhados/tracejados e orientações.',
			},
		},
	},
	argTypes: {
		orientation: {
			control: 'select',
			options: ['horizontal', 'vertical'],
			description: 'Direção do divisor',
		},
		variant: {
			control: 'select',
			options: [
				'default',
				'subtle',
				'primary',
				'secondary',
				'destructive',
				'success',
				'warning',
				'info',
			],
			description: 'Cor e destaque semântico da linha',
		},
		thickness: {
			control: 'select',
			options: ['xs', 'sm', 'md'],
			description: 'Espessura da linha',
		},
		borderStyle: {
			control: 'select',
			options: ['solid', 'dashed', 'dotted'],
			description: 'Estilo do traço',
		},
		labelAlignment: {
			control: 'select',
			options: ['start', 'center', 'end'],
			description: 'Alinhamento do texto quando houver rótulo',
		},
	},
}

export default meta
type Story = StoryObj<typeof Separator>

export const Default: Story = {
	render: () => (
		<div className="w-80 space-y-3">
			<h4 className="text-sm font-semibold">Cabeçalho da Prova</h4>
			<p className="text-xs text-muted-foreground">
				Instruções gerais para preenchimento do gabarito.
			</p>
			<Separator />
			<p className="text-xs text-muted-foreground">
				Questão 1: Marque apenas uma alternativa por questão.
			</p>
		</div>
	),
}

export const WithLabels: Story = {
	render: () => (
		<div className="w-80 space-y-6">
			<Separator label="OU" />

			<Separator
				label="Gabarito Oficial"
				labelAlignment="start"
				variant="primary"
			/>

			<Separator
				label="Fim da Avaliação"
				labelAlignment="end"
				borderStyle="dashed"
			/>
		</div>
	),
}

export const VerticalInToolbar: Story = {
	render: () => (
		<div className="flex items-center gap-2 p-2 border rounded-xl bg-card shadow-xs">
			<Button size="icon-sm" variant="ghost" aria-label="Adicionar questão">
				<Plus />
			</Button>
			<Button size="icon-sm" variant="ghost" aria-label="Filtrar">
				<Filter />
			</Button>

			<div className="h-5">
				<Separator orientation="vertical" />
			</div>

			<Button size="sm" variant="outline" leftIcon={<Printer />}>
				Imprimir
			</Button>
			<Button size="sm" variant="outline" leftIcon={<QrCode />}>
				Gerar QR
			</Button>

			<div className="h-5">
				<Separator orientation="vertical" />
			</div>

			<Button size="icon-sm" variant="ghost" aria-label="Compartilhar">
				<Share2 />
			</Button>
		</div>
	),
}

export const BorderStyles: Story = {
	render: () => (
		<div className="w-80 space-y-6">
			<div>
				<span className="text-xs text-muted-foreground mb-2 block">Solid</span>
				<Separator borderStyle="solid" />
			</div>
			<div>
				<span className="text-xs text-muted-foreground mb-2 block">Dashed</span>
				<Separator borderStyle="dashed" />
			</div>
			<div>
				<span className="text-xs text-muted-foreground mb-2 block">Dotted</span>
				<Separator borderStyle="dotted" />
			</div>
		</div>
	),
}

export const SemanticColors: Story = {
	render: () => (
		<div className="w-80 space-y-4">
			<Separator variant="default" />
			<Separator variant="primary" thickness="sm" />
			<Separator variant="success" thickness="sm" />
			<Separator variant="warning" thickness="sm" />
			<Separator variant="destructive" thickness="sm" />
			<Separator variant="info" thickness="sm" />
		</div>
	),
}

export const ExamCardUseCase: Story = {
	render: () => (
		<div className="w-96 p-4 rounded-xl border bg-card shadow-xs space-y-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<FileText className="size-4 text-primary" />
					<h3 className="font-semibold text-sm">Prova Bimestral 1</h3>
				</div>
				<Badge variant="success-outline" size="sm" shape="pill" dot>
					FINALIZADA
				</Badge>
			</div>

			<p className="text-xs text-muted-foreground">
				Avaliação diagnóstica sobre História Geral e Revolução Francesa.
			</p>

			<Separator borderStyle="dashed" />

			<div className="flex items-center justify-between text-xs text-muted-foreground">
				<span className="flex items-center gap-1">
					<BookOpen className="size-3.5" /> História
				</span>
				<span>10 Questões</span>
				<span className="font-medium text-foreground">Valor: 10,0</span>
			</div>

			<Separator label="Ações Rápidas" />

			<div className="flex gap-2">
				<Button size="sm" variant="default" fullWidth leftIcon={<Sparkles />}>
					Escanear Respostas
				</Button>
				<Button size="sm" variant="outline">
					Visualizar
				</Button>
			</div>
		</div>
	),
}

