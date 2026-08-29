import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from './alert-dialog'

function DeleteAccountDialog({ onConfirm }: { onConfirm: () => void }) {
	return (
		<AlertDialog>
			<AlertDialogTrigger>Excluir conta</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Excluir sua conta?</AlertDialogTitle>
					<AlertDialogDescription>
						Essa ação é permanente e não pode ser desfeita.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>Excluir</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

describe('AlertDialog', () => {
	it('opens from the trigger and shows the confirmation copy', async () => {
		const user = userEvent.setup()
		render(<DeleteAccountDialog onConfirm={vi.fn()} />)

		await user.click(screen.getByRole('button', { name: 'Excluir conta' }))

		expect(
			screen.getByRole('alertdialog', { name: 'Excluir sua conta?' }),
		).toBeInTheDocument()
	})

	it('closes without confirming when Cancel is clicked', async () => {
		const user = userEvent.setup()
		const onConfirm = vi.fn()
		render(<DeleteAccountDialog onConfirm={onConfirm} />)

		await user.click(screen.getByRole('button', { name: 'Excluir conta' }))
		await user.click(screen.getByRole('button', { name: 'Cancelar' }))

		expect(onConfirm).not.toHaveBeenCalled()
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
	})

	it('runs the action and closes when confirmed', async () => {
		const user = userEvent.setup()
		const onConfirm = vi.fn()
		render(<DeleteAccountDialog onConfirm={onConfirm} />)

		await user.click(screen.getByRole('button', { name: 'Excluir conta' }))
		await user.click(screen.getByRole('button', { name: 'Excluir' }))

		expect(onConfirm).toHaveBeenCalledTimes(1)
		expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
	})
})
