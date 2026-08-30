'use client'

import { type Exam, letterForOptionIndex, type Question } from '@app/shared'
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
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Input,
	Textarea,
	toast,
} from '@app/ui'
import {
	Check,
	CheckCircle2,
	GripVertical,
	Loader2,
	Pencil,
	Sparkles,
	Trash2,
	X,
} from 'lucide-react'
import * as React from 'react'
import {
	useDeleteQuestion,
	useRegenerateQuestion,
	useUpdateCorrectOption,
	useUpdateQuestion,
} from '@/hooks/use-exams'
import { toastApiError } from '@/lib/api-error-handler'

interface ProvaResultadoProps {
	exam: Exam
}

export function ProvaResultado({ exam }: ProvaResultadoProps) {
	const questions = [...exam.questions].sort((a, b) => a.order - b.order)

	return (
		<div className="flex flex-col gap-4">
			{questions.map((question, index) => (
				<div
					key={question.id}
					className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
					style={{
						animationDelay: `${index * 150}ms`,
						animationDuration: '500ms',
					}}
				>
					<QuestionCard examId={exam.id} question={question} />
				</div>
			))}
		</div>
	)
}

interface QuestionCardProps {
	examId: string
	question: Question
}

function QuestionCard({ examId, question }: QuestionCardProps) {
	const updateCorrectOption = useUpdateCorrectOption(examId, question.id)
	const updateQuestion = useUpdateQuestion(examId, question.id)
	const regenerateQuestion = useRegenerateQuestion(examId, question.id)
	const deleteQuestion = useDeleteQuestion(examId, question.id)

	const [isEditing, setIsEditing] = React.useState(false)
	const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
	const [editStatement, setEditStatement] = React.useState(question.statement)
	const [editOptions, setEditOptions] = React.useState(
		question.options.map((o) => ({ id: o.id, text: o.text })),
	)
	const [dragIndex, setDragIndex] = React.useState<number | null>(null)
	const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

	React.useEffect(() => {
		setEditStatement(question.statement)
		setEditOptions(question.options.map((o) => ({ id: o.id, text: o.text })))
	}, [question])

	function handleOptionDrop(targetIndex: number) {
		setEditOptions((prev) => {
			if (dragIndex === null || dragIndex === targetIndex) return prev

			const next = [...prev]
			const [moved] = next.splice(dragIndex, 1)
			next.splice(targetIndex, 0, moved)
			return next
		})
		setDragIndex(null)
		setDragOverIndex(null)
	}

	function handleSelect(optionId: string) {
		if (
			updateCorrectOption.isPending ||
			isEditing ||
			regenerateQuestion.isPending
		)
			return

		updateCorrectOption.mutate(optionId, {
			onError: (error) => {
				toastApiError(error, 'Não foi possível marcar essa alternativa.')
			},
		})
	}

	function handleSave() {
		updateQuestion.mutate(
			{ statement: editStatement, options: editOptions },
			{
				onSuccess: () => {
					setIsEditing(false)
					toast.success('Questão atualizada com sucesso.')
				},
				onError: (error) => {
					toastApiError(error, 'Falha ao atualizar questão.')
				},
			},
		)
	}

	function handleRegenerate(difficulty: number) {
		regenerateQuestion.mutate(
			{ difficulty },
			{
				onSuccess: () => {
					toast.success('Questão regerada com IA!')
				},
				onError: (error) => {
					toastApiError(error, 'Falha ao regerar questão.')
				},
			},
		)
	}

	function handleDelete() {
		deleteQuestion.mutate(undefined, {
			onSuccess: () => {
				setShowDeleteConfirm(false)
				toast.success('Questão excluída.')
			},
			onError: (error) => {
				toastApiError(error, 'Falha ao excluir questão.')
			},
		})
	}

	const isProcessing =
		regenerateQuestion.isPending ||
		updateQuestion.isPending ||
		deleteQuestion.isPending

	return (
		<Card
			className={`group relative transition-all ${isProcessing ? 'opacity-70 pointer-events-none' : ''}`}
		>
			{isProcessing && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 rounded-xl backdrop-blur-sm">
					<div className="flex items-center gap-2 text-primary font-medium">
						<Loader2 className="size-5 animate-spin" />
						<span>Processando...</span>
					</div>
				</div>
			)}
			<CardHeader className="relative pb-4">
				<div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
					{!isEditing && (
						<>
							<Button
								variant="outline"
								size="icon"
								className="h-8 w-8"
								onClick={() => setIsEditing(true)}
								title="Editar"
							>
								<Pencil className="size-4" />
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="default"
										size="icon"
										className="h-8 w-8"
										title="Gerar com IA"
									>
										<Sparkles className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuLabel className="text-xs">
										Dificuldade
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => handleRegenerate(3)}>
										Muito Fácil
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleRegenerate(5)}>
										Normal
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleRegenerate(8)}>
										Difícil
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => handleRegenerate(10)}>
										Muito Difícil
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<Button
								variant="destructive"
								size="icon"
								className="h-8 w-8"
								onClick={() => setShowDeleteConfirm(true)}
								title="Excluir"
							>
								<Trash2 className="size-4" />
							</Button>
						</>
					)}
				</div>

				{isEditing ? (
					<div className="flex w-full flex-col gap-2 mt-2">
						<span className="text-sm text-muted-foreground font-medium">
							Enunciado:
						</span>
						<Textarea
							value={editStatement}
							onChange={(e) => setEditStatement(e.target.value)}
							className="text-base font-normal min-h-[100px] w-full"
						/>
					</div>
				) : (
					<CardTitle className="pr-24">
						<div className="leading-relaxed">
							<span className="text-muted-foreground mr-1 font-semibold">
								{String(question.order + 1).padStart(2, '0')}.
							</span>
							{question.statement}
						</div>
					</CardTitle>
				)}
			</CardHeader>
			<CardContent>
				<div className="flex flex-col gap-3">
					{isEditing && (
						<span className="text-sm text-muted-foreground font-medium">
							Alternativas: arraste{' '}
							<GripVertical className="inline size-3.5 -mt-0.5" /> para
							reordenar.
						</span>
					)}
					<ul className="grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
						{isEditing
							? editOptions.map((option, index) => {
									const isCorrect = question.options.find(
										(o) => o.id === option.id,
									)?.isCorrect
									const isDragging = dragIndex === index
									const isDropTarget =
										dragOverIndex === index &&
										dragIndex !== null &&
										dragIndex !== index

									return (
										<li
											key={option.id}
											aria-roledescription="alternativa arrastável"
											draggable
											onDragStart={() => setDragIndex(index)}
											onDragOver={(e) => {
												e.preventDefault()
												setDragOverIndex(index)
											}}
											onDragLeave={() =>
												setDragOverIndex((prev) =>
													prev === index ? null : prev,
												)
											}
											onDrop={(e) => {
												e.preventDefault()
												handleOptionDrop(index)
											}}
											onDragEnd={() => {
												setDragIndex(null)
												setDragOverIndex(null)
											}}
											className={`flex items-center gap-2 rounded-lg border p-1 transition-colors ${
												isDropTarget
													? 'border-primary bg-primary/5'
													: 'border-transparent'
											} ${isDragging ? 'opacity-40' : ''}`}
										>
											<span
												className="cursor-grab text-muted-foreground shrink-0 active:cursor-grabbing"
												title="Arrastar para reordenar"
											>
												<GripVertical className="size-4" />
											</span>
											<span
												className={`font-semibold shrink-0 w-5 ${isCorrect ? 'text-success' : 'text-muted-foreground'}`}
											>
												{letterForOptionIndex(question.type, index)})
											</span>
											<Input
												value={option.text}
												onChange={(e) => {
													const value = e.target.value
													setEditOptions((prev) =>
														prev.map((o, i) =>
															i === index ? { ...o, text: value } : o,
														),
													)
												}}
											/>
											{isCorrect && (
												<CheckCircle2 className="size-4 shrink-0 text-success" />
											)}
										</li>
									)
								})
							: question.options.map((option) => (
									<li key={option.id}>
										<button
											type="button"
											onClick={() => handleSelect(option.id)}
											className={`flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm transition-colors disabled:cursor-not-allowed ${
												option.isCorrect
													? 'border-success bg-success/5 text-foreground cursor-default ring-1 ring-success/20'
													: 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/30 cursor-pointer'
											}`}
										>
											{option.isCorrect ? (
												<CheckCircle2 className="size-4 shrink-0 text-success mt-0.5" />
											) : (
												<span className="size-4 shrink-0 mt-0.5" />
											)}
											<span className="leading-snug">
												<span className="font-semibold mr-1">
													{option.letter})
												</span>
												{option.text}
											</span>
										</button>
									</li>
								))}
					</ul>

					{isEditing && (
						<div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-border">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsEditing(false)}
							>
								<X className="size-4 mr-1.5" /> Cancelar
							</Button>
							<Button variant="default" size="sm" onClick={handleSave}>
								<Check className="size-4 mr-1.5" /> Salvar edição
							</Button>
						</div>
					)}
				</div>
			</CardContent>

			<AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
				<AlertDialogContent>
					<AlertDialogMedia variant="destructive">
						<Trash2 />
					</AlertDialogMedia>
					<AlertDialogHeader>
						<AlertDialogTitle>Excluir esta questão?</AlertDialogTitle>
						<AlertDialogDescription>
							Essa ação não pode ser desfeita. A questão e suas alternativas
							serão removidas permanentemente da prova.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteQuestion.isPending}>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={deleteQuestion.isPending}
							onClick={(event) => {
								event.preventDefault()
								handleDelete()
							}}
						>
							{deleteQuestion.isPending ? 'Excluindo...' : 'Excluir questão'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Card>
	)
}
