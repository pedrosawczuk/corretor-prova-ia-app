import type { Meta, StoryObj } from '@storybook/react'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from './accordion'

const meta: Meta<typeof Accordion> = {
	title: 'Components/Accordion',
	component: Accordion,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente expansível para perguntas frequentes (FAQ), listas de detalhes e quebra de objeções com teclado acessível (WAI-ARIA).',
			},
		},
	},
}

export default meta
type Story = StoryObj<typeof Accordion>

export const FAQExample: Story = {
	render: () => (
		<div className="w-full max-w-lg p-6 rounded-2xl border bg-card">
			<h3 className="text-base font-bold text-foreground mb-4">
				Dúvidas Frequentes
			</h3>
			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="item-1">
					<AccordionTrigger>
						Como funciona a segurança dos dados dos alunos (LGPD)?
					</AccordionTrigger>
					<AccordionContent>
						O Gabarita.app não exige cadastro prévio ou matrícula de alunos. As
						fotos das provas são processadas apenas para o cálculo da nota e não
						são compartilhadas com terceiros.
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="item-2">
					<AccordionTrigger>
						Precisa de internet no momento do escaneamento?
					</AccordionTrigger>
					<AccordionContent>
						Você pode tirar as fotos mesmo com conexão lenta; assim que o
						dispositivo se conectar, as folhas são processadas e sincronizadas
						automaticamente.
					</AccordionContent>
				</AccordionItem>

				<AccordionItem value="item-3">
					<AccordionTrigger>
						Funciona com provas de qualquer formato ou matéria?
					</AccordionTrigger>
					<AccordionContent>
						Sim! Você pode criar provas de qualquer disciplina e usar tanto
						questões de múltipla escolha (A, B, C, D, E) quanto Verdadeiro ou
						Falso (V/F).
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	),
}

