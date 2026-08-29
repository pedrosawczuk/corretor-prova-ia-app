import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Alert, AlertDescription, AlertTitle } from './alert'

describe('Alert', () => {
	it('renders with an alert role and the given content', () => {
		render(
			<Alert variant="destructive">
				<AlertTitle>Erro ao gerar a prova</AlertTitle>
				<AlertDescription>Tente novamente em instantes.</AlertDescription>
			</Alert>,
		)

		expect(screen.getByRole('alert')).toBeInTheDocument()
		expect(screen.getByText('Erro ao gerar a prova')).toBeInTheDocument()
		expect(
			screen.getByText('Tente novamente em instantes.'),
		).toBeInTheDocument()
	})

	it('calls onClose when the dismiss button is clicked', async () => {
		const user = userEvent.setup()
		const onClose = vi.fn()

		render(<Alert onClose={onClose}>Aviso importante</Alert>)

		await user.click(screen.getByRole('button', { name: 'Fechar aviso' }))
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('does not render a dismiss button without onClose', () => {
		render(<Alert>Aviso importante</Alert>)
		expect(screen.queryByRole('button')).not.toBeInTheDocument()
	})
})
