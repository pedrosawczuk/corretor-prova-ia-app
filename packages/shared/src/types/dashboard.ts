export interface ClassroomPerformance {
	classroomId: string
	classroomName: string
	averageScorePercentage: number
	correctedSubmissionsCount: number
}

export interface PerformanceOverview {
	overall: {
		averageScorePercentage: number | null
		accuracyRate: number | null
		correctedSubmissionsCount: number
	}
	byClassroom: ClassroomPerformance[]
}
