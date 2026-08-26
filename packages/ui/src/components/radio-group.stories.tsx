import type { Meta, StoryObj } from '@storybook/react'
import { Bot, Sparkles, Zap } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from './radio-group'

const meta: Meta<typeof RadioGroup> = {
	title: 'Components/RadioGroup',
	component: RadioGroup,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente de seleção única (Radio Group / RadioButton) acessível baseado em Radix UI com navegação completa por teclado, variantes de cor, tamanhos e modo Card com badges.',
			},
		},
	},
	argTypes: {
		orientation: {
			control: 'select',
			options: ['vertical', 'horizontal'],
			description: 'Direção do layout do grupo de rádios',
		},
		disabled: {
			control: 'boolean',
		},
	},
}

export default meta
type Story = StoryObj<typeof RadioGroup>

export const Primary: Story = {
	render: () => (
		<RadioGroup defaultValue="multipla_escolha" label="Formato das Questões">
			<RadioGroupItem
				value="multipla_escolha"
				label="Múltipla Escolha"
				description="Questões objetivas com 4 ou 5 alternativas e 1 resposta correta."
			/>
			<RadioGroupItem
				value="dissertativa"
				label="Dissertativa / Discursiva"
				description="Respostas abertas corrigidas por rubrica semântica da IA."
			/>
			<RadioGroupItem
				value="mista"
				label="Avaliação Mista"
				description="Combinação de questões objetivas e dissertativas."
			/>
		</RadioGroup>
	),
}

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-6 max-w-xl">
			<div>
				<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
					Primary (Linear Violet) & Secondary
				</h4>
				<RadioGroup defaultValue="primary_opt" orientation="horizontal">
					<RadioGroupItem
						variant="default"
						value="primary_opt"
						label="Primary Default"
					/>
					<RadioGroupItem
						variant="secondary"
						value="secondary_opt"
						label="Secondary"
					/>
				</RadioGroup>
			</div>

			<div>
				<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
					Feedback & Suporte (Success, Warning, Destructive, Info)
				</h4>
				<RadioGroup defaultValue="success_opt" orientation="horizontal">
					<RadioGroupItem
						variant="success"
						value="success_opt"
						label="Aprovado (Success)"
					/>
					<RadioGroupItem
						variant="warning"
						value="warning_opt"
						label="Em Revisão (Warning)"
					/>
					<RadioGroupItem
						variant="destructive"
						value="destructive_opt"
						label="Reprovado (Destructive)"
					/>
					<RadioGroupItem
						variant="info"
						value="info_opt"
						label="Informativo (Info)"
					/>
				</RadioGroup>
			</div>
		</div>
	),
}

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-5">
			<RadioGroup defaultValue="size_default">
				<RadioGroupItem
					size="sm"
					value="size_sm"
					label="Tamanho Small (sm - 14px)"
					description="Adequado para tabelas compactas e formulários densos."
				/>
				<RadioGroupItem
					size="default"
					value="size_default"
					label="Tamanho Default (md - 18px)"
					description="Tamanho padrão recomendado para a maioria das interfaces."
				/>
				<RadioGroupItem
					size="lg"
					value="size_lg"
					label="Tamanho Large (lg - 24px)"
					description="Destaque tátil para tablets ou seleção rápida."
				/>
			</RadioGroup>
		</div>
	),
}

export const HorizontalOrientation: Story = {
	render: () => (
		<RadioGroup
			defaultValue="medio"
			orientation="horizontal"
			label="Nível de Dificuldade da Prova"
			description="Influencia o vocabulário e a complexidade das alternativas geradas."
		>
			<RadioGroupItem value="facil" label="Fácil" />
			<RadioGroupItem value="medio" label="Médio" />
			<RadioGroupItem value="dificil" label="Difícil" />
			<RadioGroupItem value="avancado" label="Olimpíada / ENEM" />
		</RadioGroup>
	),
}

export const AsCardSelectors: Story = {
	render: () => (
		<RadioGroup defaultValue="flash" className="w-96">
			<RadioGroupItem
				asCard
				value="flash"
				badge={
					<span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
						Recomendado
					</span>
				}
				label={
					<span className="flex items-center gap-1.5 font-semibold text-foreground">
						<Zap className="size-4 text-emerald-600" />
						Gemini 2.0 Flash
					</span>
				}
				description="Correção ultrarrápida (menos de 2s por folha) ideal para provas objetivas em massa."
			/>

			<RadioGroupItem
				asCard
				value="pro"
				badge={
					<span className="text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-full">
						Alta Precisão
					</span>
				}
				label={
					<span className="flex items-center gap-1.5 font-semibold text-foreground">
						<Sparkles className="size-4 text-primary" />
						Gemini 1.5 Pro
					</span>
				}
				description="Raciocínio aprofundado para correção de redações e questões discursivas complexas."
			/>

			<RadioGroupItem
				asCard
				value="sonnet"
				badge={
					<span className="text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-full">
						Premium
					</span>
				}
				label={
					<span className="flex items-center gap-1.5 font-semibold text-foreground">
						<Bot className="size-4 text-blue-600" />
						Claude 3.5 Sonnet
					</span>
				}
				description="Excelente para análise literária, rubricas com critérios subjetivos e feedback pedagógico."
			/>
		</RadioGroup>
	),
}

export const ValidationError: Story = {
	render: () => (
		<RadioGroup
			required
			label="Método de Atribuição de Nota"
			errorMessage="Selecione obrigatoriamente um método de cálculo para gerar o relatório."
		>
			<RadioGroupItem
				value="soma_simples"
				label="Soma Simples (0 a 10 pontos)"
			/>
			<RadioGroupItem
				value="tri"
				label="Teoria de Resposta ao Item (TRI - Estilo ENEM)"
			/>
		</RadioGroup>
	),
}

export const DisabledStates: Story = {
	render: () => (
		<RadioGroup defaultValue="opt1" disabled label="Configurações Bloqueadas">
			<RadioGroupItem
				value="opt1"
				label="Opção Selecionada (Desabilitada)"
				description="Não pode ser alterada no status atual da prova."
			/>
			<RadioGroupItem
				value="opt2"
				label="Opção Não Selecionada (Desabilitada)"
				description="Indisponível no momento."
			/>
		</RadioGroup>
	),
}
