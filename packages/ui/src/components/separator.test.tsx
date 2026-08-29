import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Separator } from './separator'

describe('Separator', () => {
	it('is presentational (role none) by default', () => {
		const { container } = render(<Separator />)
		expect(container.querySelector('[role="none"]')).toBeInTheDocument()
	})

	it('exposes a separator role when not decorative', () => {
		render(<Separator decorative={false} />)
		expect(screen.getByRole('separator')).toBeInTheDocument()
	})

	it('renders a centered label between the two rules', () => {
		render(<Separator label="ou entre com e-mail" />)
		expect(screen.getByText('ou entre com e-mail')).toBeInTheDocument()
	})
})
