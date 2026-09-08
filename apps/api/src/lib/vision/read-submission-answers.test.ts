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

interface DegradationOptions {
	/** Simula iluminação desigual: gradiente de branco a cinza claro no fundo. */
	unevenLighting?: boolean
	/** Desfoque gaussiano moderado, como uma foto levemente fora de foco. */
	blurSigma?: number
	/** Rotação leve da foto inteira, como uma folha fotografada torta. */
	rotateDegrees?: number
}

/**
 * Constrói uma "foto" sintética de uma página em escala 1pt PDF = 1px, sem
 * distorção de perspectiva — o bastante para validar o alinhamento pelos 4
 * marcadores de canto e a leitura de preenchimento de cada alternativa, sem
 * depender de uma foto real. Aceita degradações opcionais (blur, rotação,
 * iluminação desigual) para simular fotos reais imperfeitas.
 */
async function renderSyntheticPage(
	markedOptions: {
		markerX: number
		markerY: number
	}[],
	degradation: DegradationOptions = {},
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

	const background = degradation.unevenLighting
		? `<defs>
				<linearGradient id="lighting" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stop-color="#ffffff" />
					<stop offset="100%" stop-color="#e0e0e0" />
				</linearGradient>
			</defs>
			<rect width="100%" height="100%" fill="url(#lighting)" />`
		: `<rect width="100%" height="100%" fill="white" />`

	const svg = `<svg width="${width}" height="${height}">
		${background}
		${cornerRects.join('\n')}
		${glyphRects.join('\n')}
	</svg>`

	let pipeline = sharp(Buffer.from(svg))

	if (degradation.blurSigma) {
		pipeline = pipeline.blur(degradation.blurSigma)
	}

	if (degradation.rotateDegrees) {
		pipeline = pipeline.rotate(degradation.rotateDegrees, {
			background: '#ffffff',
		})
	}

	return pipeline.jpeg().toBuffer()
}

/**
 * Mesmo gerador de `renderSyntheticPage`, mas desloca só o marcador de canto
 * superior-esquerdo para uma fração customizada da largura da foto — simula
 * uma folha fotografada descentralizada, fora da margem de busca padrão.
 */
async function renderPageWithShiftedTopLeftMarker(
	topLeftXFraction: number,
): Promise<Buffer> {
	const width = Math.round(EXAM_TEMPLATE_PAGE_WIDTH_PT)
	const height = Math.round(EXAM_TEMPLATE_PAGE_HEIGHT_PT)

	const cornerRects = ALIGNMENT_MARKERS.map((marker) => {
		const isTopLeft = marker.id === 'top-left'
		const x = isTopLeft
			? width * topLeftXFraction - ALIGNMENT_MARKER_SIZE_PT / 2
			: marker.x - ALIGNMENT_MARKER_SIZE_PT / 2
		const y = height - marker.y - ALIGNMENT_MARKER_SIZE_PT / 2
		return `<rect x="${x}" y="${y}" width="${ALIGNMENT_MARKER_SIZE_PT}" height="${ALIGNMENT_MARKER_SIZE_PT}" fill="black" />`
	})

	const svg = `<svg width="${width}" height="${height}">
		<rect width="100%" height="100%" fill="white" />
		${cornerRects.join('\n')}
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

		const { answers } = await readSubmissionAnswers(pages, questions)
		const [result] = answers

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

		const { answers } = await readSubmissionAnswers(pages, questions)
		const [result] = answers

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

		const { answers, pageDiagnostics } = await readSubmissionAnswers(
			pages,
			questions,
		)
		const [result] = answers

		expect(result.detectedLetter).toBeNull()
		expect(result.confidence).toBe(0)
		expect(pageDiagnostics.get(1)).toEqual({ markersFound: false })
	})

	it('sinaliza markersFound como true quando os marcadores de canto são encontrados', async () => {
		const optionA = {
			id: 'opt-a',
			letter: 'A',
			markerPage: 1,
			markerX: '100.00',
			markerY: '700.00',
		}

		const questions: OmrQuestion[] = [{ order: 0, options: [optionA] }]

		const pageBuffer = await renderSyntheticPage([])
		const pages: SubmissionPageImage[] = [{ pageNumber: 1, data: pageBuffer }]

		const { pageDiagnostics } = await readSubmissionAnswers(pages, questions)

		expect(pageDiagnostics.get(1)).toEqual({ markersFound: true })
	})

	it('ainda lê corretamente sob desfoque gaussiano moderado', async () => {
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

		const pageBuffer = await renderSyntheticPage(
			[{ markerX: 100, markerY: 680 }],
			{ blurSigma: 1.2 },
		)
		const pages: SubmissionPageImage[] = [{ pageNumber: 1, data: pageBuffer }]

		const { answers, pageDiagnostics } = await readSubmissionAnswers(
			pages,
			questions,
		)

		expect(pageDiagnostics.get(1)).toEqual({ markersFound: true })
		expect(answers[0].detectedLetter).toBe('B')
	})

	it('ainda lê corretamente sob rotação leve da foto', async () => {
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

		const pageBuffer = await renderSyntheticPage(
			[{ markerX: 100, markerY: 680 }],
			{ rotateDegrees: 5 },
		)
		const pages: SubmissionPageImage[] = [{ pageNumber: 1, data: pageBuffer }]

		const { answers, pageDiagnostics } = await readSubmissionAnswers(
			pages,
			questions,
		)

		expect(pageDiagnostics.get(1)).toEqual({ markersFound: true })
		expect(answers[0].detectedLetter).toBe('B')
	})

	it('ainda lê corretamente sob iluminação desigual (gradiente de brilho)', async () => {
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

		const pageBuffer = await renderSyntheticPage(
			[{ markerX: 100, markerY: 680 }],
			{ unevenLighting: true },
		)
		const pages: SubmissionPageImage[] = [{ pageNumber: 1, data: pageBuffer }]

		const { answers, pageDiagnostics } = await readSubmissionAnswers(
			pages,
			questions,
		)

		expect(pageDiagnostics.get(1)).toEqual({ markersFound: true })
		expect(answers[0].detectedLetter).toBe('B')
	})

	it('fica sem leitura e sem lançar exceção quando um marcador de canto foi cortado da foto', async () => {
		const optionA = {
			id: 'opt-a',
			letter: 'A',
			markerPage: 1,
			markerX: '100.00',
			markerY: '700.00',
		}

		const questions: OmrQuestion[] = [{ order: 0, options: [optionA] }]

		const fullPage = await renderSyntheticPage([])
		const fullMeta = await sharp(fullPage).metadata()
		const width = fullMeta.width ?? Math.round(EXAM_TEMPLATE_PAGE_WIDTH_PT)
		const height = fullMeta.height ?? Math.round(EXAM_TEMPLATE_PAGE_HEIGHT_PT)

		// corta uma fatia da borda superior-esquerda, removendo esse marcador
		const croppedPage = await sharp(fullPage)
			.extract({
				left: 30,
				top: 30,
				width: width - 30,
				height: height - 30,
			})
			.jpeg()
			.toBuffer()

		const pages: SubmissionPageImage[] = [{ pageNumber: 1, data: croppedPage }]

		const { answers, pageDiagnostics } = await readSubmissionAnswers(
			pages,
			questions,
		)

		expect(pageDiagnostics.get(1)).toEqual({ markersFound: false })
		expect(answers[0].detectedLetter).toBeNull()
		expect(answers[0].confidence).toBe(0)
	})

	it('encontra os marcadores numa segunda tentativa com margem de busca mais ampla quando a foto está descentralizada', async () => {
		const optionA = {
			id: 'opt-a',
			letter: 'A',
			markerPage: 1,
			markerX: '100.00',
			markerY: '700.00',
		}

		const questions: OmrQuestion[] = [{ order: 0, options: [optionA] }]

		// fora dos 0.32 padrão, mas dentro do fallback de 0.45
		const pageBuffer = await renderPageWithShiftedTopLeftMarker(0.38)
		const pages: SubmissionPageImage[] = [{ pageNumber: 1, data: pageBuffer }]

		const { pageDiagnostics } = await readSubmissionAnswers(pages, questions)

		expect(pageDiagnostics.get(1)).toEqual({ markersFound: true })
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

		const { answers, pageDiagnostics } = await readSubmissionAnswers(
			[],
			questions,
		)

		expect(answers[0].detectedLetter).toBeNull()
		expect(answers[0].confidence).toBe(0)
		expect(pageDiagnostics.size).toBe(0)
	})
})
