import { MAX_SUBMISSION_PAGE_SIZE_BYTES } from '@app/shared'

const HEIC_FILE_EXTENSION = /\.(heic|heif)$/i
const GENERIC_FILE_TYPES = new Set(['', 'application/octet-stream'])

export function validateGalleryFile(file: File): string | null {
	// Muitos navegadores/SOs (Chrome no Windows, por exemplo) não têm o tipo
	// MIME de HEIC/HEIF registrado e entregam `file.type` vazio ou genérico
	// (`application/octet-stream`) para fotos de iPhone reais — só bloqueamos
	// aqui quando o navegador afirma um tipo concreto que não é imagem; a
	// validação final por magic bytes é feita no backend.
	const isImageType = file.type.startsWith('image/')
	const isGenericType = GENERIC_FILE_TYPES.has(file.type)
	const looksLikeHeic = HEIC_FILE_EXTENSION.test(file.name)

	if (!isImageType && !(isGenericType && looksLikeHeic)) {
		return 'O arquivo enviado precisa ser uma imagem.'
	}

	if (file.size > MAX_SUBMISSION_PAGE_SIZE_BYTES) {
		return 'A imagem deve ter no máximo 10MB.'
	}

	return null
}
