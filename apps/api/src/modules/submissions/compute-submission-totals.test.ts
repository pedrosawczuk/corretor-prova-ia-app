import { describe, expect, it } from 'vitest'
import { computeSubmissionTotals } from './compute-submission-totals'

describe('computeSubmissionTotals', () => {
	it('soma as notas finais e conclui a submissão quando nenhuma resposta precisa de revisão', () => {
		const result = computeSubmissionTotals([
			{ finalScore: '2.00', requiresReview: false },
			{ finalScore: '0.00', requiresReview: false },
		])

		expect(result.status).toBe('completed')
		expect(result.totalScore).toBe('2.00')
		expect(result.correctedAt).toBeInstanceOf(Date)
	})

	it('mantém a submissão pendente de revisão quando alguma resposta ainda precisa de revisão', () => {
		const result = computeSubmissionTotals([
			{ finalScore: '2.00', requiresReview: false },
			{ finalScore: null, requiresReview: true },
		])

		expect(result.status).toBe('needs_review')
		expect(result.totalScore).toBe('2.00')
		expect(result.correctedAt).toBeNull()
	})

	it('ignora respostas sem nota final na soma', () => {
		const result = computeSubmissionTotals([
			{ finalScore: null, requiresReview: true },
			{ finalScore: null, requiresReview: true },
		])

		expect(result.totalScore).toBe('0.00')
	})
})
