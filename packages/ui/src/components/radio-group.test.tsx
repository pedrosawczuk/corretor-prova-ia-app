import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RadioGroup, RadioGroupItem } from './radio-group'

describe('RadioGroup', () => {
	it('selects an item and reports the change', async () => {
		const user = userEvent.setup()
		const onValueChange = vi.fn()

		render(
			<RadioGroup label="Dificuldade" onValueChange={onValueChange}>
				<RadioGroupItem value="facil" label="Fácil" />
				<RadioGroupItem value="dificil" label="Difícil" />
			</RadioGroup>,
		)

		const easy = screen.getByRole('radio', { name: 'Fácil' })
		const hard = screen.getByRole('radio', { name: 'Difícil' })
		expect(easy).toHaveAttribute('aria-checked', 'false')

		await user.click(hard)

		expect(onValueChange).toHaveBeenCalledWith('dificil')
		expect(hard).toHaveAttribute('aria-checked', 'true')
		expect(easy).toHaveAttribute('aria-checked', 'false')
	})

	it('shows the error message', () => {
		render(
			<RadioGroup label="Dificuldade" errorMessage="Selecione uma opção">
				<RadioGroupItem value="facil" label="Fácil" />
			</RadioGroup>,
		)

		expect(screen.getByText('Selecione uma opção')).toBeInTheDocument()
	})
})
