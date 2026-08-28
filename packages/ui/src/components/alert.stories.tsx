import type { Meta, StoryObj } from '@storybook/react'
import { Alert, AlertDescription, AlertTitle } from './alert'

const meta: Meta<typeof Alert> = {
	title: 'Components/Alert',
	component: Alert,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente de banner de aviso e feedback inline na página ou dentro de formulários (ex: tela de login, confirmação de envio de e-mail de recuperação de senha).',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: [
				'default',
				'destructive',
				'success',
				'warning',
				'info',
				'subtle',
			],
			description: 'Variante semântica de cor e destaque',
		},
	},
}

export default meta
type Story = StoryObj<typeof Alert>

export const AuthSuccessAlert: Story = {
	render: () => (
		<div className="w-96 space-y-4">
			<Alert variant="success">
				<AlertTitle>E-mail de recuperação enviado!</AlertTitle>
				<AlertDescription>
					Verifique sua caixa de entrada no endereço{' '}
					<strong>pedro@escola.edu.br</strong> e siga as instruções para
					redefinir sua senha.
				</AlertDescription>
			</Alert>
		</div>
	),
}

export const AuthErrorAlert: Story = {
	render: () => (
		<div className="w-96 space-y-4">
			<Alert variant="destructive" onClose={() => alert('Fechou aviso')}>
				<AlertTitle>Falha na autenticação</AlertTitle>
				<AlertDescription>
					E-mail ou senha inválidos. Por favor, tente novamente ou recupere seu
					acesso.
				</AlertDescription>
			</Alert>
		</div>
	),
}

export const AllVariants: Story = {
	render: () => (
		<div className="w-96 space-y-3">
			<Alert variant="default">
				<AlertTitle>Aviso Geral</AlertTitle>
				<AlertDescription>
					Este é um alerta padrão do sistema com borda neutra.
				</AlertDescription>
			</Alert>

			<Alert variant="info">
				<AlertTitle>Dica de Uso da Câmera</AlertTitle>
				<AlertDescription>
					Posicione a folha de respostas em local bem iluminado para acelerar o
					OCR.
				</AlertDescription>
			</Alert>

			<Alert variant="warning">
				<AlertTitle>Limite Mensal de IA</AlertTitle>
				<AlertDescription>
					Você utilizou 80% da sua cota de geração de questões deste mês.
				</AlertDescription>
			</Alert>

			<Alert variant="destructive">
				<AlertTitle>Erro no Servidor</AlertTitle>
				<AlertDescription>
					Não foi possível carregar a listagem de turmas. Tente novamente em
					instantes.
				</AlertDescription>
			</Alert>

			<Alert variant="success">
				<AlertTitle>Prova Salva com Sucesso</AlertTitle>
				<AlertDescription>
					Todas as alterações foram sincronizadas no banco de dados.
				</AlertDescription>
			</Alert>
		</div>
	),
}

