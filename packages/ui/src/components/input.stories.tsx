import type { Meta, StoryObj } from '@storybook/react'
import {
	BookOpen,
	Calendar,
	Key,
	Lock,
	Mail,
	School,
	Search,
	Sparkles,
	User,
} from 'lucide-react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
	title: 'Components/Input',
	component: Input,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente de entrada de texto acessível com suporte a labels, mensagens de erro, helpers, variantes visuais, estados de validação, ícones, prefixos/sufixos e alternador de visibilidade de senha.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'filled', 'outline', 'ghost', 'underlined'],
			description: 'Estilo visual do campo',
		},
		status: {
			control: 'select',
			options: ['default', 'error', 'success', 'warning'],
			description: 'Estado de validação e feedback',
		},
		size: {
			control: 'select',
			options: ['xs', 'sm', 'default', 'lg', 'xl'],
			description: 'Escala de altura e tamanho de fonte',
		},
		shape: {
			control: 'select',
			options: ['default', 'pill', 'square'],
			description: 'Formato do raio de borda',
		},
		disabled: {
			control: 'boolean',
		},
		isLoading: {
			control: 'boolean',
		},
		isClearable: {
			control: 'boolean',
		},
	},
}

export default meta
type Story = StoryObj<typeof Input>

export const Primary: Story = {
	args: {
		label: 'Título da Avaliação',
		placeholder: 'Ex: Prova Bimestral de História - 9º Ano',
		helperText: 'Informe um título claro para identificar a turma e a matéria.',
		variant: 'default',
		size: 'default',
	},
}

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-col gap-5 w-80">
			<Input
				variant="default"
				label="Variante: Default (Outline sutil)"
				placeholder="Campo de texto padrão"
			/>
			<Input
				variant="filled"
				label="Variante: Filled"
				placeholder="Fundo suave preenchido"
			/>
			<Input
				variant="outline"
				label="Variante: Outline destacado"
				placeholder="Borda com 2px de espessura"
			/>
			<Input
				variant="ghost"
				label="Variante: Ghost"
				placeholder="Sem borda inicial, destaca no foco"
			/>
			<Input
				variant="underlined"
				label="Variante: Underlined (Linha inferior)"
				placeholder="Estilo editorial minimalista"
			/>
		</div>
	),
}

export const ValidationStates: Story = {
	render: () => (
		<div className="flex flex-col gap-5 w-80">
			<Input
				label="Estado Normal"
				placeholder="professor@escola.edu.br"
				helperText="Digite o e-mail cadastrado na instituição."
			/>
			<Input
				label="Estado de Erro"
				defaultValue="email-invalido@"
				errorMessage="Formato de e-mail inválido. Por favor verifique."
			/>
			<Input
				label="Estado de Sucesso"
				defaultValue="professor.carlos@colegio.com"
				status="success"
				helperText="E-mail validado com sucesso!"
			/>
			<Input
				label="Estado de Atenção (Warning)"
				defaultValue="123456"
				status="warning"
				helperText="Sua senha é considerada fraca."
			/>
		</div>
	),
}

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<Input size="xs" placeholder="Tamanho Extra Small (xs - 28px)" />
			<Input size="sm" placeholder="Tamanho Small (sm - 32px)" />
			<Input size="default" placeholder="Tamanho Default (md - 40px)" />
			<Input size="lg" placeholder="Tamanho Large (lg - 44px)" />
			<Input size="xl" placeholder="Tamanho Extra Large (xl - 48px)" />
		</div>
	),
}

export const WithIcons: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<Input
				label="Ícone à Esquerda"
				leftIcon={<Search />}
				placeholder="Buscar prova por tema ou turma..."
			/>
			<Input
				label="Ícone de E-mail"
				leftIcon={<Mail />}
				placeholder="seu.email@dominio.com"
			/>
			<Input
				label="Ícone à Direita"
				rightIcon={<Calendar />}
				placeholder="Data da aplicação da prova"
			/>
			<Input
				label="Ícones em Ambos os Lados"
				leftIcon={<Sparkles />}
				rightIcon={<BookOpen />}
				placeholder="Prompt para gerar questões com IA..."
			/>
		</div>
	),
}

export const WithAddons: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<Input
				label="Com Prefixo (Left Addon)"
				leftAddon="https://"
				placeholder="escola.edu.br"
			/>
			<Input
				label="Com Sufixo (Right Addon)"
				rightAddon="@escola.com.br"
				placeholder="nome.sobrenome"
			/>
			<Input
				label="Valor Monetário"
				leftAddon="R$"
				rightAddon=",00"
				placeholder="150"
			/>
		</div>
	),
}

export const PasswordToggle: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<Input
				type="password"
				label="Senha de Acesso"
				leftIcon={<Lock />}
				placeholder="Digite sua senha secreta"
				helperText="Clique no ícone de olho para revelar ou ocultar a senha."
			/>
		</div>
	),
}

export const ClearableInput: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<Input
				label="Busca Limpável"
				leftIcon={<Search />}
				isClearable
				defaultValue="Matemática Financeira"
				placeholder="Digite para filtrar..."
				helperText="Clique no 'X' para limpar o campo instantaneamente."
			/>
		</div>
	),
}

export const LoadingState: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<Input
				label="Validando Código da Turma"
				leftIcon={<School />}
				defaultValue="TURMA-9A-2026"
				isLoading
				helperText="Verificando no banco de dados..."
			/>
		</div>
	),
}

export const Shapes: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<Input
				shape="pill"
				leftIcon={<Search />}
				placeholder="Barra de busca arredondada (Pill)..."
			/>
			<Input shape="default" placeholder="Formato padrão (Raio de 8px)" />
			<Input shape="square" placeholder="Formato reto (Square 0px)" />
		</div>
	),
}

export const DisabledAndReadOnly: Story = {
	render: () => (
		<div className="flex flex-col gap-4 w-80">
			<Input
				label="Campo Desabilitado"
				leftIcon={<User />}
				disabled
				defaultValue="pedro.prof@instituicao.br"
				helperText="Este campo não pode ser editado pelo usuário."
			/>
			<Input
				label="Campo ReadOnly (Somente Leitura)"
				leftIcon={<Key />}
				readOnly
				defaultValue="API-KEY-IA-99482710492"
				helperText="Chave gerada pelo sistema."
			/>
		</div>
	),
}

