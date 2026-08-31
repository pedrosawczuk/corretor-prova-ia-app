import { db, eq, examsTable, submissionsTable } from '@app/db'
import { NotFoundError } from '@/core/errors'

export async function fetchOwnedSubmission(
	submissionId: string,
	userId: string,
) {
	const [row] = await db
		.select({ submission: submissionsTable, exam: examsTable })
		.from(submissionsTable)
		.innerJoin(examsTable, eq(submissionsTable.examId, examsTable.id))
		.where(eq(submissionsTable.id, submissionId))

	if (!row || row.exam.creatorId !== userId) {
		throw new NotFoundError('Submissão não encontrada.')
	}

	return row
}
