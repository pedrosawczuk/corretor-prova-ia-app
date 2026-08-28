import type { Meta, StoryObj } from '@storybook/react'
import {
	Bold,
	Code,
	FileText,
	HelpCircle,
	Italic,
	List,
	Send,
	Sparkles,
} from 'lucide-react'
import { Button } from './button'
import { Textarea } from './textarea'

const meta: Meta<typeof Textarea> = {
	title: 'Components/Textarea',
	component: Textarea,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente de �rea de texto expans�vel com suporte a temas, contador de caracteres com feedback de limite, slots de cabe�alho/rodap� e valida��o acess�vel.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'filled', 'outline', 'ghost', 'underlined'],
			description: 'Estilo visual da caixa de texto',
		},
		status: {
			control: 'select',
			options: ['default', 'error', 'success', 'warning'],
			description: 'Estado de valida��o',
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg', 'xl'],
			description: 'Tamanho da fonte e altura m�nima',
		},
		shape: {
			control: 'select',
			options: ['default', 'rounded', 'square'],
			description: 'Formato do raio de borda',
		},
		resize: {
			control: 'select',
			options: ['none', 'vertical', 'horizontal', 'both'],
			description: 'Controle de redimensionamento pelo usu�rio',
		},
		showCount: {
			control: 'boolean',
			description: 'Exibe o contador de caracteres em tempo real',
		},
		maxLength: {
			control: 'number',
			description: 'Limite m�ximo de caracteres permitidos',
		},
		disabled: {
			control: 'boolean',
		},
	},
}

export default meta
type Story = StoryObj<typeof Textarea>

export const Primary: Story = {
	args: {
		label: 'Instru��es para a IA',
		placeholder:
			'Ex: Crie 5 quest�es sobre a Revolu��o Francesa com foco em causas econ�micas...',
		helperText:
			'Voc� pode especificar o n�vel de dificuldade, n�mero de alternativas e gabarito detalhado.',
		variant: 'default',
		size: 'default',
		showCount: true,
		maxLength: 500,
	},
}

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-6 w-96">
			<Textarea
				variant="default"
				label="Variante: Default"
				placeholder="�rea de texto padr�o com borda suave"
			/>
			<Textarea
				variant="filled"
				label="Variante: Filled"
				placeholder="�rea de texto com fundo preenchido"
			/>
			<Textarea
				variant="outline"
				label="Variante: Outline"
				placeholder="�rea de texto com borda espessa de 2px"
			/>
			<Textarea
				variant="ghost"
				label="Variante: Ghost"
				placeholder="Sem borda, destaca ao focar"
			/>
			<Textarea
				variant="underlined"
				label="Variante: Underlined"
				placeholder="Linha inferior para layouts editoriais"
			/>
		</div>
	),
}

export const ValidationStates: Story = {
	render: () => (
		<div className="flex flex-col gap-5 w-96">
			<Textarea
				label="Estado Normal"
				placeholder="Digite as observa��es da prova..."
				helperText="Informa��es adicionais para os alunos."
			/>
			<Textarea
				label="Estado de Erro"
				defaultValue="Texto muito curto"
				errorMessage="O enunciado da quest�o dissertativa deve conter pelo menos 30 caracteres."
			/>
			<Textarea
				label="Estado de Sucesso"
				defaultValue="Rubrica de corre��o e crit�rios de pontua��o definidos com sucesso."
				status="success"
				helperText="Crit�rios aprovados!"
			/>
			<Textarea
				label="Estado de Alerta (Warning)"
				defaultValue="Aten��o: este comando pode sobrescrever o gabarito original salvo."
				status="warning"
				helperText="Verifique antes de salvar."
			/>
		</div>
	),
}

export const CharacterCounter: Story = {
	render: () => (
		<div className="flex flex-col gap-5 w-96">
			<Textarea
				label="Contador Sem Limite M�ximo"
				showCount
				placeholder="Digite livremente..."
			/>
			<Textarea
				label="Contador com Limite (100 caracteres)"
				showCount
				maxLength={100}
				defaultValue="Este texto j� preencheu parte do limite estabelecido para a descri��o."
				helperText="Muda de cor ao aproximar de 90% do limite."
			/>
		</div>
	),
}

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-96">
			<Textarea size="sm" placeholder="Tamanho Small (sm - min-h 64px)" />
			<Textarea
				size="default"
				placeholder="Tamanho Default (md - min-h 96px)"
			/>
			<Textarea size="lg" placeholder="Tamanho Large (lg - min-h 128px)" />
			<Textarea
				size="xl"
				placeholder="Tamanho Extra Large (xl - min-h 160px)"
			/>
		</div>
	),
}

export const WithToolbarHeader: Story = {
	render: () => (
		<div className="w-96">
			<Textarea
				label="Editor de Enunciado de Quest�o"
				placeholder="Escreva o enunciado completo da quest�o aqui..."
				headerSlot={
					<>
						<div className="flex items-center gap-1">
							<Button size="icon-xs" variant="ghost" aria-label="Negrito">
								<Bold />
							</Button>
							<Button size="icon-xs" variant="ghost" aria-label="It�lico">
								<Italic />
							</Button>
							<Button size="icon-xs" variant="ghost" aria-label="Lista">
								<List />
							</Button>
							<Button size="icon-xs" variant="ghost" aria-label="C�digo">
								<Code />
							</Button>
						</div>
						<span className="text-[11px] text-muted-foreground">
							Markdown suportado
						</span>
					</>
				}
				footerSlot={
					<Button size="xs" variant="ghost" leftIcon={<HelpCircle />}>
						Ajuda de formata��o
					</Button>
				}
				showCount
				maxLength={1000}
			/>
		</div>
	),
}

export const WithAIPromptAction: Story = {
	render: () => (
		<div className="w-96">
			<Textarea
				label="Gerador de Avalia��o por IA"
				variant="filled"
				shape="rounded"
				placeholder="Descreva o conte�do, n�vel da turma e quantidade de quest�es..."
				defaultValue="Gere uma prova de Biologia sobre Gen�tica Mendeliana com 5 quest�es de m�ltipla escolha e 2 dissertativas."
				footerSlot={
					<div className="flex items-center gap-2">
						<Button size="xs" variant="outline" leftIcon={<FileText />}>
							Usar Modelo
						</Button>
					</div>
				}
				headerSlot={
					<div className="flex items-center justify-between w-full">
						<span className="flex items-center gap-1.5 font-medium text-primary text-xs">
							<Sparkles className="size-3.5" />
							Assistente IA Corretor
						</span>
						<Button size="xs" variant="default" leftIcon={<Send />}>
							Gerar Prova
						</Button>
					</div>
				}
				showCount
				maxLength={400}
			/>
		</div>
	),
}

export const ResizeOptions: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-96">
			<Textarea
				resize="none"
				label="Redimensionamento Desabilitado (resize-none)"
				placeholder="Altura fixa, sem al�a de arrasto"
			/>
			<Textarea
				resize="vertical"
				label="Redimensionamento Vertical Padr�o (resize-y)"
				placeholder="Arraste para redimensionar verticalmente"
			/>
		</div>
	),
}

export const DisabledAndReadOnly: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-96">
			<Textarea
				label="Textarea Desabilitado"
				disabled
				defaultValue="Este texto n�o pode ser modificado ou focado."
			/>
			<Textarea
				label="Textarea ReadOnly (Somente Leitura)"
				readOnly
				defaultValue="Gabarito oficial gerado pelo sistema: 1-A, 2-C, 3-D, 4-B, 5-E. Crit�rios de pontua��o bloqueados para edi��o."
				helperText="Conte�do gerado automaticamente."
			/>
		</div>
	),
}
