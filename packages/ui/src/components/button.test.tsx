import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './button'

describe('Button', () => {
	it('renders children and responds to clicks', async () => {
		const user = userEvent.setup()
		const onClick = vi.fn()

		render(<Button onClick={onClick}>Salvar</Button>)

		const button = screen.getByRole('button', { name: 'Salvar' })
		await user.click(button)

		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it('is disabled and inert while isLoading is true', async () => {
		const user = userEvent.setup()
		const onClick = vi.fn()

		render(
			<Button isLoading loadingText="Salvando..." onClick={onClick}>
				Salvar
			</Button>,
		)

		const button = screen.getByRole('button', { name: 'Salvando...' })
		expect(button).toBeDisabled()
		expect(button).toHaveAttribute('aria-busy', 'true')

		await user.click(button)
		expect(onClick).not.toHaveBeenCalled()
	})

	it('does not accept clicks when explicitly disabled', async () => {
		const user = userEvent.setup()
		const onClick = vi.fn()

		render(
			<Button disabled onClick={onClick}>
				Salvar
			</Button>,
		)

		await user.click(screen.getByRole('button', { name: 'Salvar' }))
		expect(onClick).not.toHaveBeenCalled()
	})

	it('renders as the child element when asChild is used', () => {
		render(
			<Button asChild>
				<a href="/dashboard">Ir para o dashboard</a>
			</Button>,
		)

		const link = screen.getByRole('link', { name: 'Ir para o dashboard' })
		expect(link).toHaveAttribute('href', '/dashboard')
	})
})
