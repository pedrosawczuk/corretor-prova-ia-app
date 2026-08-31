export interface QuestionOption {
	id: string
	letter: string
	text: string
	isCorrect: boolean
}

export interface Question {
	id: string
	order: number
	statement: string
	type: 'multiple_choice' | 'true_false'
	maxPoints: string
	options: QuestionOption[]
}

export interface Exam {
	id: string
	title: string
	description: string | null
	totalPoints: string
	status: 'draft' | 'finalized'
	classroomId: string
	creatorId: string
	/** Número de páginas da versão impressa travada — null se a prova nunca foi exportada. */
	templatePageCount: number | null
	createdAt: string
	updatedAt: string
	questions: Question[]
}
