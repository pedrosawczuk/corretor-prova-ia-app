import type { SubmissionAnswer } from '@app/shared'
import { parseMarkedLetters } from './corrigir-prova.utils'

interface AnswerReadingNoteProps {
	answer: SubmissionAnswer
}

export function AnswerReadingNote({ answer }: AnswerReadingNoteProps) {
	const markedLetters = parseMarkedLetters(answer.extractedText)

	if (answer.requiresReview || markedLetters.length < 2) return null

	return (
		<p className="text-muted-foreground text-xs">
			Mais de uma alternativa marcada ({markedLetters.join(', ')}) — questão
			anulada.
		</p>
	)
}
