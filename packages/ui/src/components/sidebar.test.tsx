import { render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SidebarProvider, SidebarTrigger, useSidebar } from './sidebar'

function StateProbe() {
	const { state, open } = useSidebar()
	return <span data-testid="state">{`${state}:${open}`}</span>
}

describe('Sidebar', () => {
	it('throws when useSidebar is used outside a SidebarProvider', () => {
		expect(() => renderHook(() => useSidebar())).toThrow(
			'useSidebar must be used within a <SidebarProvider />',
		)
	})

	it('starts expanded by default and collapses via the trigger', async () => {
		const user = userEvent.setup()

		render(
			<SidebarProvider>
				<StateProbe />
				<SidebarTrigger />
			</SidebarProvider>,
		)

		expect(screen.getByTestId('state')).toHaveTextContent('expanded:true')

		await user.click(
			screen.getByRole('button', { name: 'Alternar barra lateral (Ctrl+B)' }),
		)

		expect(screen.getByTestId('state')).toHaveTextContent('collapsed:false')
	})

	it('toggles via the Ctrl+B keyboard shortcut', async () => {
		const user = userEvent.setup()

		render(
			<SidebarProvider>
				<StateProbe />
			</SidebarProvider>,
		)

		expect(screen.getByTestId('state')).toHaveTextContent('expanded:true')

		await user.keyboard('{Control>}b{/Control}')

		expect(screen.getByTestId('state')).toHaveTextContent('collapsed:false')
	})
})
