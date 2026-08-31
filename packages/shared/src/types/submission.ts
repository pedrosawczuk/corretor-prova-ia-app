export type SubmissionStatus =
	| 'pending_processing'
	| 'processing'
	| 'needs_review'
	| 'completed'
	| 'failed'

export interface SubmissionPage {
	id: string
	submissionId: string
	pageNumber: number
	imageUrl: string
	createdAt: string
}

export interface SubmissionAnswer {
	id: string
	submissionId: string
	questionId: string
	markedOptionId: string | null
	extractedText: string | null
	aiScore: string | null
	finalScore: string | null
	aiFeedback: string | null
	confidence: string | null
	requiresReview: boolean
	reviewedBy: string | null
	createdAt: string
}

export interface Submission {
	id: string
	examId: string
	studentIdentifier: string | null
	totalScore: string | null
	status: SubmissionStatus
	correctedAt: string | null
	createdAt: string
	pages: SubmissionPage[]
	answers: SubmissionAnswer[]
}
