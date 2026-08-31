import { formatPoints } from '@app/shared'
import {
	AlignmentType,
	Document,
	Footer,
	Packer,
	PageNumber,
	Paragraph,
	TextRun,
} from 'docx'
import type { ExamExportData } from './exam-export-data'

const DEFAULT_INSTRUCTIONS =
	'Leia atentamente cada questão e assinale apenas uma alternativa.'

export async function buildExamDocx(data: ExamExportData): Promise<Buffer> {
	const questions = [...data.questions].sort((a, b) => a.order - b.order)

	const children: Paragraph[] = [
		new Paragraph({
			children: [new TextRun({ text: data.title, bold: true, size: 32 })],
			spacing: { after: 80 },
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: `${data.subjectName} • ${data.classroomName}`,
					size: 20,
					color: '555555',
				}),
			],
			spacing: { after: 40 },
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: `Professor(a): ${data.teacherName}`,
					size: 20,
					color: '555555',
				}),
			],
			spacing: { after: 200 },
			border: {
				bottom: { style: 'single', size: 6, color: 'CCCCCC', space: 8 },
			},
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: 'Nome: _________________________________________     ',
				}),
				new TextRun({ text: 'Data: ___/___/______     ' }),
				new TextRun({
					text: `Nota: _____ / ${formatPoints(data.totalPoints)}`,
				}),
			],
			spacing: { after: 200 },
			border: {
				bottom: { style: 'single', size: 6, color: 'CCCCCC', space: 8 },
			},
		}),
		new Paragraph({
			children: [
				new TextRun({
					text: data.description || DEFAULT_INSTRUCTIONS,
					italics: true,
					size: 20,
					color: '333333',
				}),
			],
			spacing: { after: 300 },
		}),
	]

	for (const [index, question] of questions.entries()) {
		children.push(
			new Paragraph({
				children: [
					new TextRun({
						text: `${String(index + 1).padStart(2, '0')}. `,
						bold: true,
					}),
					new TextRun({ text: question.statement }),
					new TextRun({
						text: `  (${formatPoints(question.maxPoints)} pt)`,
						size: 18,
						color: '666666',
					}),
				],
				spacing: { before: 160, after: 80 },
			}),
		)

		for (const option of question.options) {
			children.push(
				new Paragraph({
					children: [
						new TextRun({ text: `${option.letter}) `, bold: true }),
						new TextRun({ text: option.text }),
					],
					indent: { left: 360 },
					spacing: { after: 40 },
				}),
			)
		}
	}

	const document = new Document({
		sections: [
			{
				children,
				footers: {
					default: new Footer({
						children: [
							new Paragraph({
								alignment: AlignmentType.CENTER,
								children: [
									new TextRun({
										children: ['Página ', PageNumber.CURRENT],
										size: 16,
										color: '999999',
									}),
									new TextRun({
										children: [' de ', PageNumber.TOTAL_PAGES],
										size: 16,
										color: '999999',
									}),
								],
							}),
						],
					}),
				},
			},
		],
	})

	return Packer.toBuffer(document)
}
