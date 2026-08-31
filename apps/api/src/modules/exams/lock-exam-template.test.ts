import { db } from '@app/db'
import { describe, expect, it, vi } from 'vitest'
import { uploadExamTemplate } from '@/lib/storage/storage'
import { createDbChain, createDbTransactionMock } from '@/test/create-db-chain'
import { makeExam } from '@/test/factories/make-exam'
import { makeQuestion } from '@/test/factories/make-question'
import { makeQuestionOption } from '@/test/factories/make-question-option'
import type { ExamExportData } from './exam-export-data'
import { isExamTemplateLocked, lockExamTemplate } from './lock-exam-template'

vi.mock('@/lib/storage/storage', () => ({
	uploadExamTemplate: vi.fn().mockResolvedValue('exam-templates/fake.pdf'),
}))

function buildExamWithQuestions(questionCount: number): ExamExportData {
	const exam = makeExam()

	const questions = Array.from({ length: questionCount }, (_, index) => {
		const question = makeQuestion({
			examId: exam.id,
			order: index,
			statement: `Questão número ${index} com um enunciado razoavelmente longo para ocupar espaço na página impressa.`,
		})

		const options = ['A', 'B', 'C', 'D'].map((letter) =>
			makeQuestionOption({
				questionId: question.id,
				letter,
				text: `Alternativa ${letter} da questão ${index}`,
				isCorrect: letter === 'A',
			}),
		)

		return { ...question, options }
	})

	return {
		...exam,
		questions,
		classroomName: 'Turma A',
		subjectName: 'Matemática',
		teacherName: 'Professor Teste',
	}
}

describe('lockExamTemplate', () => {
	it('extrai a coordenada de cada alternativa e trava o gabarito quando a prova cabe em 1 página', async () => {
		const exam = buildExamWithQuestions(2)

		const updateChain = createDbChain([])
		const tx = { update: vi.fn().mockReturnValue(updateChain) }
		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const result = await lockExamTemplate(exam)

		expect(result.templatePageCount).toBe(1)
		expect(uploadExamTemplate).toHaveBeenCalledWith(exam.id, expect.any(Buffer))
		// 2 questões x 4 alternativas + 1 atualização da prova
		expect(tx.update).toHaveBeenCalledTimes(9)

		const optionUpdates = updateChain.set.mock.calls
			.map(([values]) => values)
			.filter((values) => 'markerPage' in values)

		expect(optionUpdates).toHaveLength(8)
		for (const values of optionUpdates) {
			expect(values.markerPage).toBe(1)
			expect(Number(values.markerX)).toBeGreaterThan(0)
			expect(Number(values.markerY)).toBeGreaterThan(0)
		}

		const examUpdate = updateChain.set.mock.calls
			.map(([values]) => values)
			.find((values) => 'templatePageCount' in values)

		expect(examUpdate).toEqual(
			expect.objectContaining({
				templatePdfUrl: 'exam-templates/fake.pdf',
				templatePageCount: 1,
				templateLockedAt: expect.any(Date),
			}),
		)
	})

	it('identifica quando a prova ocupa mais de 1 página impressa', async () => {
		const exam = buildExamWithQuestions(20)

		const tx = { update: vi.fn() }
		tx.update.mockReturnValue(createDbChain([]))
		vi.mocked(db.transaction).mockImplementation(
			createDbTransactionMock(tx) as never,
		)

		const result = await lockExamTemplate(exam)

		expect(result.templatePageCount).toBeGreaterThan(1)
	})
})

describe('isExamTemplateLocked', () => {
	it('não está travado quando nunca foi travado', () => {
		expect(
			isExamTemplateLocked({ templateLockedAt: null, updatedAt: new Date() }),
		).toBe(false)
	})

	it('está travado quando a trava é mais recente que a última edição', () => {
		expect(
			isExamTemplateLocked({
				templateLockedAt: new Date('2026-01-02'),
				updatedAt: new Date('2026-01-01'),
			}),
		).toBe(true)
	})

	it('não está mais travado (ficou obsoleto) quando a prova foi editada depois da trava', () => {
		expect(
			isExamTemplateLocked({
				templateLockedAt: new Date('2026-01-01'),
				updatedAt: new Date('2026-01-02'),
			}),
		).toBe(false)
	})
})
