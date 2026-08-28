import type { Meta, StoryObj } from '@storybook/react'
import { Pencil, Plus, Settings, Users } from 'lucide-react'
import * as React from 'react'
import { Button } from './button'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './dialog'
import { Input } from './input'
import { Label } from './label'
import { Textarea } from './textarea'

const meta: Meta<typeof Dialog> = {
	title: 'Components/Dialog',
	component: Dialog,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Janela modal para formulários e conteúdos que exigem foco do usuário sem sair do contexto atual (ex: criar/editar turma, ajustar configurações). Baseado no `@radix-ui/react-dialog`. Para confirmações destrutivas ou de alerta, prefira o `AlertDialog`.',
			},
		},
	},
}

export default meta
type Story = StoryObj<typeof Dialog>

export const CriarTurma: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button size="sm" leftIcon={<Plus />}>
					Nova Turma
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<Users className="size-5 text-primary" />
						Criar nova turma
					</DialogTitle>
					<DialogDescription>
						Turmas organizam suas provas por sala. Você pode criar quantas
						precisar.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<Input
						label="Nome da turma"
						placeholder="Ex: 8º Ano A - Manhã"
						required
					/>
					<Textarea
						label="Descrição (opcional)"
						placeholder="Alguma observação sobre esta turma..."
					/>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancelar</Button>
					</DialogClose>
					<Button>Criar turma</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
}

export const EditarTurma: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" leftIcon={<Pencil />}>
					Editar Turma
				</Button>
			</DialogTrigger>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle>Editar turma</DialogTitle>
					<DialogDescription>
						Atualize as informações da turma "9º Ano B".
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<Input label="Nome da turma" defaultValue="9º Ano B" required />
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancelar</Button>
					</DialogClose>
					<Button>Salvar alterações</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
}

export const ConfiguracoesCorrecaoIA: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary" leftIcon={<Settings />}>
					Configurar Correção com IA
				</Button>
			</DialogTrigger>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>Configurações de correção com IA</DialogTitle>
					<DialogDescription>
						Ajuste como a IA deve avaliar as respostas discursivas antes de
						iniciar a correção em lote.
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor="dialog-story-criterio">Critério de avaliação</Label>
						<Textarea
							id="dialog-story-criterio"
							placeholder="Ex: considere sinônimos e respostas parciais como corretas..."
							rows={4}
						/>
					</div>
					<Input
						label="Tolerância de nota (%)"
						type="number"
						defaultValue={10}
						helperText="Margem de divergência aceita antes de sinalizar revisão manual."
					/>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancelar</Button>
					</DialogClose>
					<Button>Salvar configurações</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
}

export const SemBotaoFechar: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Processando correção...</Button>
			</DialogTrigger>
			<DialogContent size="sm" hideClose>
				<DialogHeader>
					<DialogTitle>Corrigindo provas com IA</DialogTitle>
					<DialogDescription>
						Estamos analisando 32 folhas de respostas digitalizadas. Isso pode
						levar alguns instantes — não feche esta janela.
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	),
}

export const ControlledOpen: Story = {
	render: () => {
		const [open, setOpen] = React.useState(false)

		return (
			<>
				<Button onClick={() => setOpen(true)}>Abrir diálogo controlado</Button>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Diálogo controlado por estado</DialogTitle>
							<DialogDescription>
								O estado `open` é controlado externamente via `useState`, útil
								para abrir o diálogo a partir de outras ações (ex: após uma
								resposta de API).
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button onClick={() => setOpen(false)}>Fechar</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</>
		)
	},
}
