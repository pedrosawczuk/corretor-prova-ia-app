import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
	Footer,
	FooterBrand,
	FooterGroup,
	FooterGroupTitle,
	FooterLink,
	FooterLinkList,
} from './footer'

describe('Footer', () => {
	it('renders as a footer landmark with its content', () => {
		render(
			<Footer>
				<FooterBrand>Gabarita.app</FooterBrand>
				<FooterGroup>
					<FooterGroupTitle>Produto</FooterGroupTitle>
					<FooterLinkList>
						<li>
							<FooterLink href="/precos">Preços</FooterLink>
						</li>
					</FooterLinkList>
				</FooterGroup>
			</Footer>,
		)

		expect(screen.getByRole('contentinfo')).toBeInTheDocument()
		expect(screen.getByText('Gabarita.app')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Preços' })).toHaveAttribute(
			'href',
			'/precos',
		)
	})

	it('renders FooterLink as its child element when asChild is used', () => {
		render(
			<FooterLink asChild>
				<button type="button">Voltar ao topo</button>
			</FooterLink>,
		)

		expect(
			screen.getByRole('button', { name: 'Voltar ao topo' }),
		).toBeInTheDocument()
	})
})
