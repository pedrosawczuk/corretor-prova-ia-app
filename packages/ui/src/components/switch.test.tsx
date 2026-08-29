import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Switch } from './switch'

describe('Switch', () => {
	it('toggles when clicked', async () => {
		const user = userEvent.setup()
		const onCheckedChange = vi.fn()

		render(
			<Switch
				aria-label="Notificações por e-mail"
				onCheckedChange={onCheckedChange}
			/>,
		)

		const toggle = screen.getByRole('switch', {
			name: 'Notificações por e-mail',
		})
		expect(toggle).toHaveAttribute('aria-checked', 'false')

		await user.click(toggle)
		expect(onCheckedChange).toHaveBeenCalledWith(true)
	})

	it('toggles when clicking the associated label', async () => {
		const user = userEvent.setup()

		function ControlledSwitch() {
			const [checked, setChecked] = useState(false)
			return (
				<Switch
					label="Modo escuro"
					checked={checked}
					onCheckedChange={setChecked}
				/>
			)
		}

		render(<ControlledSwitch />)

		const toggle = screen.getByRole('switch', { name: 'Modo escuro' })
		await user.click(screen.getByText('Modo escuro'))

		expect(toggle).toHaveAttribute('aria-checked', 'true')
	})

	it('shows the error message', () => {
		render(<Switch label="Aceitar termos" errorMessage="Campo obrigatório" />)
		expect(screen.getByText('Campo obrigatório')).toBeInTheDocument()
	})
})
