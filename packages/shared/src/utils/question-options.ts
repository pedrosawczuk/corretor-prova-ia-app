export type QuestionType = 'multiple_choice' | 'true_false'

const TRUE_FALSE_LETTERS = ['V', 'F']

export function letterForOptionIndex(
	type: QuestionType,
	index: number,
): string {
	if (type === 'true_false') {
		return TRUE_FALSE_LETTERS[index] ?? TRUE_FALSE_LETTERS[1]
	}

	return String.fromCharCode('A'.charCodeAt(0) + index)
}
