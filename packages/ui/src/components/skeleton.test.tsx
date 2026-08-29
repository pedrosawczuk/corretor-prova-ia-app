import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Skeleton } from './skeleton'

describe('Skeleton', () => {
	it('is hidden from assistive tech and marked busy', () => {
		const { container } = render(<Skeleton />)
		const skeleton = container.firstChild as HTMLElement

		expect(skeleton).toHaveAttribute('aria-hidden', 'true')
		expect(skeleton).toHaveAttribute('aria-busy', 'true')
	})
})
