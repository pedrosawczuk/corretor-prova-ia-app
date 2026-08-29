import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AspectRatio, RATIO_PRESETS } from './aspect-ratio'

describe('AspectRatio', () => {
	it('renders its children', () => {
		render(
			<AspectRatio ratio="1/1">
				<img src="/prova.png" alt="Prévia da prova" />
			</AspectRatio>,
		)

		expect(
			screen.getByRole('img', { name: 'Prévia da prova' }),
		).toBeInTheDocument()
	})

	it('exposes the expected numeric presets', () => {
		expect(RATIO_PRESETS['16/9']).toBeCloseTo(16 / 9)
		expect(RATIO_PRESETS['1/1']).toBe(1)
		expect(RATIO_PRESETS.a4).toBeCloseTo(210 / 297)
		expect(RATIO_PRESETS['a4-landscape']).toBeCloseTo(297 / 210)
	})
})
