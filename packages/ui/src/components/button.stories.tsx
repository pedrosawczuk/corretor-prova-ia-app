import type { Meta, StoryObj } from '@storybook/react'
import {
	AlertTriangle,
	ArrowRight,
	CheckCircle,
	Download,
	ExternalLink,
	FileText,
	HelpCircle,
	Info,
	Plus,
	Send,
	Settings,
	Sparkles,
	Trash2,
} from 'lucide-react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
	title: 'Components/Button',
	component: Button,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente de botão principal do Design System, implementando o tema Linear Violet (#6E56CF), Obsidian Dark, variantes semânticas e acessibilidade WCAG com feedback tátil e estados de carregamento.',
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
				'ghost',
				'link',
				'destructive',
				'destructive-outline',
				'success',
				'success-outline',
				'warning',
				'warning-outline',
				'info',
				'info-outline',
				'subtle',
			],
			description: 'Variante visual e semântica do botão',
		},
		size: {
			control: 'select',
			options: [
				'xs',
				'sm',
				'default',
				'lg',
				'xl',
				'icon-xs',
				'icon-sm',
				'icon',
				'icon-lg',
			],
			description: 'Escala de tamanho e alvos de toque',
		},
		shape: {
			control: 'select',
			options: ['default', 'pill', 'square'],
			description: 'Formato do raio de borda',
		},
		isLoading: {
			control: 'boolean',
			description: 'Exibe o indicador de carregamento e bloqueia interação',
		},
		disabled: {
			control: 'boolean',
			description: 'Desabilita o botão para interação',
		},
		fullWidth: {
			control: 'boolean',
			description: 'Expande o botão para ocupar 100% da largura do contêiner',
		},
	},
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
	args: {
		children: 'Criar Avaliação com IA',
		variant: 'default',
		size: 'default',
	},
}

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-6 max-w-3xl">
			<div>
				<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
					Ações Principais & Neutras
				</h4>
				<div className="flex flex-wrap items-center gap-3">
					<Button variant="default">Primary (Main)</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="subtle">Subtle</Button>
					<Button variant="link">Link Button</Button>
				</div>
			</div>

			<div>
				<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
					Ações de Destruição / Exclusão (Danger)
				</h4>
				<div className="flex flex-wrap items-center gap-3">
					<Button variant="destructive" leftIcon={<Trash2 />}>
						Excluir Prova
					</Button>
					<Button variant="destructive-outline" leftIcon={<Trash2 />}>
						Remover Aluno
					</Button>
				</div>
			</div>

			<div>
				<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
					Feedback & Suporte (Success, Warning, Info)
				</h4>
				<div className="flex flex-wrap items-center gap-3">
					<Button variant="success" leftIcon={<CheckCircle />}>
						Aprovar Gabarito
					</Button>
					<Button variant="success-outline" leftIcon={<CheckCircle />}>
						Concluído
					</Button>
					<Button variant="warning" leftIcon={<AlertTriangle />}>
						Revisão Necessária
					</Button>
					<Button variant="warning-outline" leftIcon={<AlertTriangle />}>
						Atenção
					</Button>
					<Button variant="info" leftIcon={<Info />}>
						Dica do Assistente
					</Button>
					<Button variant="info-outline" leftIcon={<Info />}>
						Saiba mais
					</Button>
				</div>
			</div>
		</div>
	),
}

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button size="xs">Extra Small (xs)</Button>
			<Button size="sm">Small (sm)</Button>
			<Button size="default">Default (md)</Button>
			<Button size="lg">Large (lg)</Button>
			<Button size="xl">Extra Large (xl)</Button>
		</div>
	),
}

export const WithIcons: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button leftIcon={<Sparkles />}>Gerar com IA</Button>
			<Button rightIcon={<ArrowRight />} variant="secondary">
				Continuar para Gabarito
			</Button>
			<Button
				leftIcon={<Download />}
				rightIcon={<FileText />}
				variant="outline"
			>
				Exportar Prova PDF
			</Button>
			<Button leftIcon={<Send />} variant="success">
				Publicar para Alunos
			</Button>
		</div>
	),
}

export const IconOnly: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<Button size="icon-xs" variant="outline" aria-label="Adicionar item">
				<Plus />
			</Button>
			<Button size="icon-sm" variant="secondary" aria-label="Configurações">
				<Settings />
			</Button>
			<Button
				size="icon"
				variant="default"
				aria-label="Gerar com Inteligência Artificial"
			>
				<Sparkles />
			</Button>
			<Button size="icon-lg" variant="destructive-outline" aria-label="Excluir">
				<Trash2 />
			</Button>
			<Button size="icon" variant="ghost" shape="pill" aria-label="Ajuda">
				<HelpCircle />
			</Button>
		</div>
	),
}

export const LoadingStates: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button isLoading>Salvando...</Button>
			<Button
				isLoading
				loadingText="Gerando questões com IA..."
				variant="default"
				size="lg"
			>
				Gerar Prova
			</Button>
			<Button isLoading variant="secondary">
				Carregando
			</Button>
			<Button isLoading variant="destructive-outline">
				Excluindo
			</Button>
			<Button
				size="icon"
				isLoading
				variant="outline"
				aria-label="Processando"
			/>
		</div>
	),
}

export const Shapes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button shape="default">Default Radius (8px)</Button>
			<Button shape="pill" leftIcon={<Sparkles />}>
				Pill Radius (Full)
			</Button>
			<Button shape="square" variant="outline">
				Square Radius (0px)
			</Button>
		</div>
	),
}

export const FullWidth: Story = {
	render: () => (
		<div className="w-80 p-4 border rounded-xl bg-card space-y-3">
			<p className="text-xs text-muted-foreground text-center">
				Contêiner de 320px
			</p>
			<Button fullWidth leftIcon={<Sparkles />}>
				Iniciar Correção Automática
			</Button>
			<Button fullWidth variant="outline">
				Voltar ao Painel
			</Button>
		</div>
	),
}

export const DisabledStates: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-3">
			<Button disabled>Primary Desabilitado</Button>
			<Button disabled variant="secondary">
				Secondary Desabilitado
			</Button>
			<Button disabled variant="outline" leftIcon={<Download />}>
				Outline Desabilitado
			</Button>
			<Button disabled variant="destructive" leftIcon={<Trash2 />}>
				Destructive Desabilitado
			</Button>
		</div>
	),
}

export const AsLink: Story = {
	render: () => (
		<div className="flex items-center gap-3">
			<Button asChild variant="default" rightIcon={<ExternalLink />}>
				<a href="https://nextjs.org" target="_blank" rel="noopener noreferrer">
					Acessar Documentação
				</a>
			</Button>
			<Button asChild variant="link">
				<a href="/login">Já possui uma conta? Faça login</a>
			</Button>
		</div>
	),
}
