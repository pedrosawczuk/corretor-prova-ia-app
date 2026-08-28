import type { Meta, StoryObj } from '@storybook/react'
import {
	Archive,
	Copy,
	Download,
	Edit,
	LogOut,
	MoreHorizontal,
	MoreVertical,
	Printer,
	QrCode,
	Share2,
	Sparkles,
	Trash2,
	User,
} from 'lucide-react'
import * as React from 'react'
import { Badge } from './badge'
import { Button } from './button'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from './dropdown-menu'

const meta: Meta<typeof DropdownMenu> = {
	title: 'Components/DropdownMenu',
	component: DropdownMenu,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Menu suspenso acessível construído sobre `@radix-ui/react-dropdown-menu`, para menus de contexto, opções de cards de turmas/provas, perfis de usuário e submenus com atalhos de teclado.',
			},
		},
	},
}

export default meta
type Story = StoryObj<typeof DropdownMenu>

export const ExamCardActions: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					size="icon-sm"
					variant="ghost"
					aria-label="Abrir menu de opções da prova"
				>
					<MoreVertical />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>Ações da Prova</DropdownMenuLabel>
				<DropdownMenuGroup>
					<DropdownMenuItem icon={<Edit />}>
						Editar Questões
						<DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem icon={<Copy />}>
						Duplicar Avaliação
					</DropdownMenuItem>
					<DropdownMenuItem icon={<Printer />}>
						Imprimir Caderno
					</DropdownMenuItem>
					<DropdownMenuItem icon={<QrCode />}>
						Gerar Folha com QR
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuSub>
					<DropdownMenuSubTrigger inset>
						<Share2 className="size-4 text-muted-foreground mr-2" />
						Exportar
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="w-48">
						<DropdownMenuItem icon={<Download />}>
							PDF da Prova
						</DropdownMenuItem>
						<DropdownMenuItem icon={<Download />}>
							Gabarito Oficial
						</DropdownMenuItem>
						<DropdownMenuItem icon={<Download />}>
							Planilha de Notas
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>

				<DropdownMenuSeparator />

				<DropdownMenuItem variant="warning" icon={<Archive />}>
					Arquivar
				</DropdownMenuItem>
				<DropdownMenuItem variant="destructive" icon={<Trash2 />}>
					Excluir Prova
					<DropdownMenuShortcut>⌫</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
}

export const UserProfileMenu: Story = {
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" leftIcon={<User />}>
					Prof. Pedro Santos
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				<DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
				<div className="px-2.5 py-1 text-xs text-muted-foreground">
					pedro@escola.edu.br
				</div>
				<DropdownMenuSeparator />
				<DropdownMenuItem icon={<User />}>
					Meu Perfil
					<Badge size="xs" variant="secondary" className="ml-auto">
						Docente
					</Badge>
				</DropdownMenuItem>
				<DropdownMenuItem icon={<Sparkles />}>
					Plano & Créditos IA
					<Badge size="xs" variant="primary" className="ml-auto">
						PRO
					</Badge>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" icon={<LogOut />}>
					Sair da conta
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
}

export const CheckboxesAndRadios: Story = {
	render: () => {
		const [showDrafts, setShowDrafts] = React.useState(true)
		const [showPublished, setShowPublished] = React.useState(true)
		const [difficulty, setDifficulty] = React.useState('all')

		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="sm" leftIcon={<MoreHorizontal />}>
						Filtros da Listagem
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56">
					<DropdownMenuLabel>Status da Avaliação</DropdownMenuLabel>
					<DropdownMenuCheckboxItem
						checked={showDrafts}
						onCheckedChange={setShowDrafts}
					>
						Exibir Rascunhos
					</DropdownMenuCheckboxItem>
					<DropdownMenuCheckboxItem
						checked={showPublished}
						onCheckedChange={setShowPublished}
					>
						Exibir Finalizadas
					</DropdownMenuCheckboxItem>

					<DropdownMenuSeparator />

					<DropdownMenuLabel>Dificuldade</DropdownMenuLabel>
					<DropdownMenuRadioGroup
						value={difficulty}
						onValueChange={setDifficulty}
					>
						<DropdownMenuRadioItem value="all">Todas</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="easy">Fácil</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="medium">Média</DropdownMenuRadioItem>
						<DropdownMenuRadioItem value="hard">Difícil</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>
		)
	},
}

