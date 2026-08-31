import { formatPoints } from '@app/shared'
import {
	Document,
	Page,
	renderToBuffer,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer'
import {
	ALIGNMENT_MARKER_SIZE_PT,
	ALIGNMENT_MARKERS,
	EXAM_TEMPLATE_PAGE_HEIGHT_PT,
} from '@/lib/vision/exam-template-geometry'
import type { ExamExportData } from './exam-export-data'

const styles = StyleSheet.create({
	page: {
		paddingTop: 40,
		paddingBottom: 48,
		paddingHorizontal: 48,
		fontSize: 11,
		fontFamily: 'Helvetica',
		color: '#111111',
	},
	title: {
		fontSize: 18,
		fontFamily: 'Helvetica-Bold',
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 10,
		color: '#555555',
		marginBottom: 2,
	},
	fieldsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 16,
		marginBottom: 12,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: '#cccccc',
		paddingVertical: 8,
	},
	fieldLabel: {
		fontSize: 10,
	},
	instructions: {
		fontSize: 10,
		color: '#333333',
		marginBottom: 16,
		lineHeight: 1.4,
	},
	question: {
		marginBottom: 14,
	},
	statementRow: {
		flexDirection: 'row',
		marginBottom: 6,
	},
	questionNumber: {
		fontFamily: 'Helvetica-Bold',
		marginRight: 4,
	},
	statementText: {
		flex: 1,
		lineHeight: 1.4,
	},
	pointsText: {
		fontSize: 9,
		color: '#666666',
	},
	optionRow: {
		flexDirection: 'row',
		marginLeft: 16,
		marginBottom: 4,
	},
	optionLetter: {
		fontFamily: 'Helvetica-Bold',
		marginRight: 4,
	},
	optionText: {
		flex: 1,
		lineHeight: 1.3,
	},
	footer: {
		position: 'absolute',
		bottom: 20,
		left: 48,
		right: 48,
		fontSize: 8,
		color: '#999999',
		textAlign: 'center',
	},
	alignmentMarker: {
		position: 'absolute',
		width: ALIGNMENT_MARKER_SIZE_PT,
		height: ALIGNMENT_MARKER_SIZE_PT,
		backgroundColor: '#000000',
	},
})

const DEFAULT_INSTRUCTIONS =
	'Leia atentamente cada questão e assinale apenas uma alternativa.'

function ExamPdfDocument({ data }: { data: ExamExportData }) {
	const questions = [...data.questions].sort((a, b) => a.order - b.order)

	return (
		<Document title={data.title}>
			<Page size="A4" style={styles.page}>
				{ALIGNMENT_MARKERS.map((marker) => (
					<View
						key={marker.id}
						fixed
						style={[
							styles.alignmentMarker,
							{
								left: marker.x - ALIGNMENT_MARKER_SIZE_PT / 2,
								top:
									EXAM_TEMPLATE_PAGE_HEIGHT_PT -
									marker.y -
									ALIGNMENT_MARKER_SIZE_PT / 2,
							},
						]}
					/>
				))}

				<Text style={styles.title}>{data.title}</Text>
				<Text style={styles.subtitle}>
					{data.subjectName} • {data.classroomName}
				</Text>
				<Text style={styles.subtitle}>Professor(a): {data.teacherName}</Text>

				<View style={styles.fieldsRow}>
					<Text style={styles.fieldLabel}>
						Nome: _________________________________________
					</Text>
					<Text style={styles.fieldLabel}>Data: ___/___/______</Text>
					<Text style={styles.fieldLabel}>
						Nota: _____ / {formatPoints(data.totalPoints)}
					</Text>
				</View>

				<Text style={styles.instructions}>
					{data.description || DEFAULT_INSTRUCTIONS}
				</Text>

				{questions.map((question, index) => (
					<View key={question.id} style={styles.question} wrap={false}>
						<View style={styles.statementRow}>
							<Text style={styles.questionNumber}>
								{String(index + 1).padStart(2, '0')}.
							</Text>
							<Text style={styles.statementText}>
								{question.statement}{' '}
								<Text style={styles.pointsText}>
									({formatPoints(question.maxPoints)} pt)
								</Text>
							</Text>
						</View>

						{question.options.map((option) => (
							<View key={option.id} style={styles.optionRow}>
								<Text style={styles.optionLetter}>{option.letter})</Text>
								<Text style={styles.optionText}>{option.text}</Text>
							</View>
						))}
					</View>
				))}

				<Text
					style={styles.footer}
					render={({ pageNumber, totalPages }) =>
						`Página ${pageNumber} de ${totalPages}`
					}
					fixed
				/>
			</Page>
		</Document>
	)
}

export async function buildExamPdf(data: ExamExportData): Promise<Buffer> {
	return renderToBuffer(<ExamPdfDocument data={data} />)
}
