import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from './accordion'

function FaqAccordion() {
	return (
		<Accordion type="single" collapsible>
			<AccordionItem value="item-1">
				<AccordionTrigger>
					Como funciona a correção automática?
				</AccordionTrigger>
				<AccordionContent>
					A IA compara as respostas com o gabarito.
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="item-2">
				<AccordionTrigger>Posso editar as questões geradas?</AccordionTrigger>
				<AccordionContent>
					Sim, todas as questões podem ser editadas.
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	)
}

describe('Accordion', () => {
	it('starts collapsed and expands the clicked item', async () => {
		const user = userEvent.setup()
		render(<FaqAccordion />)

		const trigger = screen.getByRole('button', {
			name: 'Como funciona a correção automática?',
		})
		expect(trigger).toHaveAttribute('data-state', 'closed')
		expect(
			screen.queryByText('A IA compara as respostas com o gabarito.'),
		).not.toBeInTheDocument()

		await user.click(trigger)

		expect(trigger).toHaveAttribute('data-state', 'open')
		expect(
			screen.getByText('A IA compara as respostas com o gabarito.'),
		).toBeInTheDocument()
	})

	it('collapses one item when opening another (single mode)', async () => {
		const user = userEvent.setup()
		render(<FaqAccordion />)

		const firstTrigger = screen.getByRole('button', {
			name: 'Como funciona a correção automática?',
		})
		const secondTrigger = screen.getByRole('button', {
			name: 'Posso editar as questões geradas?',
		})

		await user.click(firstTrigger)
		expect(firstTrigger).toHaveAttribute('data-state', 'open')

		await user.click(secondTrigger)
		expect(firstTrigger).toHaveAttribute('data-state', 'closed')
		expect(secondTrigger).toHaveAttribute('data-state', 'open')
	})
})
