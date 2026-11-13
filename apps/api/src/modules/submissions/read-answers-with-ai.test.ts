import { describe, expect, it, vi } from 'vitest'
import { readPageMarkedAnswers } from '@/lib/ai/read-page-marked-answers'
import { readAnswersWithAi } from './read-answers-with-ai'

vi.mock('@/lib/ai/read-page-marked-answers', () => ({
	readPageMarkedAnswers: vi.fn(),
}))

describe('readAnswersWithAi', () => {
	it('limita a concorrência de chamadas a readPageMarkedAnswers', async () => {
		let inFlight = 0
		let maxInFlight = 0

		vi.mocked(readPageMarkedAnswers).mockImplementation(async () => {
			inFlight += 1
			maxInFlight = Math.max(maxInFlight, inFlight)
			await new Promise((resolve) => setTimeout(resolve, 15))
			inFlight -= 1
			return [{ number: 1, legible: true, markedLetters: ['A'] }]
		})

		const pages = Array.from({ length: 6 }, (_, i) => ({
			pageNumber: i + 1,
			data: Buffer.from(`page-${i + 1}`),
		}))
		const questions = [
			{
				id: 'q1',
				order: 0,
				statement: 'Pergunta 1',
				options: [
					{
						id: 'opt-a',
						letter: 'A',
						text: 'Opt A',
						isCorrect: true,
						markerPage: 1,
						markerX: '10',
						markerY: '10',
					},
					{
						id: 'opt-b',
						letter: 'B',
						text: 'Opt B',
						isCorrect: false,
						markerPage: 1,
						markerX: '20',
						markerY: '10',
					},
				],
			},
		]

		const result = await readAnswersWithAi(pages, questions)

		expect(readPageMarkedAnswers).toHaveBeenCalledTimes(12)
		expect(maxInFlight).toBeLessThanOrEqual(4)
		expect(result).toHaveLength(1)
	})
})
