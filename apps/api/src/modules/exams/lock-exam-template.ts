import { db, eq, examsTable, questionOptionsTable } from '@app/db'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { BadRequestError } from '@/core/errors'
import { uploadExamTemplate } from '@/lib/storage/storage'
import { buildExamPdf } from './build-exam-pdf'
import type { ExamExportData } from './exam-export-data'

interface ExpectedOptionMarker {
	optionId: string
	label: string
}

interface FoundOptionMarker {
	optionId: string
	page: number
	x: number
	y: number
}

/**
 * O PDF é gerado por nós mesmos, então cada rótulo de alternativa (ex.: "A)")
 * aparece como um item de texto isolado e na mesma ordem em que foi
 * renderizado — não é OCR, é reler exatamente o que escrevemos. Isso dá a
 * coordenada exata de cada alternativa na página impressa, sem precisar
 * adivinhar nada na hora de ler a foto escaneada depois.
 */
async function extractOptionMarkers(
	pdfBuffer: Buffer,
	expectedOptions: ExpectedOptionMarker[],
) {
	const document = await getDocument({ data: new Uint8Array(pdfBuffer) })
		.promise
	const markers: FoundOptionMarker[] = []
	let cursor = 0

	for (
		let pageNumber = 1;
		pageNumber <= document.numPages && cursor < expectedOptions.length;
		pageNumber++
	) {
		const page = await document.getPage(pageNumber)
		const content = await page.getTextContent()

		for (const item of content.items) {
			if (cursor >= expectedOptions.length) break
			if (
				!('str' in item) ||
				item.str.trim() !== expectedOptions[cursor].label
			) {
				continue
			}

			markers.push({
				optionId: expectedOptions[cursor].optionId,
				page: pageNumber,
				x: item.transform[4],
				y: item.transform[5],
			})
			cursor++
		}
	}

	if (cursor !== expectedOptions.length) {
		throw new BadRequestError(
			'Não foi possível localizar todas as alternativas no PDF gerado para travar o gabarito de correção. Tente novamente.',
		)
	}

	return { markers, pageCount: document.numPages }
}

export function isExamTemplateLocked(exam: {
	templateLockedAt: Date | null
	updatedAt: Date
}) {
	return (
		exam.templateLockedAt !== null && exam.templateLockedAt >= exam.updatedAt
	)
}

export async function lockExamTemplate(exam: ExamExportData) {
	const pdfBuffer = await buildExamPdf(exam)

	const expectedOptions: ExpectedOptionMarker[] = [...exam.questions]
		.sort((a, b) => a.order - b.order)
		.flatMap((question) =>
			question.options.map((option) => ({
				optionId: option.id,
				label: `${option.letter})`,
			})),
		)

	const { markers, pageCount } = await extractOptionMarkers(
		pdfBuffer,
		expectedOptions,
	)

	const templatePdfUrl = await uploadExamTemplate(exam.id, pdfBuffer)

	await db.transaction(async (tx) => {
		for (const marker of markers) {
			await tx
				.update(questionOptionsTable)
				.set({
					markerPage: marker.page,
					markerX: marker.x.toFixed(2),
					markerY: marker.y.toFixed(2),
				})
				.where(eq(questionOptionsTable.id, marker.optionId))
		}

		await tx
			.update(examsTable)
			.set({
				templatePdfUrl,
				templatePageCount: pageCount,
				templateLockedAt: new Date(),
			})
			.where(eq(examsTable.id, exam.id))
	})

	return { pdfBuffer, templatePageCount: pageCount }
}
