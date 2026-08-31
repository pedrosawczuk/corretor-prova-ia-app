/**
 * Geometria compartilhada entre a impressão da prova (build-exam-pdf.tsx) e a
 * leitura por visão computacional da folha escaneada. Os 4 marcadores de
 * canto servem só para realinhar a foto (perspectiva/rotação) — nenhum deles
 * fica em cima do conteúdo da prova. Todas as coordenadas estão em pontos
 * PDF, origem no canto inferior-esquerdo (mesmo sistema que o pdfjs-dist
 * retorna ao extrair a posição de cada alternativa).
 */

export const EXAM_TEMPLATE_PAGE_WIDTH_PT = 595.28
export const EXAM_TEMPLATE_PAGE_HEIGHT_PT = 841.89

export const ALIGNMENT_MARKER_SIZE_PT = 10
const ALIGNMENT_MARKER_MARGIN_PT = 14

export interface AlignmentMarkerPosition {
	id: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
	/** Centro do marcador. */
	x: number
	y: number
}

const left = ALIGNMENT_MARKER_MARGIN_PT + ALIGNMENT_MARKER_SIZE_PT / 2
const right =
	EXAM_TEMPLATE_PAGE_WIDTH_PT -
	ALIGNMENT_MARKER_MARGIN_PT -
	ALIGNMENT_MARKER_SIZE_PT / 2
const bottom = ALIGNMENT_MARKER_MARGIN_PT + ALIGNMENT_MARKER_SIZE_PT / 2
const top =
	EXAM_TEMPLATE_PAGE_HEIGHT_PT -
	ALIGNMENT_MARKER_MARGIN_PT -
	ALIGNMENT_MARKER_SIZE_PT / 2

export const ALIGNMENT_MARKERS: AlignmentMarkerPosition[] = [
	{ id: 'top-left', x: left, y: top },
	{ id: 'top-right', x: right, y: top },
	{ id: 'bottom-left', x: left, y: bottom },
	{ id: 'bottom-right', x: right, y: bottom },
]
