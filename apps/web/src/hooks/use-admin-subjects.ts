import type { CreateSubjectInput } from '@app/shared'
import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import type { PaginationMeta } from '@/hooks/use-admin'
import type { Subject } from '@/hooks/use-subjects'
import { apiClient } from '@/lib/api-client'

export interface AdminSubjectsPage {
	data: Subject[]
	pagination: PaginationMeta
}

const adminSubjectsKeys = {
	all: ['admin', 'subjects'] as const,
	list: (page: number, pageSize: number) =>
		['admin', 'subjects', page, pageSize] as const,
}

export function useAdminSubjects(page = 1, pageSize = 20) {
	return useQuery({
		queryKey: adminSubjectsKeys.list(page, pageSize),
		queryFn: () =>
			apiClient<AdminSubjectsPage>(
				`/admin/subjects?page=${page}&pageSize=${pageSize}`,
			),
		placeholderData: keepPreviousData,
	})
}

export function useCreateAdminSubject() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateSubjectInput) =>
			apiClient<Subject>('/admin/subjects', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminSubjectsKeys.all })
			queryClient.invalidateQueries({ queryKey: ['subjects'] })
		},
	})
}

export function useUpdateAdminSubject(id: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateSubjectInput) =>
			apiClient<Subject>(`/admin/subjects/${id}`, {
				method: 'PATCH',
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminSubjectsKeys.all })
			queryClient.invalidateQueries({ queryKey: ['subjects'] })
		},
	})
}

export function useDeleteAdminSubject() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) =>
			apiClient<void>(`/admin/subjects/${id}`, { method: 'DELETE' }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminSubjectsKeys.all })
			queryClient.invalidateQueries({ queryKey: ['subjects'] })
		},
	})
}
