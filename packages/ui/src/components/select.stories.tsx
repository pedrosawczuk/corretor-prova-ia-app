import type { Meta, StoryObj } from '@storybook/react'
import {
	BarChart2,
	BookOpen,
	Bot,
	Clock,
	FileText,
	Flag,
	Globe,
	GraduationCap,
	Layers,
	ShieldCheck,
	Sparkles,
	Star,
	Users,
	Zap,
} from 'lucide-react'
import {
	Select,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectSeparator,
} from './select'

const meta: Meta<typeof Select> = {
	title: 'Components/Select',
	component: Select,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente de seleção acessível baseado em Radix UI com suporte a grupos, ícones, badges, descrições, variantes visuais, tamanhos, estados de validação e navegação completa por teclado.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'filled', 'outline', 'ghost', 'underlined'],
			description: 'Estilo visual do trigger',
		},
		status: {
			control: 'select',
			options: ['default', 'error', 'success', 'warning'],
			description: 'Estado de validação',
		},
		size: {
			control: 'select',
			options: ['xs', 'sm', 'default', 'lg', 'xl'],
			description: 'Tamanho do trigger',
		},
		disabled: { control: 'boolean' },
	},
}

export default meta
type Story = StoryObj<typeof Select>

export const Primary: Story = {
	render: (args) => (
		<div className="w-64">
			<Select
				{...args}
				label="Disciplina"
				placeholder="Selecione a disciplina"
				helperText="Escolha a matéria principal da prova."
			>
				<SelectItem value="matematica">Matemática</SelectItem>
				<SelectItem value="portugues">Língua Portuguesa</SelectItem>
				<SelectItem value="historia">História</SelectItem>
				<SelectItem value="geografia">Geografia</SelectItem>
				<SelectItem value="ciencias">Ciências</SelectItem>
				<SelectItem value="ingles">Inglês</SelectItem>
			</Select>
		</div>
	),
}

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-5 w-64">
			{(['default', 'filled', 'outline', 'ghost', 'underlined'] as const).map(
				(v) => (
					<Select
						key={v}
						variant={v}
						label={`Variant: ${v}`}
						placeholder="Selecione..."
					>
						<SelectItem value="opt1">Opção 1</SelectItem>
						<SelectItem value="opt2">Opção 2</SelectItem>
						<SelectItem value="opt3">Opção 3</SelectItem>
					</Select>
				),
			)}
		</div>
	),
}

export const AllSizes: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-72">
			{(['xs', 'sm', 'default', 'lg', 'xl'] as const).map((s) => (
				<Select key={s} size={s} placeholder={`Size: ${s}`}>
					<SelectItem value="opt1">Opção 1</SelectItem>
					<SelectItem value="opt2">Opção 2</SelectItem>
				</Select>
			))}
		</div>
	),
}

export const ValidationStatuses: Story = {
	render: () => (
		<div className="flex flex-col gap-5 w-72">
			<Select
				label="Status: Default"
				placeholder="Selecione a turma..."
				helperText="Escolha a turma que receberá esta prova."
			>
				<SelectItem value="t1">Turma 9A</SelectItem>
				<SelectItem value="t2">Turma 9B</SelectItem>
			</Select>

			<Select
				label="Status: Success"
				status="success"
				defaultValue="t1"
				helperText="Turma selecionada com sucesso."
			>
				<SelectItem value="t1">Turma 9A ✓</SelectItem>
				<SelectItem value="t2">Turma 9B</SelectItem>
			</Select>

			<Select
				label="Status: Warning"
				status="warning"
				defaultValue="enem"
				helperText="Esta modalidade consome mais créditos de IA."
			>
				<SelectItem value="enem">ENEM / TRI</SelectItem>
				<SelectItem value="simples">Soma simples</SelectItem>
			</Select>

			<Select
				label="Status: Error"
				errorMessage="Selecione uma disciplina para continuar."
				placeholder="Selecione..."
			>
				<SelectItem value="mat">Matemática</SelectItem>
				<SelectItem value="port">Português</SelectItem>
			</Select>
		</div>
	),
}

export const WithLeftIcon: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-72">
			<Select
				label="Disciplina"
				placeholder="Selecione a disciplina"
				leftIcon={<BookOpen />}
			>
				<SelectItem value="matematica">Matemática</SelectItem>
				<SelectItem value="portugues">Língua Portuguesa</SelectItem>
				<SelectItem value="historia">História</SelectItem>
			</Select>

			<Select
				label="Turma"
				placeholder="Selecione a turma"
				leftIcon={<GraduationCap />}
			>
				<SelectItem value="9a">9° Ano A</SelectItem>
				<SelectItem value="9b">9° Ano B</SelectItem>
				<SelectItem value="8a">8° Ano A</SelectItem>
			</Select>

			<Select
				label="Modelo de IA"
				placeholder="Selecione o modelo"
				leftIcon={<Sparkles />}
			>
				<SelectItem value="flash">Gemini 2.0 Flash</SelectItem>
				<SelectItem value="pro">Gemini 1.5 Pro</SelectItem>
				<SelectItem value="sonnet">Claude 3.5 Sonnet</SelectItem>
			</Select>
		</div>
	),
}

export const ItemsWithIconsAndDescriptions: Story = {
	render: () => (
		<div className="w-80">
			<Select
				label="Modelo de IA para Correção"
				placeholder="Selecione o modelo..."
				helperText="O modelo influencia a velocidade e a qualidade da correção."
				fullWidth
			>
				<SelectItem
					value="flash"
					icon={<Zap className="text-emerald-600" />}
					badge={
						<span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
							Rápido
						</span>
					}
					description="Correção em menos de 2s por folha. Ideal para provas objetivas."
				>
					Gemini 2.0 Flash
				</SelectItem>

				<SelectItem
					value="pro"
					icon={<Sparkles className="text-primary" />}
					badge={
						<span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
							Preciso
						</span>
					}
					description="Raciocínio aprofundado para questões dissertativas e redações."
				>
					Gemini 1.5 Pro
				</SelectItem>

				<SelectItem
					value="sonnet"
					icon={<Bot className="text-blue-600" />}
					badge={
						<span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
							Premium
						</span>
					}
					description="Análise literária e rubricas com critérios altamente subjetivos."
				>
					Claude 3.5 Sonnet
				</SelectItem>
			</Select>
		</div>
	),
}

export const GroupedWithLabels: Story = {
	render: () => (
		<div className="w-72">
			<Select
				label="Nível de Ensino & Disciplina"
				placeholder="Selecione..."
				fullWidth
			>
				<SelectGroup>
					<SelectLabel>Ensino Fundamental</SelectLabel>
					<SelectItem value="ef_mat" icon={<Layers />}>
						Matemática — EF
					</SelectItem>
					<SelectItem value="ef_port" icon={<FileText />}>
						Língua Portuguesa — EF
					</SelectItem>
					<SelectItem value="ef_hist" icon={<BookOpen />}>
						História — EF
					</SelectItem>
					<SelectItem value="ef_geo" icon={<Globe />}>
						Geografia — EF
					</SelectItem>
				</SelectGroup>

				<SelectSeparator />

				<SelectGroup>
					<SelectLabel>Ensino Médio</SelectLabel>
					<SelectItem value="em_mat" icon={<BarChart2 />}>
						Matemática — EM
					</SelectItem>
					<SelectItem value="em_port" icon={<FileText />}>
						Língua Portuguesa — EM
					</SelectItem>
					<SelectItem value="em_bio" icon={<Layers />}>
						Biologia — EM
					</SelectItem>
					<SelectItem value="em_fis" icon={<ShieldCheck />}>
						Física — EM
					</SelectItem>
				</SelectGroup>
			</Select>
		</div>
	),
}

export const ItemsWithBadges: Story = {
	render: () => (
		<div className="w-72">
			<Select
				label="Nível de Dificuldade"
				placeholder="Selecione o nível..."
				fullWidth
			>
				<SelectItem
					value="facil"
					icon={<Flag className="text-emerald-500" />}
					badge={
						<span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
							Fácil
						</span>
					}
				>
					Ensino Fundamental I
				</SelectItem>

				<SelectItem
					value="medio"
					icon={<Flag className="text-amber-500" />}
					badge={
						<span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
							Médio
						</span>
					}
				>
					Ensino Fundamental II
				</SelectItem>

				<SelectItem
					value="dificil"
					icon={<Flag className="text-red-500" />}
					badge={
						<span className="text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
							Difícil
						</span>
					}
				>
					Ensino Médio / Vestibular
				</SelectItem>

				<SelectItem
					value="olimpiada"
					icon={<Star className="text-primary" />}
					badge={
						<span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
							Olímpico
						</span>
					}
				>
					Olimpíada / ENEM
				</SelectItem>
			</Select>
		</div>
	),
}

export const FilledAndGhost: Story = {
	render: () => (
		<div className="flex flex-col gap-5 w-72">
			<Select
				variant="filled"
				label="Filled — Turma"
				placeholder="Selecione a turma..."
				leftIcon={<Users />}
			>
				<SelectItem value="9a">9° Ano A</SelectItem>
				<SelectItem value="9b">9° Ano B</SelectItem>
				<SelectItem value="8a">8° Ano A</SelectItem>
			</Select>

			<Select
				variant="ghost"
				label="Ghost — Período"
				placeholder="Selecione o período..."
				leftIcon={<Clock />}
			>
				<SelectItem value="bim1">1° Bimestre</SelectItem>
				<SelectItem value="bim2">2° Bimestre</SelectItem>
				<SelectItem value="bim3">3° Bimestre</SelectItem>
				<SelectItem value="bim4">4° Bimestre</SelectItem>
			</Select>

			<Select
				variant="underlined"
				label="Underlined — Ano"
				placeholder="Selecione o ano letivo..."
			>
				<SelectItem value="2024">2024</SelectItem>
				<SelectItem value="2025">2025</SelectItem>
				<SelectItem value="2026">2026</SelectItem>
			</Select>
		</div>
	),
}

export const DisabledStates: Story = {
	render: () => (
		<div className="flex flex-col gap-5 w-72">
			<Select
				disabled
				label="Trigger desabilitado"
				placeholder="Indisponível no momento..."
				helperText="Habilitado após a configuração inicial."
			>
				<SelectItem value="opt1">Opção 1</SelectItem>
			</Select>

			<Select label="Itens desabilitados" placeholder="Selecione...">
				<SelectItem value="ativo">Ativo (disponível)</SelectItem>
				<SelectItem value="beta" disabled>
					Beta (em breve)
				</SelectItem>
				<SelectItem value="legacy" disabled>
					Legado (descontinuado)
				</SelectItem>
			</Select>
		</div>
	),
}

export const FormLayout: Story = {
	render: () => (
		<div className="w-full max-w-md flex flex-col gap-5">
			<Select
				label="Turma *"
				required
				placeholder="Selecione a turma..."
				fullWidth
				leftIcon={<GraduationCap />}
				helperText="Turma que receberá a prova."
			>
				<SelectItem value="9a">9° Ano A — Manhã</SelectItem>
				<SelectItem value="9b">9° Ano B — Tarde</SelectItem>
				<SelectItem value="8a">8° Ano A — Manhã</SelectItem>
			</Select>

			<Select
				label="Disciplina *"
				required
				placeholder="Selecione a disciplina..."
				fullWidth
				leftIcon={<BookOpen />}
				errorMessage="Este campo é obrigatório para gerar a prova."
			>
				<SelectItem value="mat">Matemática</SelectItem>
				<SelectItem value="port">Língua Portuguesa</SelectItem>
				<SelectItem value="hist">História</SelectItem>
			</Select>

			<Select
				label="Número de questões"
				placeholder="Selecione..."
				fullWidth
				defaultValue="10"
				helperText="Recomendamos entre 10 e 20 questões."
			>
				{[5, 10, 15, 20, 25, 30].map((n) => (
					<SelectItem key={n} value={String(n)}>
						{n} questões
					</SelectItem>
				))}
			</Select>
		</div>
	),
}
