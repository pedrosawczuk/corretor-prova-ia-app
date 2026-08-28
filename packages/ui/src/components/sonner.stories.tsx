import type { Meta, StoryObj } from '@storybook/react'
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle,
	Info,
	Sparkles,
} from 'lucide-react'
import { Button } from './button'
import { Toaster, toast } from './sonner'

const meta: Meta<typeof Toaster> = {
	title: 'Components/Toast (Sonner)',
	component: Toaster,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Sistema de notificações e alertas flutuantes (Toasts) baseado no `sonner`, com tema Linear Violet, Obsidian Dark e suporte a `toast.promise` para feedback em tempo real de operações com IA e requisições.',
			},
		},
	},
}

export default meta
type Story = StoryObj<typeof Toaster>

export const ToastShowcase: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			<Toaster position="bottom-right" />

			<div className="grid grid-cols-2 gap-3 max-w-md">
				<Button
					variant="success"
					leftIcon={<CheckCircle />}
					onClick={() =>
						toast.success('Gabarito homologado com sucesso!', {
							description: 'As 10 questões foram salvas no banco de dados.',
						})
					}
				>
					Toast Sucesso
				</Button>

				<Button
					variant="destructive"
					leftIcon={<AlertCircle />}
					onClick={() =>
						toast.error('Falha ao processar folha de resposta', {
							description: 'A imagem capturada estava muito borrada ou escura.',
							action: {
								label: 'Tentar Novamente',
								onClick: () => console.log('Retry'),
							},
						})
					}
				>
					Toast Erro
				</Button>

				<Button
					variant="warning"
					leftIcon={<AlertTriangle />}
					onClick={() =>
						toast.warning('Atenção: Questão com rasura', {
							description: 'A IA identificou dupla marcação na questão 4.',
							action: {
								label: 'Revisar',
								onClick: () => console.log('Review'),
							},
						})
					}
				>
					Toast Alerta
				</Button>

				<Button
					variant="info"
					leftIcon={<Info />}
					onClick={() =>
						toast.info('Nova atualização de modelo', {
							description:
								'OCR manuscrito agora com suporte ampliado a caneta azul.',
						})
					}
				>
					Toast Informativo
				</Button>

				<Button
					variant="default"
					className="col-span-2"
					leftIcon={<Sparkles />}
					onClick={() => {
						const promise = new Promise((resolve) => setTimeout(resolve, 2500))

						toast.promise(promise, {
							loading: 'Gerando prova completa com Inteligência Artificial...',
							success: 'Prova de 10 questões gerada com sucesso!',
							error: 'Erro na conexão com o modelo LLM.',
						})
					}}
				>
					Toast com Promessa (IA Pipeline)
				</Button>
			</div>
		</div>
	),
}

