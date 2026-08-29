import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Slider } from './slider'

describe('Slider', () => {
	it('shows the label and the current value', () => {
		render(<Slider label="Nível de dificuldade" showValue defaultValue={[3]} />)

		expect(screen.getByText('Nível de dificuldade')).toBeInTheDocument()
		expect(screen.getByText('3')).toBeInTheDocument()
	})

	it('increases the value on ArrowRight and reports the change', async () => {
		const user = userEvent.setup()
		const onValueChange = vi.fn()

		render(
			<Slider
				label="Nível de dificuldade"
				defaultValue={[3]}
				min={0}
				max={10}
				step={1}
				onValueChange={onValueChange}
			/>,
		)

		const thumb = screen.getByRole('slider', { name: 'Nível de dificuldade' })
		thumb.focus()
		await user.keyboard('{ArrowRight}')

		expect(onValueChange).toHaveBeenCalledWith([4])
	})

	it('renders the error message', () => {
		render(<Slider label="Peso da questão" errorMessage="Valor inválido" />)
		expect(screen.getByText('Valor inválido')).toBeInTheDocument()
	})
})
