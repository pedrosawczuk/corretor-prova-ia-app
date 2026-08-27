import type { Meta, StoryObj } from '@storybook/react'
import {
	ArrowRight,
	BookOpen,
	Camera,
	Check,
	MoreVertical,
	Plus,
	Printer,
	QrCode,
	Sparkles,
	Users,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from './alert'
import { Badge } from './badge'
import { Button } from './button'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardMedia,
	CardTitle,
} from './card'
import { Separator } from './separator'

const meta: Meta<typeof Card> = {
	title: 'Components/Card',
	component: Card,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente estrutural versátil para exibição de blocos de conteúdo, cards de turmas (RF04), avaliações, planos de assinatura, formulários de autenticação e relatórios de correção com IA.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: [
				'default',
				'elevated',
				'outline',
				'primary',
				'subtle',
				'glass',
				'dashed',
			],
			description: 'Estilo visual da superfície do card',
		},
		interactive: {
			control: 'boolean',
			description:
				'Habilita efeito sutil de hover e clique para cards navegáveis',
		},
	},
}

export default meta
type Story = StoryObj<typeof Card>

export const ClassroomCard: Story = {
	render: () => (
		<Card interactive className="w-80">
			<CardHeader>
				<div className="flex items-center justify-between">
					<Badge variant="secondary" size="sm" leftIcon={<BookOpen />}>
						História
					</Badge>
					<Button size="icon-xs" variant="ghost" aria-label="Opções da turma">
						<MoreVertical />
					</Button>
				</div>
				<CardTitle className="mt-2">8º Ano A - Matutino</CardTitle>
				<CardDescription>Ensino Fundamental II • Sala 14</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
					<span className="flex items-center gap-1.5 font-medium text-foreground">
						<Users className="size-4 text-primary" /> 34 Alunos
					</span>
					<span>6 Avaliações</span>
				</div>
			</CardContent>
			<CardFooter>
				<Button
					size="sm"
					variant="default"
					fullWidth
					rightIcon={<ArrowRight />}
				>
					Acessar Turma
				</Button>
			</CardFooter>
		</Card>
	),
}

export const ExamWithAlertCard: Story = {
	render: () => (
		<Card className="w-96">
			<CardHeader>
				<div className="flex items-center justify-between">
					<span className="text-xs font-semibold text-primary uppercase tracking-wider">
						Avaliação Bimestral 1
					</span>
					<Badge variant="warning-outline" shape="pill" dot pulse size="xs">
						REQUER REVISÃO
					</Badge>
				</div>
				<CardTitle className="mt-1">Revolução Francesa & Iluminismo</CardTitle>
				<CardDescription>Data de Aplicação: 28/08/2026</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Alert variant="warning">
					<AlertTitle>Atenção no OCR</AlertTitle>
					<AlertDescription>
						3 folhas digitalizadas possuem respostas rasuradas que necessitam de
						confirmação manual.
					</AlertDescription>
				</Alert>

				<div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-muted/30 border text-xs">
					<div>
						<span className="text-muted-foreground block">Questões</span>
						<strong className="text-sm font-bold text-foreground">10</strong>
					</div>
					<div>
						<span className="text-muted-foreground block">Média</span>
						<strong className="text-sm font-bold text-success">8.4</strong>
					</div>
					<div>
						<span className="text-muted-foreground block">Corrigidas</span>
						<strong className="text-sm font-bold text-foreground">32/34</strong>
					</div>
				</div>
			</CardContent>
			<CardFooter className="flex gap-2">
				<Button size="sm" variant="outline" fullWidth leftIcon={<Printer />}>
					Gabarito
				</Button>
				<Button size="sm" variant="default" fullWidth leftIcon={<Camera />}>
					Continuar Scan
				</Button>
			</CardFooter>
		</Card>
	),
}

export const PricingPlanCard: Story = {
	render: () => (
		<Card
			variant="primary"
			className="w-80 relative overflow-hidden shadow-lg border-primary/40"
		>
			<div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
				Mais Popular
			</div>

			<CardHeader>
				<Badge
					variant="primary"
					size="xs"
					className="w-fit"
					leftIcon={<Sparkles />}
				>
					PRO DOCENTE
				</Badge>
				<CardTitle className="text-2xl font-bold mt-2">
					R$ 29
					<span className="text-sm font-normal text-muted-foreground">
						/mês
					</span>
				</CardTitle>
				<CardDescription>
					Para professores que corrigem provas semanalmente e querem economizar
					até 10h por mês.
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-3">
				<Separator />
				<ul className="space-y-2.5 text-xs text-foreground">
					<li className="flex items-center gap-2">
						<Check className="size-4 text-success shrink-0" />
						<span>Provas Ilimitadas geradas por IA</span>
					</li>
					<li className="flex items-center gap-2">
						<Check className="size-4 text-success shrink-0" />
						<span>Correção contínua por câmera sem limites</span>
					</li>
					<li className="flex items-center gap-2">
						<Check className="size-4 text-success shrink-0" />
						<span>Gabarito automático com justificativas</span>
					</li>
					<li className="flex items-center gap-2">
						<Check className="size-4 text-success shrink-0" />
						<span>Exportação para PDF com QR Code</span>
					</li>
				</ul>
			</CardContent>

			<CardFooter>
				<Button size="lg" variant="default" fullWidth leftIcon={<Sparkles />}>
					Assinar Plano PRO
				</Button>
			</CardFooter>
		</Card>
	),
}

export const CardWithMedia: Story = {
	render: () => (
		<Card className="w-80 overflow-hidden">
			<CardMedia
				aspectRatio="16/9"
				className="bg-slate-900 flex items-center justify-center p-4"
			>
				<div className="flex flex-col items-center gap-2 text-slate-300">
					<QrCode className="size-10 text-primary animate-pulse" />
					<span className="text-xs font-medium">Reconhecimento Visual IA</span>
				</div>
			</CardMedia>
			<CardHeader>
				<CardTitle>Scanner Instantâneo</CardTitle>
				<CardDescription>
					Aponte a câmera para a folha de respostas e obtenha a nota com
					discriminação de erros e acertos em tempo real.
				</CardDescription>
			</CardHeader>
			<CardFooter>
				<Button size="sm" variant="outline" fullWidth>
					Ver Demonstração
				</Button>
			</CardFooter>
		</Card>
	),
}

export const CreateNewClassroomPlaceholder: Story = {
	render: () => (
		<Card
			variant="dashed"
			interactive
			className="w-80 h-64 flex flex-col items-center justify-center text-center p-6 cursor-pointer"
		>
			<div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
				<Plus className="size-6" />
			</div>
			<h4 className="font-semibold text-sm text-foreground">
				Criar Nova Turma
			</h4>
			<p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
				Organize suas provas em pastas por matéria ou ano letivo.
			</p>
		</Card>
	),
}
