import type { Meta, StoryObj } from '@storybook/react'
import { Switch } from './switch'

const meta: Meta<typeof Switch> = {
	title: 'Components/Switch',
	component: Switch,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente de alternância binária (Switch) acessível construído sobre `@radix-ui/react-switch`, para ativação de recursos de IA, opções de gabarito e preferências do professor.',
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
			description: 'Variante visual e semântica',
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
			description: 'Escala de dimensão do switch',
		},
		disabled: {
			control: 'boolean',
			description: 'Desabilita interação com o controle',
		},
		asCard: {
			control: 'boolean',
			description: 'Renderiza em formato de card clicável',
		},
	},
}

export default meta
type Story = StoryObj<typeof Switch>

export const Default: Story = {
	args: {
		label: 'Gabarito Automático com Justificativa',
		description:
			'A IA incluirá a explicação pedagógica de cada alternativa correta.',
		defaultChecked: true,
	},
}

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-72">
			<Switch size="sm" label="Tamanho Pequeno (sm)" defaultChecked />
			<Switch size="default" label="Tamanho Padrão (md)" defaultChecked />
			<Switch size="lg" label="Tamanho Grande (lg)" defaultChecked />
		</div>
	),
}

export const SemanticVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<Switch
				variant="default"
				label="Default (Linear Violet)"
				defaultChecked
			/>
			<Switch
				variant="success"
				label="Success (Correção Instantânea)"
				defaultChecked
			/>
			<Switch
				variant="warning"
				label="Warning (Modo Experimental)"
				defaultChecked
			/>
			<Switch
				variant="destructive"
				label="Destructive (Travar Prova)"
				defaultChecked
			/>
			<Switch variant="info" label="Info (Notificações)" defaultChecked />
		</div>
	),
}

export const ExamSettingsCards: Story = {
	render: () => (
		<div className="flex flex-col gap-3 w-96">
			<Switch
				asCard
				label="Permitir Questões Verdadeiro/Falso"
				description="Mescla questões de múltipla escolha com afirmações V/F."
				defaultChecked
			/>

			<Switch
				asCard
				label="Captura Contínua no Scanner"
				description="Tira fotos automaticamente assim que o QR Code for detectado."
				defaultChecked
			/>

			<Switch
				asCard
				disabled
				label="Detecção de Letra Cursiva Avançada (PRO)"
				description="Requer plano institucional ativo."
			/>
		</div>
	),
}
