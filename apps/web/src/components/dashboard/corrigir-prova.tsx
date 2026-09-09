'use client'

import {
	Badge,
	Button,
	Card,
	CardContent,
	Input,
	Skeleton,
	toast,
} from '@app/ui'
import {
	AlertTriangle,
	ArrowLeft,
	Camera,
	CheckCircle2,
	Download,
	RotateCcw,
	ScanLine,
	SearchX,
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import * as React from 'react'
import { useClassroomStudentSuggestions } from '@/hooks/use-classrooms'
import { useExam, useExportExam } from '@/hooks/use-exams'
import {
	useCreateSubmission,
	useProcessSubmission,
	useSubmission,
	useUploadSubmissionPage,
} from '@/hooks/use-submissions'
import { ApiError } from '@/lib/api-client'
import { toastApiError } from '@/lib/api-error-handler'
import {
	buildMisalignedPagesWarning,
	countPendingReview,
	getMisalignedPageNumbers,
} from './corrigir-prova.utils'
import { CorrigirProvaCamera } from './corrigir-prova-camera'
import { CorrigirProvaResultado } from './corrigir-prova-resultado'
import { CorrigirProvaScanAnimation } from './corrigir-prova-scan-animation'

type Step = 'intro' | 'capturing' | 'review' | 'processing' | 'result'

interface CorrigirProvaProps {
	turmaId: string
	examId: string
}

export function CorrigirProva({ turmaId, examId }: CorrigirProvaProps) {
	const searchParams = useSearchParams()
	const querySubmissionId = searchParams.get('submissionId')

	const { data: exam, isLoading, error } = useExam(examId)
	const exportExam = useExportExam(examId)

	const [step, setStep] = React.useState<Step>(
		querySubmissionId ? 'result' : 'intro',
	)
	const [studentName, setStudentName] = React.useState('')
	const [submissionId, setSubmissionId] = React.useState<string | undefined>(
		querySubmissionId ?? undefined,
	)
	const [pagePreviews, setPagePreviews] = React.useState<string[]>([])

	const { data: studentSuggestions = [] } =
		useClassroomStudentSuggestions(turmaId)

	const createSubmission = useCreateSubmission(examId)
	const uploadPage = useUploadSubmissionPage(submissionId ?? '')
	const processSubmission = useProcessSubmission(submissionId ?? '')
	const { data: submission } = useSubmission(submissionId)

	const pagePreviewsRef = React.useRef(pagePreviews)
	pagePreviewsRef.current = pagePreviews

	React.useEffect(() => {
		if (querySubmissionId) {
			setSubmissionId(querySubmissionId)
			setStep('result')
		}
	}, [querySubmissionId])

	React.useEffect(() => {
		return () => {
			for (const url of pagePreviewsRef.current) URL.revokeObjectURL(url)
		}
	}, [])

	if (isLoading) {
		return (
			<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
				<Skeleton className="h-8 w-40" />
				<Skeleton className="h-64 rounded-2xl" />
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
				<Button variant="outline" size="sm" asChild leftIcon={<ArrowLeft />}>
					<Link href={`/dashboard/turmas/${turmaId}/provas/${examId}`}>
						Voltar
					</Link>
				</Button>
			</div>
		)
	}

	const totalPages = exam.templatePageCount

	function handleStart() {
		createSubmission.mutate(studentName.trim() || undefined, {
			onSuccess: (submissionRow) => {
				setSubmissionId(submissionRow.id)
				setStep('capturing')
			},
			onError: (err) => {
				toastApiError(err, 'Não foi possível iniciar a correção.')
			},
		})
	}

	function handleCapture(blob: Blob) {
		uploadPage.mutate(blob, {
			onSuccess: () => {
				setPagePreviews((prev) => [...prev, URL.createObjectURL(blob)])
			},
			onError: (err) => {
				toastApiError(err, 'Não foi possível enviar a foto. Tente novamente.')
			},
		})
	}

	function handleRetakeLast() {
		setPagePreviews((prev) => {
			const last = prev.at(-1)
			if (last) URL.revokeObjectURL(last)
			return prev.slice(0, -1)
		})
	}

	function handleProcess() {
		setStep('processing')
		processSubmission.mutate(undefined, {
			onSuccess: (result) => {
				setStep('result')
				const pending = countPendingReview(result)
				if (pending > 0) {
					toast.info(`${pending} questão(ões) precisam da sua revisão manual.`)
				} else {
					toast.success('Prova corrigida automaticamente com sucesso!')
				}
			},
			onError: (err) => {
				setStep('review')
				toastApiError(err, 'Não foi possível processar a correção.')
			},
		})
	}

	if (step === 'result') {
		if (!submission) {
			return (
				<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
					<Skeleton className="h-64 rounded-2xl" />
				</div>
			)
		}

		const pending = countPendingReview(submission)
		const misalignedPages = getMisalignedPageNumbers(submission)

		return (
			<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
				<Link
					href={`/dashboard/turmas/${turmaId}/provas/${examId}`}
					className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="size-3.5" />
					Voltar para a prova
				</Link>

				{misalignedPages.length > 0 && (
					<div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
						<AlertTriangle className="size-4 shrink-0 mt-0.5" />
						<p>{buildMisalignedPagesWarning(misalignedPages)}</p>
					</div>
				)}

				<Card variant="subtle">
					<CardContent className="flex items-center justify-between gap-4 pt-4 sm:pt-6">
						<div>
							<p className="text-sm font-semibold text-foreground">
								{submission.studentIdentifier
									? `Correção de ${submission.studentIdentifier}`
									: 'Correção sem identificação'}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">Nota apurada</p>
							<p className="text-2xl font-bold text-foreground">
								{submission.totalScore ?? '0.00'}{' '}
								<span className="text-sm font-normal text-muted-foreground">
									/ {exam.totalPoints}
								</span>
							</p>
						</div>
						{pending > 0 ? (
							<Badge variant="warning-outline">
								{pending} pendente(s) de revisão
							</Badge>
						) : (
							<Badge variant="success-outline">
								<CheckCircle2 className="size-3.5" />
								Correção concluída
							</Badge>
						)}
					</CardContent>
				</Card>

				<CorrigirProvaResultado exam={exam} submission={submission} />
			</div>
		)
	}

	if (step === 'intro' || !totalPages) {
		return (
			<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
				<Link
					href={`/dashboard/turmas/${turmaId}/provas/${examId}`}
					className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					<ArrowLeft className="size-3.5" />
					Voltar para a prova
				</Link>

				<div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
					<div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
						<ScanLine className="size-7" />
					</div>
					<div>
						<h1 className="text-lg font-bold text-foreground">
							Corrigir "{exam.title}" por foto
						</h1>
						<p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
							{totalPages
								? `Essa prova tem ${totalPages} página(s) impressa(s). Tenha a folha respondida pelo aluno em mãos.`
								: 'Exporte a prova em PDF pelo menos uma vez antes de corrigir por foto — é assim que travamos onde cada alternativa fica impressa.'}
						</p>
					</div>

					{totalPages ? (
						<div className="flex w-full max-w-sm flex-col gap-4">
							<Input
								label="Nome do aluno (opcional)"
								placeholder="Ex: Ana Silva"
								value={studentName}
								onChange={(e) => setStudentName(e.target.value)}
								list="student-suggestions"
								containerClassName="text-left"
							/>
							<datalist id="student-suggestions">
								{studentSuggestions.map((name) => (
									<option key={name} value={name} />
								))}
							</datalist>

							<Button
								leftIcon={<Camera />}
								size="lg"
								isLoading={createSubmission.isPending}
								onClick={handleStart}
							>
								Iniciar correção
							</Button>
						</div>
					) : (
						<Button
							leftIcon={<Download />}
							size="lg"
							isLoading={exportExam.isPending}
							onClick={() => exportExam.mutate('pdf')}
						>
							Baixar PDF da prova
						</Button>
					)}
				</div>
			</div>
		)
	}

	if (step === 'capturing') {
		const pageNumber = pagePreviews.length + 1

		return (
			<div className="flex flex-1 flex-col">
				<CorrigirProvaCamera
					pageNumber={pageNumber}
					totalPages={totalPages}
					isUploading={uploadPage.isPending}
					onCapture={(blob) => {
						handleCapture(blob)
						if (pageNumber >= totalPages) setStep('review')
					}}
				/>
			</div>
		)
	}

	if (step === 'review') {
		return (
			<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
				<h1 className="text-lg font-bold text-foreground">
					Confira as fotos antes de corrigir
				</h1>

				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					{pagePreviews.map((url, index) => (
						<div
							key={url}
							className="relative aspect-3/4 overflow-hidden rounded-xl border border-border"
						>
							<img
								src={url}
								alt={`Página ${index + 1}`}
								className="h-full w-full object-cover"
							/>
							<Badge
								size="xs"
								variant="secondary"
								className="absolute left-1.5 top-1.5"
							>
								Pág. {index + 1}
							</Badge>
						</div>
					))}
				</div>

				<div className="flex flex-col gap-2 sm:flex-row">
					<Button
						variant="outline"
						leftIcon={<RotateCcw />}
						onClick={() => {
							handleRetakeLast()
							setStep('capturing')
						}}
					>
						Refazer última foto
					</Button>
					<Button
						leftIcon={<CheckCircle2 />}
						fullWidth
						isLoading={processSubmission.isPending}
						onClick={handleProcess}
					>
						Corrigir
					</Button>
				</div>
			</div>
		)
	}

	if (step === 'processing') {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
				<CorrigirProvaScanAnimation previewUrl={pagePreviews.at(-1)} />
				<div>
					<h1 className="text-base font-semibold text-foreground">
						Lendo as respostas...
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Isso leva só alguns segundos.
					</p>
				</div>
			</div>
		)
	}

	return null
}
