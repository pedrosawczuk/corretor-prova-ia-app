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
					'Componente de sele��o �nica (Radio Group / RadioButton) acess�vel baseado em Radix UI com navega��o completa por teclado, variantes de cor, tamanhos e modo Card com badges.',
			},
		},
	},
	argTypes: {
		orientation: {
			control: 'select',
			options: ['vertical', 'horizontal'],
			description: 'Dire��o do layout do grupo de r�dios',
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
		<RadioGroup defaultValue="multipla_escolha" label="Formato das Quest�es">
			<RadioGroupItem
				value="multipla_escolha"
				label="M�ltipla Escolha"
				description="Quest�es objetivas com 4 ou 5 alternativas e 1 resposta correta."
			/>
			<RadioGroupItem
				value="dissertativa"
				label="Dissertativa / Discursiva"
				description="Respostas abertas corrigidas por rubrica sem�ntica da IA."
			/>
			<RadioGroupItem
				value="mista"
				label="Avalia��o Mista"
				description="Combina��o de quest�es objetivas e dissertativas."
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
						label="Em Revis�o (Warning)"
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
					description="Adequado para tabelas compactas e formul�rios densos."
				/>
				<RadioGroupItem
					size="default"
					value="size_default"
					label="Tamanho Default (md - 18px)"
					description="Tamanho padr�o recomendado para a maioria das interfaces."
				/>
				<RadioGroupItem
					size="lg"
					value="size_lg"
					label="Tamanho Large (lg - 24px)"
					description="Destaque t�til para tablets ou sele��o r�pida."
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
			label="N�vel de Dificuldade da Prova"
			description="Influencia o vocabul�rio e a complexidade das alternativas geradas."
		>
			<RadioGroupItem value="facil" label="F�cil" />
			<RadioGroupItem value="medio" label="M�dio" />
			<RadioGroupItem value="dificil" label="Dif�cil" />
			<RadioGroupItem value="avancado" label="Olimp�ada / ENEM" />
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
				description="Corre��o ultrarr�pida (menos de 2s por folha) ideal para provas objetivas em massa."
			/>

			<RadioGroupItem
				asCard
				value="pro"
				badge={
					<span className="text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-full">
						Alta Precis�o
					</span>
				}
				label={
					<span className="flex items-center gap-1.5 font-semibold text-foreground">
						<Sparkles className="size-4 text-primary" />
						Gemini 1.5 Pro
					</span>
				}
				description="Racioc�nio aprofundado para corre��o de reda��es e quest�es discursivas complexas."
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
				description="Excelente para an�lise liter�ria, rubricas com crit�rios subjetivos e feedback pedag�gico."
			/>
		</RadioGroup>
	),
}

export const ValidationError: Story = {
	render: () => (
		<RadioGroup
			required
			label="M�todo de Atribui��o de Nota"
			errorMessage="Selecione obrigatoriamente um m�todo de c�lculo para gerar o relat�rio."
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
		<RadioGroup defaultValue="opt1" disabled label="Configura��es Bloqueadas">
			<RadioGroupItem
				value="opt1"
				label="Op��o Selecionada (Desabilitada)"
				description="N�o pode ser alterada no status atual da prova."
			/>
			<RadioGroupItem
				value="opt2"
				label="Op��o N�o Selecionada (Desabilitada)"
				description="Indispon�vel no momento."
			/>
		</RadioGroup>
	),
}
