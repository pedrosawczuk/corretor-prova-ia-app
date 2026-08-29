import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Textarea } from './textarea'

describe('Textarea', () => {
	it('associates the label and lets the user type', async () => {
		const user = userEvent.setup()
		render(<Textarea label="Enunciado da questão" />)

		const textarea = screen.getByLabelText('Enunciado da questão')
		await user.type(textarea, 'Qual o valor de x?')

		expect(textarea).toHaveValue('Qual o valor de x?')
	})

	it('shows the character count near the limit', async () => {
		const user = userEvent.setup()
		render(<Textarea label="Enunciado" showCount maxLength={10} />)

		const textarea = screen.getByLabelText('Enunciado')
		await user.type(textarea, '123456789')

		expect(screen.getByText('9 / 10')).toBeInTheDocument()
	})

	it('shows the error message and marks the field as invalid', () => {
		render(<Textarea label="Enunciado" errorMessage="Campo obrigatório" />)

		const textarea = screen.getByLabelText('Enunciado')
		expect(textarea).toHaveAttribute('aria-invalid', 'true')
		expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
	})
})
