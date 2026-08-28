import { zodResolver } from '@hookform/resolvers/zod'
import type { Meta, StoryObj } from '@storybook/react'
import { BookOpen, Sparkles } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from './button'
import { Checkbox } from './checkbox'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './form'
import { Input } from './input'
import { Slider } from './slider'
import { Switch } from './switch'
import { Textarea } from './textarea'

const meta: Meta<typeof Form> = {
	title: 'Components/Form (React Hook Form)',
	component: Form,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componentes de composição e ponte de contexto entre o React Hook Form + Zod e os primitivos de UI (`Input`, `Textarea`, `Checkbox`, `Slider`, `Switch`, etc.), garantindo validação centralizada e acessibilidade automática (htmlFor ↔ id ↔ aria-describedby ↔ aria-invalid).',
			},
		},
	},
}

export default meta
type Story = StoryObj<typeof Form>

const signInSchema = z.object({
	email: z.string().email('Insira um e-mail válido para acessar'),
	password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
	remember: z.boolean(),
})

type SignInInput = z.infer<typeof signInSchema>

export const SignInFormExample: Story = {
	render: () => {
		const form = useForm<SignInInput>({
			resolver: zodResolver(signInSchema),
			defaultValues: {
				email: '',
				password: '',
				remember: false,
			},
		})

		function onSubmit(data: SignInInput) {
			alert(`Form submetido com sucesso:\n${JSON.stringify(data, null, 2)}`)
		}

		return (
			<div className="w-80 max-w-full">
				<h3 className="text-base font-semibold text-foreground mb-1">
					Entrar na Plataforma
				</h3>
				<p className="text-xs text-muted-foreground mb-5">
					Acesse seu painel de avaliações
				</p>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>E-mail do Docente</FormLabel>
									<FormControl>
										<Input
											placeholder="exemplo@escola.edu.br"
											type="email"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Senha</FormLabel>
									<FormControl>
										<Input placeholder="••••••••" type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="remember"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Checkbox
											label="Lembrar de mim por 30 dias"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<Button type="submit" fullWidth className="mt-2">
							Entrar
						</Button>
					</form>
				</Form>
			</div>
		)
	},
}

const createExamSchema = z.object({
	title: z.string().min(3, 'O título deve ter no mínimo 3 caracteres'),
	topic: z.string().min(5, 'Descreva o tema com pelo menos 5 caracteres'),
	questionsCount: z.array(z.number()),
	includeTrueFalse: z.boolean(),
})

type CreateExamInput = z.infer<typeof createExamSchema>

export const CreateExamWithAIShowcase: Story = {
	render: () => {
		const form = useForm<CreateExamInput>({
			resolver: zodResolver(createExamSchema),
			defaultValues: {
				title: '',
				topic: '',
				questionsCount: [10],
				includeTrueFalse: true,
			},
		})

		function onSubmit(data: CreateExamInput) {
			alert(`Prova gerada:\n${JSON.stringify(data, null, 2)}`)
		}

		return (
			<div className="w-96 max-w-full">
				<div className="flex items-center gap-2 mb-4">
					<div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
						<Sparkles className="size-4" />
					</div>
					<div>
						<h3 className="text-sm font-semibold">Nova Avaliação com IA</h3>
						<p className="text-xs text-muted-foreground">
							RF05: Gerador de Provas
						</p>
					</div>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel required leftIcon={<BookOpen />}>
										Título da Prova
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Ex: Prova Bimestral de História"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="topic"
							render={({ field }) => (
								<FormItem>
									<FormLabel required>Instruções / Tema da IA</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Ex: Crie questões contextualizadas sobre a Revolução Industrial..."
											rows={3}
											{...field}
										/>
									</FormControl>
									<FormDescription>
										A IA utilizará essas diretrizes para elaborar as questões e
										gabarito.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="questionsCount"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Slider
											label="Quantidade de Questões"
											min={1}
											max={30}
											showValue
											valueSuffix=" questões"
											value={field.value}
											onValueChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="includeTrueFalse"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Switch
											asCard
											label="Incluir Questões V / F"
											description="Mescla múltipla escolha com afirmações Verdadeiro ou Falso."
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>

						<Button type="submit" fullWidth leftIcon={<Sparkles />}>
							Gerar Prova com IA
						</Button>
					</form>
				</Form>
			</div>
		)
	},
}
