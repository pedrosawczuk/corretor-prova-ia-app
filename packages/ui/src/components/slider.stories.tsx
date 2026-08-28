import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Slider } from './slider'

const meta: Meta<typeof Slider> = {
	title: 'Components/Slider',
	component: Slider,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente Slider acessível baseado em `@radix-ui/react-slider`, para seleção de valores contínuos ou discretos (ex: quantidade de questões, nível de dificuldade, peso de rubricas e notas).',
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
			description: 'Variante semântica de cor da trilha e do botão',
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
			description: 'Espessura da trilha e dimensão do cursor',
		},
		showValue: {
			control: 'boolean',
			description: 'Exibe o valor atual acima da barra',
		},
		disabled: {
			control: 'boolean',
			description: 'Desabilita interação com o slider',
		},
	},
}

export default meta
type Story = StoryObj<typeof Slider>

export const Default: Story = {
	args: {
		label: 'Quantidade de Questões',
		defaultValue: [10],
		min: 1,
		max: 50,
		step: 1,
		showValue: true,
		valueSuffix: ' questões',
		helperText: 'Recomendamos entre 5 e 20 questões para provas objetivas.',
	},
}

export const DifficultySelection: Story = {
	render: () => {
		const [val, setVal] = React.useState([2])
		const difficultyLabels = [
			'Muito Fácil',
			'Fácil',
			'Média',
			'Difícil',
			'Avançada',
		]

		return (
			<div className="w-80 space-y-4">
				<Slider
					label="Dificuldade da Geração IA"
					min={1}
					max={5}
					step={1}
					value={val}
					onValueChange={setVal}
					showValue
					formatValue={(v) => difficultyLabels[v - 1]}
					marks={[
						{ value: 1, label: 'Fácil' },
						{ value: 3, label: 'Média' },
						{ value: 5, label: 'Difícil' },
					]}
				/>
			</div>
		)
	},
}

export const ExamPointsRange: Story = {
	render: () => {
		const [range, setRange] = React.useState([2, 8])

		return (
			<div className="w-80 space-y-4">
				<Slider
					label="Faixa de Pontuação das Questões"
					min={0}
					max={10}
					step={0.5}
					value={range}
					onValueChange={setRange}
					showValue
					valuePrefix="Nota: "
					valueSuffix=" pts"
					variant="success"
					helperText="Defina o valor mínimo e máximo por questão."
				/>
			</div>
		)
	},
}

export const SemanticVariants: Story = {
	render: () => (
		<div className="w-80 space-y-6">
			<Slider
				label="Default (Primary)"
				defaultValue={[75]}
				variant="default"
				showValue
			/>
			<Slider
				label="Success (Pontuação Aprovada)"
				defaultValue={[85]}
				variant="success"
				showValue
			/>
			<Slider
				label="Warning (Limite de IA)"
				defaultValue={[60]}
				variant="warning"
				showValue
			/>
			<Slider
				label="Destructive (Taxa de Erro)"
				defaultValue={[30]}
				variant="destructive"
				showValue
			/>
			<Slider
				label="Info (Confiança OCR)"
				defaultValue={[98]}
				variant="info"
				showValue
				valueSuffix="%"
			/>
		</div>
	),
}

export const Sizes: Story = {
	render: () => (
		<div className="w-80 space-y-6">
			<Slider label="Tamanho Pequeno (sm)" size="sm" defaultValue={[30]} />
			<Slider label="Tamanho Padrão (md)" size="default" defaultValue={[50]} />
			<Slider label="Tamanho Grande (lg)" size="lg" defaultValue={[80]} />
		</div>
	),
}

