'use client'

import type { Exam, Question } from '@app/shared'
import { Card, CardContent, CardHeader, CardTitle } from '@app/ui'
import { CheckCircle2 } from 'lucide-react'
import { useUpdateCorrectOption } from '@/hooks/use-exams'
import { toastApiError } from '@/lib/api-error-handler'

interface ProvaResultadoProps {
	exam: Exam
	onQuestionUpdated: (question: Question) => void
}

export function ProvaResultado({ exam, onQuestionUpdated }: ProvaResultadoProps) {
	const questions = [...exam.questions].sort((a, b) => a.order - b.order)

	return (
		<div className="flex flex-col gap-4">
			{questions.map((question) => (
				<QuestionCard
					key={question.id}
					examId={exam.id}
					question={question}
					onQuestionUpdated={onQuestionUpdated}
				/>
			))}
		</div>
	)
}

interface QuestionCardProps {
	examId: string
	question: Question
	onQuestionUpdated: (question: Question) => void
}

function QuestionCard({ examId, question, onQuestionUpdated }: QuestionCardProps) {
	const updateCorrectOption = useUpdateCorrectOption(examId, question.id)

	function handleSelect(optionId: string) {
		if (updateCorrectOption.isPending) {
			return
		}

		updateCorrectOption.mutate(optionId, {
			onSuccess: (updatedQuestion) => {
				onQuestionUpdated(updatedQuestion)
			},
			onError: (error) => {
				toastApiError(
					error,
					'Não foi possível marcar essa alternativa como correta. Tente novamente.',
				)
			},
		})
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					{String(question.order + 1).padStart(2, '0')}. {question.statement}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
					{question.options.map((option) => (
						<button
							key={option.id}
							type="button"
							onClick={() => handleSelect(option.id)}
							disabled={updateCorrectOption.isPending}
							className={`flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
								option.isCorrect
									? 'border-success bg-success/5 text-foreground cursor-default'
									: 'border-border bg-card text-foreground hover:border-primary/40 hover:bg-muted/30 cursor-pointer'
							}`}
						>
							{option.isCorrect ? (
								<CheckCircle2 className="size-4 shrink-0 text-success" />
							) : (
								<span className="size-4 shrink-0" />
							)}
							<span>
								{option.letter}) {option.text}
							</span>
						</button>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
