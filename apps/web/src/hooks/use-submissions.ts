import type { Submission, SubmissionAnswer, SubmissionPage } from '@app/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const submissionsKeys = {
	detail: (submissionId: string) =>
		['submissions', 'detail', submissionId] as const,
}

export function useSubmission(submissionId: string | undefined) {
	return useQuery({
		queryKey: submissionsKeys.detail(submissionId ?? ''),
		queryFn: () => apiClient<Submission>(`/submissions/${submissionId}`),
		enabled: Boolean(submissionId),
	})
}

export function useCreateSubmission(examId: string) {
	return useMutation({
		mutationFn: (studentIdentifier?: string) =>
			apiClient<Submission>(`/exams/${examId}/submissions`, {
				method: 'POST',
				body: JSON.stringify(studentIdentifier ? { studentIdentifier } : {}),
			}),
	})
}

export function useUploadSubmissionPage(submissionId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (file: Blob) => {
			const formData = new FormData()
			formData.append('file', file, 'pagina.jpg')

			return apiClient<SubmissionPage>(`/submissions/${submissionId}/pages`, {
				method: 'POST',
				body: formData,
			})
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: submissionsKeys.detail(submissionId),
			})
		},
	})
}

export function useProcessSubmission(submissionId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: () =>
			apiClient<Submission>(`/submissions/${submissionId}/process`, {
				method: 'POST',
			}),
		onSuccess: (submission) => {
			queryClient.setQueryData(submissionsKeys.detail(submissionId), submission)
		},
	})
}

export function useReviewSubmissionAnswer(submissionId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			answerId,
			optionId,
		}: {
			answerId: string
			optionId: string | null
		}) =>
			apiClient<SubmissionAnswer>(
				`/submissions/${submissionId}/answers/${answerId}`,
				{
					method: 'PATCH',
					body: JSON.stringify({ optionId }),
				},
			),
		onSuccess: (answer) => {
			queryClient.setQueryData<Submission>(
				submissionsKeys.detail(submissionId),
				(prev) =>
					prev && {
						...prev,
						answers: prev.answers.map((a) => (a.id === answer.id ? answer : a)),
					},
			)
		},
	})
}
