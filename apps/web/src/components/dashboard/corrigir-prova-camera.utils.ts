import { MAX_SUBMISSION_PAGE_SIZE_BYTES } from '@app/shared'

export function validateGalleryFile(file: File): string | null {
	if (!file.type.startsWith('image/')) {
		return 'O arquivo enviado precisa ser uma imagem.'
	}

	if (file.size > MAX_SUBMISSION_PAGE_SIZE_BYTES) {
		return 'A imagem deve ter no máximo 10MB.'
	}

	return null
}
