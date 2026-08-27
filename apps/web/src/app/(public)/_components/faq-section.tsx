import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Badge,
} from '@app/ui'

export function FaqSection() {
	return (
		<section
			id="faq"
			className="py-16 md:py-24 px-6 max-w-4xl mx-auto w-full space-y-10"
		>
			<div className="text-center max-w-2xl mx-auto space-y-3">
				<Badge variant="primary" size="xs">
					Perguntas Frequentes
				</Badge>
				<h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
					Respostas diretas para as suas dúvidas
				</h2>
				<p className="text-sm text-muted-foreground">
					Tudo o que você precisa saber com total transparência e sem
					juridiquês.
				</p>
			</div>

			<div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-xs">
				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="item-1">
						<AccordionTrigger>
							Como funciona a segurança dos dados dos alunos (LGPD e Menores)?
						</AccordionTrigger>
						<AccordionContent>
							O Gabarita.app foi desenvolvido com privacidade em primeiro lugar:
							você não precisa cadastrar dados pessoais sensíveis, documentos ou
							matrículas de menores. As fotos das provas são utilizadas
							unicamente para a apuração das notas e ficam sob seu controle
							exclusivo.
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="item-2">
						<AccordionTrigger>
							Preciso de internet rápida no momento do escaneamento?
						</AccordionTrigger>
						<AccordionContent>
							Não. Você pode capturar as fotos na sala de aula mesmo com conexão
							instável. As imagens são sincronizadas e processadas de forma
							segura assim que seu aparelho restabelecer o sinal.
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="item-3">
						<AccordionTrigger>
							Funciona com prova de qualquer matéria ou formato de questão?
						</AccordionTrigger>
						<AccordionContent>
							Sim! Você pode utilizar para qualquer disciplina do Ensino
							Fundamental ao Superior. O sistema suporta questões objetivas de
							múltipla escolha (letras A, B, C, D, E) e afirmações de Verdadeiro
							ou Falso (V/F).
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="item-4">
						<AccordionTrigger>
							Posso cancelar meu plano quando quiser?
						</AccordionTrigger>
						<AccordionContent>
							Sim, com total liberdade. Não há taxa de fidelidade nem contratos
							longos. Você pode cancelar sua assinatura com apenas um clique
							diretamente no painel de configurações do app.
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</div>
		</section>
	)
}
