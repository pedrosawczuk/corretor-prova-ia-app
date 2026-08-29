import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './card'

describe('Card', () => {
	it('renders header, content and footer together', () => {
		render(
			<Card>
				<CardHeader>
					<CardTitle>Turma 9º Ano A</CardTitle>
					<CardDescription>32 alunos matriculados</CardDescription>
				</CardHeader>
				<CardContent>Última prova: Matemática</CardContent>
				<CardFooter>
					<button type="button">Ver detalhes</button>
				</CardFooter>
			</Card>,
		)

		expect(
			screen.getByRole('heading', { name: 'Turma 9º Ano A' }),
		).toBeInTheDocument()
		expect(screen.getByText('32 alunos matriculados')).toBeInTheDocument()
		expect(screen.getByText('Última prova: Matemática')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: 'Ver detalhes' }),
		).toBeInTheDocument()
	})

	it('fires onClick when used as an interactive card', async () => {
		const user = userEvent.setup()
		const onClick = vi.fn()

		render(
			<Card interactive onClick={onClick} role="button" tabIndex={0}>
				Turma 9º Ano A
			</Card>,
		)

		await user.click(screen.getByText('Turma 9º Ano A'))
		expect(onClick).toHaveBeenCalledTimes(1)
	})
})
