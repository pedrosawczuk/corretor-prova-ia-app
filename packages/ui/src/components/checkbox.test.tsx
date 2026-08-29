import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Checkbox } from './checkbox'

describe('Checkbox', () => {
	it('toggles checked state when clicked directly', async () => {
		const user = userEvent.setup()
		const onCheckedChange = vi.fn()

		render(
			<Checkbox
				aria-label="Aceitar termos"
				onCheckedChange={onCheckedChange}
			/>,
		)

		const checkbox = screen.getByRole('checkbox', { name: 'Aceitar termos' })
		expect(checkbox).toHaveAttribute('aria-checked', 'false')

		await user.click(checkbox)

		expect(onCheckedChange).toHaveBeenCalledWith(true)
	})

	it('toggles when clicking the associated label', async () => {
		const user = userEvent.setup()

		function ControlledCheckbox() {
			const [checked, setChecked] = useState(false)
			return (
				<Checkbox
					label="Lembrar de mim"
					checked={checked}
					onCheckedChange={(value) => setChecked(value === true)}
				/>
			)
		}

		render(<ControlledCheckbox />)

		const checkbox = screen.getByRole('checkbox', { name: 'Lembrar de mim' })
		expect(checkbox).toHaveAttribute('data-state', 'unchecked')

		await user.click(screen.getByText('Lembrar de mim'))

		expect(checkbox).toHaveAttribute('data-state', 'checked')
	})

	it('renders the indeterminate state', () => {
		render(<Checkbox aria-label="Selecionar todos" checked="indeterminate" />)

		expect(
			screen.getByRole('checkbox', { name: 'Selecionar todos' }),
		).toHaveAttribute('data-state', 'indeterminate')
	})

	it('shows the error message next to the label', () => {
		render(<Checkbox label="Concordo" errorMessage="Campo obrigatório" />)

		expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
	})
})
