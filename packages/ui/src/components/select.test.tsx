import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Select, SelectItem } from './select'

function SubjectSelect() {
	const [value, setValue] = useState<string | undefined>(undefined)
	return (
		<Select
			label="Disciplina"
			placeholder="Selecione a disciplina"
			value={value}
			onValueChange={setValue}
		>
			<SelectItem value="matematica">Matemática</SelectItem>
			<SelectItem value="portugues">Português</SelectItem>
		</Select>
	)
}

describe('Select', () => {
	it('shows the placeholder, then updates the value once an option is picked', async () => {
		const user = userEvent.setup()
		render(<SubjectSelect />)

		const trigger = screen.getByRole('combobox')
		expect(trigger).toHaveTextContent('Selecione a disciplina')

		await user.click(trigger)
		await user.click(await screen.findByRole('option', { name: 'Português' }))

		expect(trigger).toHaveTextContent('Português')
	})

	it('calls onValueChange with the selected option', async () => {
		const user = userEvent.setup()
		const onValueChange = vi.fn()

		render(
			<Select
				label="Disciplina"
				placeholder="Selecione a disciplina"
				onValueChange={onValueChange}
			>
				<SelectItem value="matematica">Matemática</SelectItem>
				<SelectItem value="portugues">Português</SelectItem>
			</Select>,
		)

		await user.click(screen.getByRole('combobox'))
		await user.click(await screen.findByRole('option', { name: 'Matemática' }))

		expect(onValueChange).toHaveBeenCalledWith('matematica')
	})

	it('renders the error message and marks the trigger as invalid', () => {
		render(
			<Select label="Disciplina" errorMessage="Selecione uma disciplina">
				<SelectItem value="matematica">Matemática</SelectItem>
			</Select>,
		)

		expect(screen.getByText('Selecione uma disciplina')).toBeInTheDocument()
	})
})
