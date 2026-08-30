import type { CreateClassroomInput } from '@app/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export interface Classroom {
	id: string
	name: string
	subjectId: string
	description: string | null
	teacherId: string
	createdAt: string
	updatedAt: string
}

const classroomsKeys = {
	all: ['classrooms'] as const,
	detail: (id: string) => ['classrooms', id] as const,
}

export function useClassrooms() {
	return useQuery({
		queryKey: classroomsKeys.all,
		queryFn: () => apiClient<Classroom[]>('/classrooms'),
	})
}

export function useClassroom(id: string) {
	return useQuery({
		queryKey: classroomsKeys.detail(id),
		queryFn: () => apiClient<Classroom>(`/classrooms/${id}`),
		enabled: Boolean(id),
	})
}

export function useCreateClassroom() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateClassroomInput) =>
			apiClient<Classroom>('/classrooms', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: classroomsKeys.all })
		},
	})
}

export function useUpdateClassroom(id: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateClassroomInput) =>
			apiClient<Classroom>(`/classrooms/${id}`, {
				method: 'PATCH',
				body: JSON.stringify(data),
			}),
		onSuccess: (classroom) => {
			queryClient.invalidateQueries({ queryKey: classroomsKeys.all })
			queryClient.setQueryData(classroomsKeys.detail(id), classroom)
		},
	})
}

export function useDeleteClassroom() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) =>
			apiClient<void>(`/classrooms/${id}`, { method: 'DELETE' }),
		onSuccess: (_data, id) => {
			queryClient.invalidateQueries({ queryKey: classroomsKeys.all })
			queryClient.removeQueries({ queryKey: classroomsKeys.detail(id) })
		},
	})
}
