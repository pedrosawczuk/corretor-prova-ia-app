'use client'

import { type GenerateExamInput, generateExamSchema } from '@app/shared'
import {
	Button,
	DialogFooter,
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
	Input,
	RadioGroup,
	RadioGroupItem,
	Select,
	SelectItem,
	Slider,
} from '@app/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Classroom } from '@/hooks/use-classrooms'

interface GerarProvaFormProps {
	classroomId?: string
	classrooms?: Classroom[]
	onSubmit: (data: GenerateExamInput) => void
	onCancel: () => void
	isPending: boolean
}

export function GerarProvaForm({
	classroomId,
	classrooms,
	onSubmit,
	onCancel,
	isPending,
}: GerarProvaFormProps) {
	const form = useForm<GenerateExamInput>({
		resolver: zodResolver(generateExamSchema),
		defaultValues: {
			classroomId: classroomId ?? '',
			difficulty: 5,
			questionCount: 10,
			questionType: 'multiple_choice',
		},
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="classroomId"
					render={({ field }) => (
						<FormItem>
							<FormLabel required>Turma</FormLabel>
							<FormControl>
								<Select
									value={field.value}
									onValueChange={field.onChange}
									disabled={Boolean(classroomId) || isPending}
									placeholder="Selecione a turma"
								>
									{(classrooms ?? []).map((classroom) => (
										<SelectItem key={classroom.id} value={classroom.id}>
											{classroom.name} — {classroom.subject}
										</SelectItem>
									))}
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="difficulty"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Slider
									label="Dificuldade"
									min={0}
									max={10}
									step={1}
									showValue
									valueSuffix="/10"
									value={[field.value]}
									onValueChange={([value]) => field.onChange(value)}
									disabled={isPending}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="questionCount"
					render={({ field }) => (
						<FormItem>
							<FormLabel required>Quantidade de questões</FormLabel>
							<FormControl>
								<Input
									type="number"
									min={1}
									max={20}
									disabled={isPending}
									value={field.value}
									onChange={(e) => field.onChange(e.target.valueAsNumber)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="questionType"
					render={({ field }) => (
						<FormItem>
							<FormLabel required>Tipo de questão</FormLabel>
							<FormControl>
								<RadioGroup
									value={field.value}
									onValueChange={field.onChange}
									orientation="horizontal"
									className="grid grid-cols-1 sm:grid-cols-2 gap-3"
									disabled={isPending}
								>
									<RadioGroupItem
										asCard
										value="multiple_choice"
										label="Múltipla escolha"
										description="4 alternativas, uma correta."
									/>
									<RadioGroupItem
										asCard
										value="true_false"
										label="Verdadeiro ou falso"
										description="2 alternativas, uma correta."
									/>
								</RadioGroup>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isPending}
					>
						Cancelar
					</Button>
					<Button type="submit" isLoading={isPending}>
						Gerar Prova
					</Button>
				</DialogFooter>
			</form>
		</Form>
	)
}
