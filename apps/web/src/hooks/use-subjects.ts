import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export interface Subject {
	id: string
	name: string
	createdAt: string
	updatedAt: string
}

export function useSubjects() {
	return useQuery({
		queryKey: ['subjects'] as const,
		queryFn: () => apiClient<Subject[]>('/subjects'),
	})
}

export function useSubjectNameMap() {
	const { data: subjects } = useSubjects()
	return new Map(subjects?.map((subject) => [subject.id, subject.name]))
}
