import type { Meta, StoryObj } from '@storybook/react'
import {
	AlertTriangle,
	Archive,
	CheckCircle,
	Info,
	Sparkles,
	Trash2,
} from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from './alert-dialog'
import { Button } from './button'

const meta: Meta<typeof AlertDialog> = {
	title: 'Components/AlertDialog',
	component: AlertDialog,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Janela modal de alerta e confirmação para ações críticas e irreversíveis (ex: excluir prova, descartar rascunho, sobrescrever questões com IA). Baseado no `@radix-ui/react-alert-dialog`.',
			},
		},
	},
}

export default meta
type Story = StoryObj<typeof AlertDialog>

export const DestructiveAction: Story = {
	render: () => (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="destructive" leftIcon={<Trash2 />}>
					Excluir Prova
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogMedia variant="destructive">
						<Trash2 />
					</AlertDialogMedia>
					<AlertDialogTitle>
						Tem certeza que deseja excluir esta prova?
					</AlertDialogTitle>
					<AlertDialogDescription>
						Esta ação é irreversível. A prova{' '}
						<strong>"Prova Bimestral 1 - História"</strong> e todas as 32
						correções digitalizadas associadas serão permanentemente removidas.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction variant="destructive">
						Sim, excluir avaliação
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
}

export const WarningRegenerateWithAI: Story = {
	render: () => (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="warning" leftIcon={<Sparkles />}>
					Regenerar Todas as Questões
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogMedia variant="warning">
						<AlertTriangle />
					</AlertDialogMedia>
					<AlertDialogTitle>Sobrescrever questões existentes?</AlertDialogTitle>
					<AlertDialogDescription>
						A IA gerará um conjunto inteiramente novo de 10 questões com base no
						prompt atual. Qualquer edição manual feita anteriormente nesta prova
						será perdida.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Manter atuais</AlertDialogCancel>
					<AlertDialogAction variant="warning">
						Regenerar com IA
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
}

export const ArchiveClassroom: Story = {
	render: () => (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="outline" leftIcon={<Archive />}>
					Arquivar Turma
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogMedia variant="info">
						<Info />
					</AlertDialogMedia>
					<AlertDialogTitle>Arquivar turma 8º Ano A?</AlertDialogTitle>
					<AlertDialogDescription>
						A turma será movida para o arquivo e ficará oculta da listagem
						principal do painel. Você poderá restaurá-la a qualquer momento nas
						configurações.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Voltar</AlertDialogCancel>
					<AlertDialogAction variant="default">
						Arquivar Turma
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
}

export const SuccessPublishExam: Story = {
	render: () => (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant="success" leftIcon={<CheckCircle />}>
					Finalizar e Travar Gabarito
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent size="sm">
				<AlertDialogHeader>
					<AlertDialogMedia variant="success">
						<CheckCircle />
					</AlertDialogMedia>
					<AlertDialogTitle>Finalizar Avaliação?</AlertDialogTitle>
					<AlertDialogDescription>
						Após a publicação, o gabarito oficial será travado para que as
						sessões de escaneamento possam iniciar.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Revisar mais</AlertDialogCancel>
					<AlertDialogAction variant="success">
						Publicar Prova
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	),
}

