import type { Meta, StoryObj } from '@storybook/react'
import { Scan, ShieldCheck, Sparkles } from 'lucide-react'
import * as React from 'react'
import { Checkbox } from './checkbox'

const meta: Meta<typeof Checkbox> = {
	title: 'Components/Checkbox',
	component: Checkbox,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente de seleção múltipla (Checkbox) acessível baseado em Radix UI com suporte a estados indeterminados, variantes de cores, tamanhos, shapes e modo Card interativo.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: [
				'default',
				'secondary',
				'success',
				'warning',
				'destructive',
				'info',
			],
			description: 'Cor semântica ao marcar a caixa',
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
			description: 'Tamanho da caixa de seleção',
		},
		shape: {
			control: 'select',
			options: ['default', 'circle', 'square'],
			description: 'Formato do raio de borda',
		},
		disabled: {
			control: 'boolean',
		},
		checked: {
			control: 'select',
			options: [true, false, 'indeterminate'],
		},
	},
}

export default meta
type Story = StoryObj<typeof Checkbox>

export const Primary: Story = {
	args: {
		label: 'Gerar gabarito detalhado com IA',
		description:
			'A IA irá fornecer justificativas passo a passo para cada alternativa da questão.',
		defaultChecked: true,
		variant: 'default',
		size: 'default',
	},
}

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<Checkbox
				variant="default"
				defaultChecked
				label="Primary (Linear Violet)"
				description="Cor principal de destaque do sistema."
			/>
			<Checkbox
				variant="secondary"
				defaultChecked
				label="Secondary"
				description="Tom suave secundário."
			/>
			<Checkbox
				variant="success"
				defaultChecked
				label="Success (Emerald)"
				description="Para confirmações, turmas ativas e itens aprovados."
			/>
			<Checkbox
				variant="warning"
				defaultChecked
				label="Warning (Amber)"
				description="Para itens que demandam revisão ou atenção."
			/>
			<Checkbox
				variant="destructive"
				defaultChecked
				label="Destructive (Red)"
				description="Para ações perigosas e exclusões em lote."
			/>
			<Checkbox
				variant="info"
				defaultChecked
				label="Info (Blue)"
				description="Para informativos e notificações do sistema."
			/>
		</div>
	),
}

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<Checkbox
				size="sm"
				defaultChecked
				label="Small (sm - 14px)"
				description="Compacto para tabelas densas e listas longas."
			/>
			<Checkbox
				size="default"
				defaultChecked
				label="Default (md - 18px)"
				description="Tamanho padrão recomendado para formulários."
			/>
			<Checkbox
				size="lg"
				defaultChecked
				label="Large (lg - 24px)"
				description="Destaque para telas de toque ou cards de seleção rápida."
			/>
		</div>
	),
}

export const Shapes: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<Checkbox
				shape="default"
				defaultChecked
				label="Shape Default (Raio 4px)"
			/>
			<Checkbox
				shape="circle"
				defaultChecked
				label="Shape Circle (Arredondado / To-Do style)"
			/>
			<Checkbox shape="square" defaultChecked label="Shape Square (Raio 0px)" />
		</div>
	),
}

export const IndeterminateParent: Story = {
	render: () => {
		const [checkedItems, setCheckedItems] = React.useState([true, false, false])

		const allChecked = checkedItems.every(Boolean)
		const isIndeterminate = checkedItems.some(Boolean) && !allChecked

		const handleParentChange = () => {
			if (allChecked) {
				setCheckedItems([false, false, false])
			} else {
				setCheckedItems([true, true, true])
			}
		}

		const handleChildChange = (index: number) => {
			const updated = [...checkedItems]
			updated[index] = !updated[index]
			setCheckedItems(updated)
		}

		return (
			<div className="flex flex-col gap-3 p-4 border rounded-xl bg-card w-80">
				<Checkbox
					checked={isIndeterminate ? 'indeterminate' : allChecked}
					onCheckedChange={handleParentChange}
					label="Selecionar Todas as Turmas"
					description="Aplicar gabarito simultaneamente para o 9º Ano."
				/>
				<div className="flex flex-col gap-2 pl-6 pt-1 border-l ml-2">
					<Checkbox
						size="sm"
						checked={checkedItems[0]}
						onCheckedChange={() => handleChildChange(0)}
						label="Turma 9º Ano A (32 alunos)"
					/>
					<Checkbox
						size="sm"
						checked={checkedItems[1]}
						onCheckedChange={() => handleChildChange(1)}
						label="Turma 9º Ano B (28 alunos)"
					/>
					<Checkbox
						size="sm"
						checked={checkedItems[2]}
						onCheckedChange={() => handleChildChange(2)}
						label="Turma 9º Ano C (30 alunos)"
					/>
				</div>
			</div>
		)
	},
}

export const ValidationError: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<Checkbox
				required
				label="Li e concordo com os Termos de Uso"
				errorMessage="Você precisa aceitar os termos de serviço antes de prosseguir."
			/>
		</div>
	),
}

export const AsCardSelectors: Story = {
	render: () => (
		<div className="flex flex-col gap-3 w-96">
			<Checkbox
				asCard
				defaultChecked
				label={
					<span className="flex items-center gap-1.5">
						<Sparkles className="size-4 text-primary" />
						Correção com IA Avançada
					</span>
				}
				description="Identifica respostas discursivas, compara com a rubrica e calcula a nota com precisão."
			/>
			<Checkbox
				asCard
				defaultChecked
				label={
					<span className="flex items-center gap-1.5">
						<Scan className="size-4 text-emerald-600" />
						OCR e Leitura Óptica de Folhas
					</span>
				}
				description="Digitalize gabaritos manuscritos via câmera ou upload em PDF."
				variant="success"
			/>
			<Checkbox
				asCard
				label={
					<span className="flex items-center gap-1.5">
						<ShieldCheck className="size-4 text-amber-500" />
						Detecção Antifraude e Rasuras
					</span>
				}
				description="Sinaliza automaticamente questões com dupla marcação ou rasuras evidentes."
				variant="warning"
			/>
		</div>
	),
}

export const DisabledStates: Story = {
	render: () => (
		<div className="flex flex-col gap-3">
			<Checkbox
				disabled
				defaultChecked
				label="Opção obrigatória habilitada (Desabilitada)"
				description="Esta configuração não pode ser desmarcada no seu plano atual."
			/>
			<Checkbox
				disabled
				label="Recurso Premium (Desabilitado)"
				description="Disponível apenas para contas Pro ou Institucionais."
			/>
		</div>
	),
}

