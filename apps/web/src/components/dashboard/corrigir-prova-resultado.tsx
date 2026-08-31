'use client'

import type { Exam, Submission } from '@app/shared'
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from '@app/ui'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { useReviewSubmissionAnswer } from '@/hooks/use-submissions'
import { toastApiError } from '@/lib/api-error-handler'
import { pairQuestionsWithAnswers } from './corrigir-prova.utils'

interface CorrigirProvaResultadoProps {
	exam: Exam
	submission: Submission
}

export function CorrigirProvaResultado({
	exam,
	submission,
}: CorrigirProvaResultadoProps) {
	const reviewAnswer = useReviewSubmissionAnswer(submission.id)
	const pairs = pairQuestionsWithAnswers(exam, submission)

	return (
		<div className="flex flex-col gap-4">
			{pairs.map(({ question, answer }) => {
				const correctOption = question.options.find((o) => o.isCorrect)
				const needsReview = !answer || answer.requiresReview
				const isCorrect =
					!needsReview && answer?.markedOptionId === correctOption?.id

				function handleSelect(optionId: string | null) {
					if (!answer) return
					reviewAnswer.mutate(
						{ answerId: answer.id, optionId },
						{
							onError: (err) => {
								toastApiError(err, 'Não foi possível salvar a correção.')
							},
						},
					)
				}

				return (
					<Card key={question.id}>
						<CardHeader className="pb-3">
							<CardTitle className="flex items-start gap-2 text-sm">
								<span className="font-semibold text-muted-foreground">
									{String(question.order + 1).padStart(2, '0')}.
								</span>
								<span className="flex-1 leading-relaxed">
									{question.statement}
								</span>
								{needsReview ? (
									<Badge variant="warning-outline" size="sm">
										<AlertTriangle className="size-3.5" />
										Revisar
									</Badge>
								) : isCorrect ? (
									<Badge variant="success-outline" size="sm">
										<CheckCircle2 className="size-3.5" />
										Correta
									</Badge>
								) : (
									<Badge variant="destructive-outline" size="sm">
										<XCircle className="size-3.5" />
										Incorreta
									</Badge>
								)}
							</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							<ul className="grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
								{question.options.map((option) => {
									const isMarked = answer?.markedOptionId === option.id
									const isAiHint =
										needsReview &&
										!isMarked &&
										answer?.extractedText?.toUpperCase() ===
											option.letter.toUpperCase()

									return (
										<li key={option.id}>
											<button
												type="button"
												disabled={!needsReview || reviewAnswer.isPending}
												onClick={() => handleSelect(option.id)}
												className={`flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm transition-colors ${
													isMarked
														? 'border-primary bg-primary/5 ring-1 ring-primary/20'
														: isAiHint
															? 'border-dashed border-warning bg-warning/5'
															: 'border-border bg-card'
												} ${needsReview ? 'cursor-pointer hover:border-primary/40' : 'cursor-default'}`}
											>
												<span className="mr-1 font-semibold">
													{option.letter})
												</span>
												<span className="leading-snug">{option.text}</span>
											</button>
										</li>
									)
								})}
							</ul>

							{needsReview && answer && (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="self-start text-muted-foreground"
									disabled={reviewAnswer.isPending}
									onClick={() => handleSelect(null)}
								>
									Nenhuma alternativa marcada
								</Button>
							)}
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}
