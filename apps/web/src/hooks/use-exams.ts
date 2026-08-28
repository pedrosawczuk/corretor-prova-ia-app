import type { Exam, GenerateExamInput, Question } from '@app/shared'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export function useGenerateExam() {
	return useMutation({
		mutationFn: (data: GenerateExamInput) =>
			apiClient<Exam>('/exams/generate', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
	})
}

export function useUpdateCorrectOption(examId: string, questionId: string) {
	return useMutation({
		mutationFn: (optionId: string) =>
			apiClient<Question>(
				`/exams/${examId}/questions/${questionId}/correct-option`,
				{
					method: 'PATCH',
					body: JSON.stringify({ optionId }),
				},
			),
	})
}
