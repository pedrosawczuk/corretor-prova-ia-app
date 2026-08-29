import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Toaster, toast } from './sonner'

describe('Toaster', () => {
	it('renders a toast pushed via the toast() helper', async () => {
		render(<Toaster />)

		act(() => {
			toast.success('Prova salva com sucesso!')
		})

		expect(
			await screen.findByText('Prova salva com sucesso!'),
		).toBeInTheDocument()
	})
})
