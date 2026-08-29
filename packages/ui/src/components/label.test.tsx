import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Label } from './label'

describe('Label', () => {
	it('associates with a field via htmlFor', () => {
		render(
			<>
				<Label htmlFor="nome">Nome completo</Label>
				<input id="nome" />
			</>,
		)

		expect(screen.getByLabelText('Nome completo')).toBeInTheDocument()
	})

	it('shows the required marker as decorative, keeping the accessible name clean', () => {
		render(
			<>
				<Label htmlFor="email" required>
					E-mail
				</Label>
				<input id="email" />
			</>,
		)

		expect(screen.getByRole('textbox', { name: 'E-mail' })).toBeInTheDocument()
		expect(screen.getByTitle('Campo obrigatório')).toBeInTheDocument()
	})

	it('renders the helper text below the label', () => {
		render(<Label helperText="Usaremos apenas para contato.">Telefone</Label>)

		expect(
			screen.getByText('Usaremos apenas para contato.'),
		).toBeInTheDocument()
	})
})
