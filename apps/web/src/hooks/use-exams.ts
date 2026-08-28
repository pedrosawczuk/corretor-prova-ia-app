import type {
	CreateExamInput,
	Exam,
	GenerateExamInput,
	Question,
} from '@app/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

const examsKeys = {
	list: (classroomId: string) => ['exams', classroomId] as const,
	detail: (examId: string) => ['exams', 'detail', examId] as const,
}

export function useExams(classroomId: string) {
	return useQuery({
		queryKey: examsKeys.list(classroomId),
		queryFn: () => apiClient<Exam[]>(`/exams?classroomId=${classroomId}`),
		enabled: Boolean(classroomId),
	})
}

export function useExam(examId: string) {
	return useQuery({
		queryKey: examsKeys.detail(examId),
		queryFn: () => apiClient<Exam>(`/exams/${examId}`),
		enabled: Boolean(examId),
	})
}

export function useCreateExam(classroomId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateExamInput) =>
			apiClient<Exam>('/exams', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: examsKeys.list(classroomId) })
		},
	})
}

export function useGenerateExam(examId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: GenerateExamInput) =>
			apiClient<Exam>(`/exams/${examId}/generate`, {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		onSuccess: (exam) => {
			queryClient.setQueryData(examsKeys.detail(examId), exam)
			queryClient.invalidateQueries({
				queryKey: examsKeys.list(exam.classroomId),
			})
		},
	})
}

export function useUpdateCorrectOption(examId: string, questionId: string) {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (optionId: string) =>
			apiClient<Question>(
				`/exams/${examId}/questions/${questionId}/correct-option`,
				{
					method: 'PATCH',
					body: JSON.stringify({ optionId }),
				},
			),
		onSuccess: (question) => {
			queryClient.setQueryData<Exam>(
				examsKeys.detail(examId),
				(prev) =>
					prev && {
						...prev,
						questions: prev.questions.map((q) =>
							q.id === question.id ? question : q,
						),
					},
			)
		},
	})
}
