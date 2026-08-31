import { classroomsTable, db, eq, subjectsTable, user } from '@app/db'

export interface ExamHeaderInfo {
	classroomName: string
	subjectName: string
	teacherName: string
}

export async function fetchExamHeaderInfo(
	classroomId: string,
	teacherId: string,
): Promise<ExamHeaderInfo> {
	const [row] = await db
		.select({
			classroomName: classroomsTable.name,
			subjectName: subjectsTable.name,
			teacherName: user.name,
		})
		.from(classroomsTable)
		.innerJoin(subjectsTable, eq(subjectsTable.id, classroomsTable.subjectId))
		.innerJoin(user, eq(user.id, teacherId))
		.where(eq(classroomsTable.id, classroomId))

	return {
		classroomName: row?.classroomName ?? '',
		subjectName: row?.subjectName ?? '',
		teacherName: row?.teacherName ?? '',
	}
}
