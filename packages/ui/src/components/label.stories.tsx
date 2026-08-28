import type { Meta, StoryObj } from '@storybook/react'
import { BookOpen, FileText, HelpCircle, Sparkles, User } from 'lucide-react'
import { Input } from './input'
import { Label } from './label'

const meta: Meta<typeof Label> = {
	title: 'Components/Label',
	component: Label,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente de rótulo acessível baseado no `@radix-ui/react-label`, com suporte a indicadores de obrigatoriedade, subtextos auxiliares, estados semânticos e ícones.',
			},
		},
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['xs', 'sm', 'default', 'lg'],
			description: 'Tamanho tipográfico do rótulo',
		},
		weight: {
			control: 'select',
			options: ['normal', 'medium', 'semibold', 'bold'],
			description: 'Peso da fonte',
		},
		status: {
			control: 'select',
			options: [
				'default',
				'muted',
				'destructive',
				'success',
				'warning',
				'info',
			],
			description: 'Estado semântico de cor',
		},
		required: {
			control: 'boolean',
			description: 'Indica se o campo associado é de preenchimento obrigatório',
		},
		optional: {
			control: 'boolean',
			description: 'Exibe indicador visual de campo opcional',
		},
		disabled: {
			control: 'boolean',
			description: 'Desabilita visualmente o rótulo',
		},
	},
}

export default meta
type Story = StoryObj<typeof Label>

export const Default: Story = {
	args: {
		children: 'Título da Avaliação',
		required: true,
	},
}

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-4 items-start">
			<Label size="xs">Extra Small (xs) - Código da Turma</Label>
			<Label size="sm">Small (sm) - Matéria / Disciplina</Label>
			<Label size="default">Default (md) - Nome da Prova</Label>
			<Label size="lg">Large (lg) - Instruções Gerais</Label>
		</div>
	),
}

export const Weights: Story = {
	render: () => (
		<div className="flex flex-col gap-4 items-start">
			<Label weight="normal">Normal: Informações adicionais</Label>
			<Label weight="medium">Medium: Nível de Dificuldade</Label>
			<Label weight="semibold">Semibold: Quantidade de Questões</Label>
			<Label weight="bold">Bold: Cabeçalho do Gabarito</Label>
		</div>
	),
}

export const SemanticStatus: Story = {
	render: () => (
		<div className="flex flex-col gap-4 items-start">
			<Label status="default">Default: Nome do Professor</Label>
			<Label status="muted">Muted: Campo desabilitado</Label>
			<Label status="destructive">
				Destructive: Campo com erro de validação
			</Label>
			<Label status="success">Success: Questão validada pela IA</Label>
			<Label status="warning">Warning: Revisão de OCR necessária</Label>
			<Label status="info">Info: Dica de geração com IA</Label>
		</div>
	),
}

export const WithIconsAndHelper: Story = {
	render: () => (
		<div className="flex flex-col gap-6 w-80">
			<Label
				htmlFor="exam-title"
				required
				leftIcon={<FileText />}
				rightIcon={
					<HelpCircle className="size-3.5 text-muted-foreground cursor-help" />
				}
				helperText="Informe um título claro para identificar a avaliação no diário."
			>
				Título da Avaliação
			</Label>
			<Input id="exam-title" placeholder="Ex: Prova Bimestral de História" />

			<Label
				htmlFor="prompt-ai"
				optional
				leftIcon={<Sparkles className="text-primary" />}
				helperText="Instruções para o modelo LLM gerar as questões automaticamente."
			>
				Prompt da IA
			</Label>
			<Input
				id="prompt-ai"
				placeholder="Ex: Crie 10 questões sobre a Era Vargas..."
			/>
		</div>
	),
}

export const AssociatedWithInput: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<div className="space-y-1.5">
				<Label htmlFor="teacher-name" required leftIcon={<User />}>
					Nome do Docente
				</Label>
				<Input id="teacher-name" placeholder="Prof. Pedro Santos" />
			</div>

			<div className="space-y-1.5">
				<Label htmlFor="subject-name" optional leftIcon={<BookOpen />}>
					Disciplina
				</Label>
				<Input id="subject-name" placeholder="Matemática Aplicada" />
			</div>
		</div>
	),
}
