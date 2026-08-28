import {
	db,
	eq,
	examsTable,
	inArray,
	questionOptionsTable,
	questionsTable,
} from '@app/db'

export async function fetchQuestionsWithOptions(examId: string) {
	const questions = await db
		.select()
		.from(questionsTable)
		.where(eq(questionsTable.examId, examId))
		.orderBy(questionsTable.order)

	const questionIds = questions.map((question) => question.id)

	const options = questionIds.length
		? await db
				.select()
				.from(questionOptionsTable)
				.where(inArray(questionOptionsTable.questionId, questionIds))
		: []

	return questions.map((question) => ({
		...question,
		options: options.filter((option) => option.questionId === question.id),
	}))
}

export async function fetchExamDetail(examId: string) {
	const [exam] = await db
		.select()
		.from(examsTable)
		.where(eq(examsTable.id, examId))

	if (!exam) {
		return null
	}

	const questions = await fetchQuestionsWithOptions(examId)

	return { ...exam, questions }
}
