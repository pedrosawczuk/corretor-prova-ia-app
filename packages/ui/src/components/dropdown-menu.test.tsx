import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from './dropdown-menu'

describe('DropdownMenu', () => {
	it('opens the menu and runs the selected item action', async () => {
		const user = userEvent.setup()
		const onSelectEdit = vi.fn()

		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Ações</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onSelect={onSelectEdit}>Editar</DropdownMenuItem>
					<DropdownMenuItem>Excluir</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>,
		)

		expect(screen.queryByRole('menu')).not.toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'Ações' }))
		await user.click(await screen.findByRole('menuitem', { name: 'Editar' }))

		expect(onSelectEdit).toHaveBeenCalledTimes(1)
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})

	it('toggles a checkbox item', async () => {
		const user = userEvent.setup()
		const onCheckedChange = vi.fn()

		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Colunas</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuCheckboxItem
						checked={false}
						onCheckedChange={onCheckedChange}
					>
						Mostrar nota
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</DropdownMenu>,
		)

		await user.click(screen.getByRole('button', { name: 'Colunas' }))
		await user.click(
			await screen.findByRole('menuitemcheckbox', { name: 'Mostrar nota' }),
		)

		expect(onCheckedChange).toHaveBeenCalledWith(true)
	})
})
