import type { fetchExamDetail } from './fetch-exam-detail'
import type { ExamHeaderInfo } from './fetch-exam-header-info'

type ExamDetail = NonNullable<Awaited<ReturnType<typeof fetchExamDetail>>>

export type ExamExportData = ExamDetail & ExamHeaderInfo

const DIACRITICS_REGEX = /[̀-ͯ]/g

export function buildExamExportFilename(
	title: string,
	extension: 'pdf' | 'docx',
): string {
	const slug = title
		.normalize('NFD')
		.replace(DIACRITICS_REGEX, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')

	return `${slug || 'prova'}.${extension}`
}
