import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
	Header,
	HeaderActions,
	HeaderBrand,
	HeaderNav,
	HeaderNavItem,
} from './header'

describe('Header', () => {
	it('renders as a banner landmark with brand, nav and actions', () => {
		render(
			<Header>
				<HeaderBrand>Gabarita.app</HeaderBrand>
				<HeaderNav>
					<HeaderNavItem href="/dashboard" isActive>
						Dashboard
					</HeaderNavItem>
					<HeaderNavItem href="/turmas">Turmas</HeaderNavItem>
				</HeaderNav>
				<HeaderActions>
					<button type="button">Sair</button>
				</HeaderActions>
			</Header>,
		)

		expect(screen.getByRole('banner')).toBeInTheDocument()
		expect(screen.getByText('Gabarita.app')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
			'href',
			'/dashboard',
		)
		expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
	})

	it('renders HeaderBrand as its child element when asChild is used', () => {
		render(
			<Header>
				<HeaderBrand asChild>
					<a href="/">Gabarita.app</a>
				</HeaderBrand>
			</Header>,
		)

		expect(screen.getByRole('link', { name: 'Gabarita.app' })).toHaveAttribute(
			'href',
			'/',
		)
	})
})
