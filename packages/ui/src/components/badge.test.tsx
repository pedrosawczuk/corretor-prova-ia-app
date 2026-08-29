import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Badge } from './badge'

describe('Badge', () => {
	it('renders its label', () => {
		render(<Badge>Pendente</Badge>)
		expect(screen.getByText('Pendente')).toBeInTheDocument()
	})

	it('calls onDismiss without bubbling to the badge onClick', async () => {
		const user = userEvent.setup()
		const onDismiss = vi.fn()
		const onClick = vi.fn()

		render(
			<Badge
				onClick={onClick}
				onDismiss={onDismiss}
				dismissLabel="Remover filtro"
			>
				Matemática
			</Badge>,
		)

		await user.click(screen.getByRole('button', { name: 'Remover filtro' }))

		expect(onDismiss).toHaveBeenCalledTimes(1)
		expect(onClick).not.toHaveBeenCalled()
	})

	it('renders as the child element when asChild is used', () => {
		render(
			<Badge asChild>
				<a href="/turmas/1">Turma A</a>
			</Badge>,
		)

		expect(screen.getByRole('link', { name: 'Turma A' })).toHaveAttribute(
			'href',
			'/turmas/1',
		)
	})
})
