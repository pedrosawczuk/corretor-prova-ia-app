import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './input'

describe('Input', () => {
	it('associates the label with the field via htmlFor/id', () => {
		render(<Input label="E-mail" />)

		const input = screen.getByLabelText('E-mail')
		expect(input).toBeInTheDocument()
	})

	it('lets the user type as an uncontrolled field', async () => {
		const user = userEvent.setup()
		render(<Input label="Nome" />)

		const input = screen.getByLabelText('Nome')
		await user.type(input, 'Maria')

		expect(input).toHaveValue('Maria')
	})

	it('shows the error message and marks the field as invalid', () => {
		render(<Input label="E-mail" errorMessage="E-mail inválido" />)

		const input = screen.getByLabelText('E-mail')
		expect(input).toHaveAttribute('aria-invalid', 'true')
		expect(screen.getByText('E-mail inválido')).toBeInTheDocument()
	})

	it('toggles password visibility', async () => {
		const user = userEvent.setup()
		render(<Input type="password" label="Senha" defaultValue="segredo" />)

		const input = screen.getByLabelText('Senha')
		expect(input).toHaveAttribute('type', 'password')

		await user.click(screen.getByRole('button', { name: 'Ver senha' }))
		expect(input).toHaveAttribute('type', 'text')

		await user.click(screen.getByRole('button', { name: 'Ocultar senha' }))
		expect(input).toHaveAttribute('type', 'password')
	})

	it('clears the value and calls onClear when the clear button is pressed', async () => {
		const user = userEvent.setup()
		const onClear = vi.fn()

		function ControlledSearch() {
			const [value, setValue] = useState('matemática')
			return (
				<Input
					label="Busca"
					isClearable
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onClear={() => {
						setValue('')
						onClear()
					}}
				/>
			)
		}

		render(<ControlledSearch />)

		const input = screen.getByLabelText('Busca')
		expect(input).toHaveValue('matemática')

		await user.click(screen.getByRole('button', { name: 'Limpar campo' }))

		expect(input).toHaveValue('')
		expect(onClear).toHaveBeenCalledTimes(1)
	})
})
