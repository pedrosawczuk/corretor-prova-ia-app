import { describe, expect, it } from 'vitest'
import {
	buildClassroomPerformanceData,
	MAX_CLASSROOMS_IN_CHART,
} from './dashboard-overview.utils'

describe('buildClassroomPerformanceData', () => {
	it('ordena as turmas por nota média crescente (pior desempenho primeiro)', () => {
		const byClassroom = [
			{
				classroomId: '1',
				classroomName: 'Turma A',
				averageScorePercentage: 85.0,
				correctedSubmissionsCount: 5,
			},
			{
				classroomId: '2',
				classroomName: 'Turma B',
				averageScorePercentage: 60.5,
				correctedSubmissionsCount: 4,
			},
			{
				classroomId: '3',
				classroomName: 'Turma C',
				averageScorePercentage: 72.0,
				correctedSubmissionsCount: 3,
			},
		]

		const result = buildClassroomPerformanceData(byClassroom)

		expect(result).toHaveLength(3)
		expect(result.map((c) => c.classroomName)).toEqual([
			'Turma B',
			'Turma C',
			'Turma A',
		])
		expect(result.map((c) => c.averageScorePercentage)).toEqual([
			60.5, 72.0, 85.0,
		])
	})

	it('limita o resultado a MAX_CLASSROOMS_IN_CHART (6) turmas', () => {
		const byClassroom = [
			{
				classroomId: '1',
				classroomName: 'T1',
				averageScorePercentage: 90,
				correctedSubmissionsCount: 1,
			},
			{
				classroomId: '2',
				classroomName: 'T2',
				averageScorePercentage: 50,
				correctedSubmissionsCount: 1,
			},
			{
				classroomId: '3',
				classroomName: 'T3',
				averageScorePercentage: 80,
				correctedSubmissionsCount: 1,
			},
			{
				classroomId: '4',
				classroomName: 'T4',
				averageScorePercentage: 70,
				correctedSubmissionsCount: 1,
			},
			{
				classroomId: '5',
				classroomName: 'T5',
				averageScorePercentage: 60,
				correctedSubmissionsCount: 1,
			},
			{
				classroomId: '6',
				classroomName: 'T6',
				averageScorePercentage: 40,
				correctedSubmissionsCount: 1,
			},
			{
				classroomId: '7',
				classroomName: 'T7',
				averageScorePercentage: 30,
				correctedSubmissionsCount: 1,
			},
			{
				classroomId: '8',
				classroomName: 'T8',
				averageScorePercentage: 95,
				correctedSubmissionsCount: 1,
			},
		]

		const result = buildClassroomPerformanceData(byClassroom)

		expect(result).toHaveLength(MAX_CLASSROOMS_IN_CHART)
		expect(result).toHaveLength(6)
		expect(result[0].classroomName).toBe('T7')
		expect(result[result.length - 1].classroomName).toBe('T3')
	})

	it('retorna array vazio quando não há turmas', () => {
		const result = buildClassroomPerformanceData([])
		expect(result).toEqual([])
	})
})
