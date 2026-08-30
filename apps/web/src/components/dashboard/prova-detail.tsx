'use client'

import type { GenerateExamInput } from '@app/shared'
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	RadioGroup,
	RadioGroupItem,
	Skeleton,
	Slider,
	Textarea,
	toast,
} from '@app/ui'
import { ArrowLeft, FileText, SearchX, Sparkles } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { useExam, useGenerateExam } from '@/hooks/use-exams'
import { ApiError } from '@/lib/api-client'
import { toastApiError } from '@/lib/api-error-handler'
import { ProvaResultado } from './prova-resultado'

interface ProvaDetailProps {
	turmaId: string
	examId: string
}

export function ProvaDetail({ turmaId, examId }: ProvaDetailProps) {
	const { data: exam, isLoading, error } = useExam(examId)
	const generateExam = useGenerateExam(examId)

	const [topic, setTopic] = React.useState('')
	const [difficulty, setDifficulty] = React.useState(5)
	const [questionCount, setQuestionCount] = React.useState(10)
	const [questionType, setQuestionType] =
		React.useState<GenerateExamInput['questionType']>('multiple_choice')
	const [multipleChoiceCount, setMultipleChoiceCount] = React.useState(5)

	const trimmedTopic = topic.trim()
	const isTopicValid = trimmedTopic.length >= 3

	React.useEffect(() => {
		setMultipleChoiceCount((prev) => Math.min(prev, questionCount))
	}, [questionCount])

	function handleGenerate() {
		if (!isTopicValid) return

		generateExam.mutate(
			{
				topic: trimmedTopic,
				difficulty,
				questionCount,
				questionType,
				...(questionType === 'mixed' ? { multipleChoiceCount } : {}),
			},
			{
				onSuccess: () => {
					toast.success('Prova gerada com sucesso!')
				},
				onError: (err) => {
					toastApiError(err, 'Não foi possível gerar a prova. Tente novamente.')
				},
			},
		)
	}

	if (isLoading) {
		return (
			<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-48 rounded-2xl" />
			</div>
		)
	}

	if (error || !exam) {
		const isNotFound = error instanceof ApiError && error.code === 'NOT_FOUND'

		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
				<div className="size-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
					<SearchX className="size-6" />
				</div>
				<h1 className="text-base font-semibold text-foreground">
					{isNotFound
						? 'Prova não encontrada'
						: 'Não foi possível carregar a prova'}
				</h1>
				<p className="max-w-sm text-sm text-muted-foreground">
					{isNotFound
						? 'Essa prova não existe ou foi removida.'
						: 'Tente recarregar a página em alguns instantes.'}
				</p>
				<Button variant="outline" size="sm" asChild leftIcon={<ArrowLeft />}>
					<Link href={`/dashboard/turmas/${turmaId}`}>Voltar para a turma</Link>
				</Button>
			</div>
		)
	}

	const hasQuestions = exam.questions.length > 0

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<Link
				href={`/dashboard/turmas/${turmaId}`}
				className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
			>
				<ArrowLeft className="size-3.5" />
				Voltar para a turma
			</Link>

			<div>
				<div className="flex items-center gap-2">
					<h1 className="text-xl font-bold tracking-tight text-foreground">
						{exam.title}
					</h1>
					<Badge variant="subtle" size="sm">
						{exam.status === 'draft' ? 'Rascunho' : 'Finalizada'}
					</Badge>
				</div>
				{exam.description && (
					<p className="mt-1 text-sm text-muted-foreground">
						{exam.description}
					</p>
				)}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Configurar geração</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-5">
					<div className="flex flex-col gap-1.5">
						<span className="text-xs font-semibold tracking-wide text-foreground">
							Conteúdo da prova
						</span>
						<Textarea
							placeholder="Ex: Frações, MDC e MMC, operações com números decimais..."
							size="sm"
							showCount
							maxLength={500}
							value={topic}
							disabled={generateExam.isPending}
							onChange={(e) => setTopic(e.target.value)}
						/>
						<span className="text-xs text-muted-foreground">
							Descreva os tópicos que a IA deve cobrir ao gerar as questões.
						</span>
					</div>

					<Slider
						label="Dificuldade"
						min={0}
						max={10}
						step={1}
						showValue
						valueSuffix="/10"
						value={[difficulty]}
						onValueChange={([value]) => setDifficulty(value)}
						disabled={generateExam.isPending}
					/>

					<div className="flex flex-col gap-1.5">
						<span className="text-xs font-semibold tracking-wide text-foreground">
							Quantidade de questões
						</span>
						<Input
							type="number"
							min={1}
							max={20}
							value={questionCount}
							disabled={generateExam.isPending}
							onChange={(e) => {
								const value = e.target.valueAsNumber
								if (!Number.isNaN(value)) {
									setQuestionCount(Math.min(20, Math.max(1, value)))
								}
							}}
						/>
					</div>

					<RadioGroup
						value={questionType}
						onValueChange={(value) =>
							setQuestionType(value as GenerateExamInput['questionType'])
						}
						orientation="horizontal"
						className="grid grid-cols-1 sm:grid-cols-3 gap-3"
						disabled={generateExam.isPending}
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
						<RadioGroupItem
							asCard
							value="mixed"
							label="Mista"
							description="Combina múltipla escolha e V/F."
						/>
					</RadioGroup>

					{questionType === 'mixed' && (
						<Slider
							label="Divisão da prova mista"
							min={0}
							max={questionCount}
							step={1}
							showValue
							value={[multipleChoiceCount]}
							onValueChange={([value]) => setMultipleChoiceCount(value)}
							formatValue={(value) =>
								`${value} múltipla escolha • ${questionCount - value} V ou F`
							}
							disabled={generateExam.isPending}
						/>
					)}

					<div>
						<Button
							leftIcon={<Sparkles />}
							isLoading={generateExam.isPending}
							disabled={!isTopicValid}
							onClick={handleGenerate}
						>
							{hasQuestions ? 'Gerar novamente' : 'Gerar'}
						</Button>
					</div>
				</CardContent>
			</Card>

			{generateExam.isPending ? (
				<ProvaResultadoSkeleton count={questionCount} />
			) : hasQuestions ? (
				<ProvaResultado exam={exam} />
			) : (
				<div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
					<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
						<FileText className="size-6" />
					</div>
					<h2 className="text-base font-semibold text-foreground">
						Nenhuma questão gerada ainda
					</h2>
					<p className="max-w-sm text-sm text-muted-foreground">
						Informe o conteúdo da prova e clique em "Gerar".
					</p>
				</div>
			)}
		</div>
	)
}

function ProvaResultadoSkeleton({ count }: { count: number }) {
	const [visibleCount, setVisibleCount] = React.useState(1)
	const keys = React.useMemo(
		() => Array.from({ length: count }, () => crypto.randomUUID()),
		[count],
	)

	React.useEffect(() => {
		const interval = setInterval(() => {
			setVisibleCount((prev) => (prev < count ? prev + 1 : prev))
		}, 800)
		return () => clearInterval(interval)
	}, [count])

	return (
		<div className="flex flex-col gap-4">
			{keys.slice(0, visibleCount).map((key) => (
				<Card
					key={key}
					className="animate-in fade-in slide-in-from-bottom-4 duration-500"
				>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Skeleton className="size-5 rounded-full shrink-0" />
							<Skeleton className="h-5 w-3/4" />
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<Skeleton className="h-12 w-full rounded-xl" />
							<Skeleton className="h-12 w-full rounded-xl" />
							<Skeleton className="h-12 w-full rounded-xl" />
							<Skeleton className="h-12 w-full rounded-xl" />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
