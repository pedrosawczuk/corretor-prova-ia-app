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
	useDeleteSubmissionPage,
	useProcessSubmission,
	useReorderSubmissionPages,
	useSubmission,
	useUploadSubmissionPage,
} from '@/hooks/use-submissions'
import { ApiError } from '@/lib/api-client'
import { toastApiError } from '@/lib/api-error-handler'
import {
	buildMisalignedPagesWarning,
	countPendingReview,
	getMisalignedPageNumbers,
	movePageInOrder,
} from './corrigir-prova.utils'
import { CorrigirProvaCamera } from './corrigir-prova-camera'
import { CorrigirProvaResultado } from './corrigir-prova-resultado'
import type { CorrigirProvaReviewPage } from './corrigir-prova-review'
import { CorrigirProvaReview } from './corrigir-prova-review'
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
	const [pages, setPages] = React.useState<CorrigirProvaReviewPage[]>([])

	const { data: studentSuggestions = [] } =
		useClassroomStudentSuggestions(turmaId)

	const createSubmission = useCreateSubmission(examId)
	const uploadPage = useUploadSubmissionPage(submissionId ?? '')
	const deletePage = useDeleteSubmissionPage(submissionId ?? '')
	const reorderPages = useReorderSubmissionPages(submissionId ?? '')
	const processSubmission = useProcessSubmission(submissionId ?? '')
	const { data: submission } = useSubmission(submissionId)

	const pagesRef = React.useRef(pages)
	pagesRef.current = pages

	React.useEffect(() => {
		if (querySubmissionId) {
			setSubmissionId(querySubmissionId)
			setStep('result')
		}
	}, [querySubmissionId])

	React.useEffect(() => {
		return () => {
			for (const page of pagesRef.current) URL.revokeObjectURL(page.previewUrl)
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

	async function handleCapture(files: Blob[]) {
		if (!totalPages) return

		const remainingSlots = Math.max(0, totalPages - pages.length)
		const filesToUpload = files.slice(0, remainingSlots)
		const skippedCount = files.length - filesToUpload.length

		for (const file of filesToUpload) {
			try {
				const page = await uploadPage.mutateAsync(file)
				const previewUrl = URL.createObjectURL(file)
				setPages((prev) => [...prev, { id: page.id, previewUrl }])
			} catch (err) {
				toastApiError(err, 'Não foi possível enviar a foto. Tente novamente.')
				return
			}
		}

		if (skippedCount > 0) {
			toast.info(
				`Apenas ${filesToUpload.length} foto(s) foram usadas — a prova tem ${totalPages} página(s).`,
			)
		}

		if (pages.length + filesToUpload.length >= totalPages) {
			setStep('review')
		}
	}

	function handleMovePage(index: number, direction: -1 | 1) {
		setPages((prev) => movePageInOrder(prev, index, direction))
	}

	function handleRetakeLast() {
		const last = pages.at(-1)
		if (!last) return

		deletePage.mutate(last.id, {
			onSuccess: () => {
				URL.revokeObjectURL(last.previewUrl)
				setPages((prev) => prev.slice(0, -1))
				setStep('capturing')
			},
			onError: (err) => {
				toastApiError(err, 'Não foi possível remover a foto. Tente novamente.')
			},
		})
	}

	function handleProcess() {
		setStep('processing')
		reorderPages.mutate(
			pages.map((page) => page.id),
			{
				onSuccess: () => {
					processSubmission.mutate(undefined, {
						onSuccess: (result) => {
							setStep('result')
							const pending = countPendingReview(result)
							if (pending > 0) {
								toast.info(
									`${pending} questão(ões) precisam da sua revisão manual.`,
								)
							} else {
								toast.success('Prova corrigida automaticamente com sucesso!')
							}
						},
						onError: (err) => {
							setStep('review')
							toastApiError(err, 'Não foi possível processar a correção.')
						},
					})
				},
				onError: (err) => {
					setStep('review')
					toastApiError(err, 'Não foi possível salvar a ordem das páginas.')
				},
			},
		)
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
		const pageNumber = pages.length + 1

		return (
			<div className="flex flex-1 flex-col">
				<CorrigirProvaCamera
					pageNumber={pageNumber}
					totalPages={totalPages}
					isUploading={uploadPage.isPending}
					onCapture={handleCapture}
				/>
			</div>
		)
	}

	if (step === 'review') {
		return (
			<CorrigirProvaReview
				pages={pages}
				isProcessing={reorderPages.isPending || processSubmission.isPending}
				isRetaking={deletePage.isPending}
				onMovePage={handleMovePage}
				onRetakeLast={handleRetakeLast}
				onProcess={handleProcess}
			/>
		)
	}

	if (step === 'processing') {
		return (
			<div className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">
				<CorrigirProvaScanAnimation previewUrl={pages.at(-1)?.previewUrl} />
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
