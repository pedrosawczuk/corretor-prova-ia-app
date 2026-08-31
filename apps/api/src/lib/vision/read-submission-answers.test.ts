import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import {
	ALIGNMENT_MARKER_SIZE_PT,
	ALIGNMENT_MARKERS,
	EXAM_TEMPLATE_PAGE_HEIGHT_PT,
	EXAM_TEMPLATE_PAGE_WIDTH_PT,
} from './exam-template-geometry'
import {
	type OmrQuestion,
	readSubmissionAnswers,
	type SubmissionPageImage,
} from './read-submission-answers'

/**
 * Constrói uma "foto" sintética de uma página em escala 1pt PDF = 1px, sem
 * distorção de perspectiva — o bastante para validar o alinhamento pelos 4
 * marcadores de canto e a leitura de preenchimento de cada alternativa, sem
 * depender de uma foto real.
 */
async function renderSyntheticPage(
	markedOptions: {
		markerX: number
		markerY: number
	}[],
): Promise<Buffer> {
	const width = Math.round(EXAM_TEMPLATE_PAGE_WIDTH_PT)
	const height = Math.round(EXAM_TEMPLATE_PAGE_HEIGHT_PT)

	const cornerRects = ALIGNMENT_MARKERS.map((marker) => {
		const x = marker.x - ALIGNMENT_MARKER_SIZE_PT / 2
		const y = height - marker.y - ALIGNMENT_MARKER_SIZE_PT / 2
		return `<rect x="${x}" y="${y}" width="${ALIGNMENT_MARKER_SIZE_PT}" height="${ALIGNMENT_MARKER_SIZE_PT}" fill="black" />`
	})

	const glyphRects = markedOptions.map(({ markerX, markerY }) => {
		const x = markerX - 1
		const y = height - markerY - 9
		return `<rect x="${x}" y="${y}" width="14" height="11" fill="black" />`
	})

	const svg = `<svg width="${width}" height="${height}">
		<rect width="100%" height="100%" fill="white" />
		${cornerRects.join('\n')}
		${glyphRects.join('\n')}
	</svg>`

	return sharp(Buffer.from(svg)).jpeg().toBuffer()
}

describe('readSubmissionAnswers', () => {
	it('identifica a alternativa pintada com confiança alta', async () => {
		const optionA = {
			id: 'opt-a',
			letter: 'A',
			markerPage: 1,
			markerX: '100.00',
			markerY: '700.00',
		}
		const optionB = {
			id: 'opt-b',
			letter: 'B',
			markerPage: 1,
			markerX: '100.00',
			markerY: '680.00',
		}

		const questions: OmrQuestion[] = [{ order: 0, options: [optionA, optionB] }]

		const pageBuffer = await renderSyntheticPage([
			{ markerX: 100, markerY: 680 },
		])
		const pages: SubmissionPageImage[] = [{ pageNumber: 1, data: pageBuffer }]

		const [result] = await readSubmissionAnswers(pages, questions)

		expect(result.detectedLetter).toBe('B')
		expect(result.confidence).toBeGreaterThan(0.5)
	})

	it('não identifica nenhuma marcação quando a alternativa está em branco', async () => {
		const optionA = {
			id: 'opt-a',
			letter: 'A',
			markerPage: 1,
			markerX: '100.00',
			markerY: '700.00',
		}
		const optionB = {
			id: 'opt-b',
			letter: 'B',
			markerPage: 1,
			markerX: '100.00',
			markerY: '680.00',
		}

		const questions: OmrQuestion[] = [{ order: 0, options: [optionA, optionB] }]

		const pageBuffer = await renderSyntheticPage([])
		const pages: SubmissionPageImage[] = [{ pageNumber: 1, data: pageBuffer }]

		const [result] = await readSubmissionAnswers(pages, questions)

		expect(result.detectedLetter).toBeNull()
	})

	it('fica sem leitura (revisão manual) quando os marcadores de canto não são encontrados na foto', async () => {
		const optionA = {
			id: 'opt-a',
			letter: 'A',
			markerPage: 1,
			markerX: '100.00',
			markerY: '700.00',
		}

		const questions: OmrQuestion[] = [{ order: 0, options: [optionA] }]

		// foto totalmente branca, sem os marcadores de canto impressos
		const blankBuffer = await sharp({
			create: {
				width: 400,
				height: 400,
				channels: 3,
				background: { r: 255, g: 255, b: 255 },
			},
		})
			.jpeg()
			.toBuffer()

		const pages: SubmissionPageImage[] = [{ pageNumber: 1, data: blankBuffer }]

		const [result] = await readSubmissionAnswers(pages, questions)

		expect(result.detectedLetter).toBeNull()
		expect(result.confidence).toBe(0)
	})

	it('ignora questões cuja página não foi fotografada', async () => {
		const optionA = {
			id: 'opt-a',
			letter: 'A',
			markerPage: 2,
			markerX: '100.00',
			markerY: '700.00',
		}

		const questions: OmrQuestion[] = [{ order: 0, options: [optionA] }]

		const result = await readSubmissionAnswers([], questions)

		expect(result[0].detectedLetter).toBeNull()
		expect(result[0].confidence).toBe(0)
	})
})
