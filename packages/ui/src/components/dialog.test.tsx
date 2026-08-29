import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './dialog'

function ConfirmDialog() {
	return (
		<Dialog>
			<DialogTrigger>Excluir turma</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Excluir turma?</DialogTitle>
					<DialogDescription>
						Essa ação não pode ser desfeita.
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	)
}

describe('Dialog', () => {
	it('is closed by default and opens when the trigger is clicked', async () => {
		const user = userEvent.setup()
		render(<ConfirmDialog />)

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'Excluir turma' }))

		expect(
			screen.getByRole('dialog', { name: 'Excluir turma?' }),
		).toBeInTheDocument()
		expect(
			screen.getByText('Essa ação não pode ser desfeita.'),
		).toBeInTheDocument()
	})

	it('closes via the close button', async () => {
		const user = userEvent.setup()
		render(<ConfirmDialog />)

		await user.click(screen.getByRole('button', { name: 'Excluir turma' }))
		expect(screen.getByRole('dialog')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'Fechar' }))

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('closes on Escape', async () => {
		const user = userEvent.setup()
		render(<ConfirmDialog />)

		await user.click(screen.getByRole('button', { name: 'Excluir turma' }))
		expect(screen.getByRole('dialog')).toBeInTheDocument()

		await user.keyboard('{Escape}')

		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})
})
