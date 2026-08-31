import sharp from 'sharp'
import {
	ALIGNMENT_MARKERS,
	type AlignmentMarkerPosition,
} from './exam-template-geometry'
import { getOpenCv } from './opencv-loader'

export interface OmrOption {
	id: string
	letter: string
	markerPage: number | null
	markerX: string | null
	markerY: string | null
}

export interface OmrQuestion {
	order: number
	options: OmrOption[]
}

export interface SubmissionPageImage {
	pageNumber: number
	data: Buffer
}

export interface ExtractedAnswer {
	order: number
	detectedLetter: string | null
	confidence: number | null
}

/**
 * Abaixo desse percentual de pixels escuros na área da alternativa, tratamos
 * como "sem marcação" — evita que uma sombra leve ou o próprio traço da
 * impressão vire um falso positivo.
 */
const MIN_FILL_RATIO = 0.12

/** Quão perto (fração da largura/altura da foto) um marcador de canto precisa
 * estar do canto esperado para ser considerado candidato. Generoso o
 * suficiente pra tolerar a folha não estar perfeitamente centralizada. */
const CORNER_SEARCH_MARGIN = 0.32

/**
 * Área do glifo "A)" em relação à origem do marcador extraído do PDF (que é
 * a base-esquerda do texto, na convenção do pdfjs-dist), em pontos PDF.
 */
const GLYPH_BOX = { left: -1, right: 13, belowBaseline: -2, aboveBaseline: 9 }

interface PixelPoint {
	x: number
	y: number
}

interface PixelRect {
	x: number
	y: number
	width: number
	height: number
}

async function decodeToMat(
	cv: Awaited<ReturnType<typeof getOpenCv>>,
	buffer: Buffer,
) {
	const { data, info } = await sharp(buffer)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true })

	const imageData = {
		data: new Uint8ClampedArray(data),
		width: info.width,
		height: info.height,
	}

	return {
		mat: cv.matFromImageData(imageData),
		width: info.width,
		height: info.height,
	}
}

function findCornerCandidate(
	cv: Awaited<ReturnType<typeof getOpenCv>>,
	contours: InstanceType<typeof cv.MatVector>,
	width: number,
	height: number,
	marker: AlignmentMarkerPosition,
): PixelPoint | null {
	const isLeft = marker.id.includes('left')
	const isTop = marker.id.includes('top')

	const minX = isLeft ? 0 : width * (1 - CORNER_SEARCH_MARGIN)
	const maxX = isLeft ? width * CORNER_SEARCH_MARGIN : width
	const minY = isTop ? 0 : height * (1 - CORNER_SEARCH_MARGIN)
	const maxY = isTop ? height * CORNER_SEARCH_MARGIN : height

	let best: (PixelPoint & { squareness: number }) | null = null

	for (let i = 0; i < contours.size(); i++) {
		const rect = cv.boundingRect(contours.get(i))
		const cx = rect.x + rect.width / 2
		const cy = rect.y + rect.height / 2

		if (cx < minX || cx > maxX || cy < minY || cy > maxY) continue
		if (rect.width < 4 || rect.height < 4) continue

		const aspect = rect.width / rect.height
		if (aspect < 0.5 || aspect > 2) continue

		const squareness = Math.abs(aspect - 1)
		if (!best || squareness < best.squareness) {
			best = { x: cx, y: cy, squareness }
		}
	}

	return best
}

/**
 * Localiza os 4 marcadores de canto impressos na página (build-exam-pdf.tsx)
 * na foto — retorna null se algum não for encontrado (foto cortada, mal
 * enquadrada, iluminação ruim etc.), sinalizando que essa página não pode
 * ser lida com segurança.
 */
function locateAlignmentMarkers(
	cv: Awaited<ReturnType<typeof getOpenCv>>,
	binary: InstanceType<typeof cv.Mat>,
	width: number,
	height: number,
): Record<string, PixelPoint> | null {
	const contours = new cv.MatVector()
	const hierarchy = new cv.Mat()

	try {
		cv.findContours(
			binary,
			contours,
			hierarchy,
			cv.RETR_LIST,
			cv.CHAIN_APPROX_SIMPLE,
		)

		const found: Record<string, PixelPoint> = {}
		for (const marker of ALIGNMENT_MARKERS) {
			const candidate = findCornerCandidate(cv, contours, width, height, marker)
			if (!candidate) return null
			found[marker.id] = candidate
		}

		return found
	} finally {
		contours.delete()
		hierarchy.delete()
	}
}

function buildTransform(
	cv: Awaited<ReturnType<typeof getOpenCv>>,
	found: Record<string, PixelPoint>,
) {
	const pdfPoints: number[] = []
	const photoPoints: number[] = []

	for (const marker of ALIGNMENT_MARKERS) {
		pdfPoints.push(marker.x, marker.y)
		photoPoints.push(found[marker.id].x, found[marker.id].y)
	}

	const src = cv.matFromArray(4, 1, cv.CV_32FC2, pdfPoints)
	const dst = cv.matFromArray(4, 1, cv.CV_32FC2, photoPoints)

	try {
		return cv.getPerspectiveTransform(src, dst)
	} finally {
		src.delete()
		dst.delete()
	}
}

function mapGlyphBoxToPixelRect(
	cv: Awaited<ReturnType<typeof getOpenCv>>,
	transform: InstanceType<typeof cv.Mat>,
	markerX: number,
	markerY: number,
	width: number,
	height: number,
): PixelRect {
	const corners = [
		markerX + GLYPH_BOX.left,
		markerY + GLYPH_BOX.belowBaseline,
		markerX + GLYPH_BOX.right,
		markerY + GLYPH_BOX.belowBaseline,
		markerX + GLYPH_BOX.right,
		markerY + GLYPH_BOX.aboveBaseline,
		markerX + GLYPH_BOX.left,
		markerY + GLYPH_BOX.aboveBaseline,
	]

	const points = cv.matFromArray(4, 1, cv.CV_32FC2, corners)
	const mapped = new cv.Mat()

	try {
		cv.perspectiveTransform(points, mapped, transform)

		let minX = Number.POSITIVE_INFINITY
		let minY = Number.POSITIVE_INFINITY
		let maxX = Number.NEGATIVE_INFINITY
		let maxY = Number.NEGATIVE_INFINITY

		for (let i = 0; i < 4; i++) {
			const x = mapped.data32F[i * 2]
			const y = mapped.data32F[i * 2 + 1]
			minX = Math.min(minX, x)
			maxX = Math.max(maxX, x)
			minY = Math.min(minY, y)
			maxY = Math.max(maxY, y)
		}

		const x = Math.max(0, Math.min(Math.round(minX), width - 1))
		const y = Math.max(0, Math.min(Math.round(minY), height - 1))

		return {
			x,
			y,
			width: Math.max(1, Math.min(Math.round(maxX - minX), width - x)),
			height: Math.max(1, Math.min(Math.round(maxY - minY), height - y)),
		}
	} finally {
		points.delete()
		mapped.delete()
	}
}

function computeFillRatio(
	cv: Awaited<ReturnType<typeof getOpenCv>>,
	binary: InstanceType<typeof cv.Mat>,
	rect: PixelRect,
): number {
	const roi = binary.roi(new cv.Rect(rect.x, rect.y, rect.width, rect.height))

	try {
		return cv.countNonZero(roi) / (rect.width * rect.height)
	} finally {
		roi.delete()
	}
}

async function readPage(
	cv: Awaited<ReturnType<typeof getOpenCv>>,
	page: SubmissionPageImage,
	options: { id: string; markerX: number; markerY: number }[],
	fillRatioByOptionId: Map<string, number>,
) {
	const { mat, width, height } = await decodeToMat(cv, page.data)
	const gray = new cv.Mat()
	const binary = new cv.Mat()

	try {
		cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY)
		cv.threshold(gray, binary, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)

		const found = locateAlignmentMarkers(cv, binary, width, height)
		if (!found) return

		const transform = buildTransform(cv, found)

		try {
			for (const option of options) {
				const rect = mapGlyphBoxToPixelRect(
					cv,
					transform,
					option.markerX,
					option.markerY,
					width,
					height,
				)
				fillRatioByOptionId.set(option.id, computeFillRatio(cv, binary, rect))
			}
		} finally {
			transform.delete()
		}
	} finally {
		mat.delete()
		gray.delete()
		binary.delete()
	}
}

function decideQuestionAnswer(
	question: OmrQuestion,
	fillRatioByOptionId: Map<string, number>,
): ExtractedAnswer {
	const ranked = question.options
		.map((option) => ({
			letter: option.letter,
			ratio: fillRatioByOptionId.get(option.id) ?? 0,
		}))
		.sort((a, b) => b.ratio - a.ratio)

	const [top, second] = ranked

	if (!top || top.ratio < MIN_FILL_RATIO) {
		return { order: question.order, detectedLetter: null, confidence: 0 }
	}

	const confidence = second
		? Math.max(0, Math.min(1, (top.ratio - second.ratio) / top.ratio))
		: 1

	return { order: question.order, detectedLetter: top.letter, confidence }
}

/**
 * Lê, por visão computacional pura (sem IA), qual alternativa cada questão
 * teve marcada nas fotos da folha de respostas. Alinha cada foto pelos 4
 * marcadores de canto impressos e mede o quanto cada "(A)(B)(C)(D)" foi
 * pintado/riscado — a mesma lógica de corte de confiança usada com a IA
 * (grade-submission-answers.ts) continua decidindo o que vai para revisão
 * manual do professor.
 */
export async function readSubmissionAnswers(
	pages: SubmissionPageImage[],
	questions: OmrQuestion[],
): Promise<ExtractedAnswer[]> {
	const cv = await getOpenCv()

	const optionsByPage = new Map<
		number,
		{ id: string; markerX: number; markerY: number }[]
	>()

	for (const question of questions) {
		for (const option of question.options) {
			if (
				option.markerPage === null ||
				option.markerX === null ||
				option.markerY === null
			) {
				continue
			}

			const list = optionsByPage.get(option.markerPage) ?? []
			list.push({
				id: option.id,
				markerX: Number(option.markerX),
				markerY: Number(option.markerY),
			})
			optionsByPage.set(option.markerPage, list)
		}
	}

	const fillRatioByOptionId = new Map<string, number>()

	for (const page of pages) {
		const pageOptions = optionsByPage.get(page.pageNumber)
		if (!pageOptions?.length) continue

		await readPage(cv, page, pageOptions, fillRatioByOptionId)
	}

	return questions.map((question) =>
		decideQuestionAnswer(question, fillRatioByOptionId),
	)
}
