import {
	and,
	asc,
	classroomsTable,
	db,
	eq,
	examsTable,
	questionsTable,
	sql,
	submissionAnswersTable,
	submissionsTable,
} from '@app/db'
import type { PerformanceOverview } from '@app/shared'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { getAuthenticatedUser } from '@/lib/auth/get-authenticated-user'

export async function getPerformanceOverviewModule(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const user = await getAuthenticatedUser(request)

	const [[overallResult], classroomRows, [accuracyResult]] = await Promise.all([
		db
			.select({
				averageScorePercentage: sql<
					number | null
				>`round(avg((${submissionsTable.totalScore}::numeric / nullif(${examsTable.totalPoints}::numeric, 0)) * 100), 1)::float`,
				correctedSubmissionsCount: sql<number>`count(*)::int`,
			})
			.from(submissionsTable)
			.innerJoin(examsTable, eq(submissionsTable.examId, examsTable.id))
			.innerJoin(
				classroomsTable,
				eq(examsTable.classroomId, classroomsTable.id),
			)
			.where(
				and(
					eq(classroomsTable.teacherId, user.id),
					eq(submissionsTable.status, 'completed'),
				),
			),
		db
			.select({
				classroomId: classroomsTable.id,
				classroomName: classroomsTable.name,
				averageScorePercentage: sql<number>`round(avg((${submissionsTable.totalScore}::numeric / nullif(${examsTable.totalPoints}::numeric, 0)) * 100), 1)::float`,
				correctedSubmissionsCount: sql<number>`count(*)::int`,
			})
			.from(submissionsTable)
			.innerJoin(examsTable, eq(submissionsTable.examId, examsTable.id))
			.innerJoin(
				classroomsTable,
				eq(examsTable.classroomId, classroomsTable.id),
			)
			.where(
				and(
					eq(classroomsTable.teacherId, user.id),
					eq(submissionsTable.status, 'completed'),
				),
			)
			.groupBy(classroomsTable.id, classroomsTable.name)
			.orderBy(asc(classroomsTable.name)),
		db
			.select({
				totalAnswers: sql<number>`count(*)::int`,
				accuracyRate: sql<
					number | null
				>`round(avg(case when ${submissionAnswersTable.finalScore}::numeric = ${questionsTable.maxPoints}::numeric then 100.0 else 0.0 end), 1)::float`,
			})
			.from(submissionAnswersTable)
			.innerJoin(
				submissionsTable,
				eq(submissionAnswersTable.submissionId, submissionsTable.id),
			)
			.innerJoin(examsTable, eq(submissionsTable.examId, examsTable.id))
			.innerJoin(
				classroomsTable,
				eq(examsTable.classroomId, classroomsTable.id),
			)
			.innerJoin(
				questionsTable,
				eq(submissionAnswersTable.questionId, questionsTable.id),
			)
			.where(
				and(
					eq(classroomsTable.teacherId, user.id),
					eq(submissionsTable.status, 'completed'),
				),
			),
	])

	const correctedSubmissionsCount = overallResult?.correctedSubmissionsCount
		? Number(overallResult.correctedSubmissionsCount)
		: 0

	const averageScorePercentage =
		correctedSubmissionsCount > 0 &&
		overallResult?.averageScorePercentage != null
			? Math.round(Number(overallResult.averageScorePercentage) * 10) / 10
			: null

	const accuracyRate =
		accuracyResult?.totalAnswers &&
		Number(accuracyResult.totalAnswers) > 0 &&
		accuracyResult.accuracyRate != null
			? Math.round(Number(accuracyResult.accuracyRate) * 10) / 10
			: null

	const byClassroom = (classroomRows ?? []).map((row) => ({
		classroomId: row.classroomId,
		classroomName: row.classroomName,
		averageScorePercentage:
			Math.round(Number(row.averageScorePercentage) * 10) / 10,
		correctedSubmissionsCount: Number(row.correctedSubmissionsCount),
	}))

	const response: PerformanceOverview = {
		overall: {
			averageScorePercentage,
			accuracyRate,
			correctedSubmissionsCount,
		},
		byClassroom,
	}

	return reply.status(200).send(response)
}
