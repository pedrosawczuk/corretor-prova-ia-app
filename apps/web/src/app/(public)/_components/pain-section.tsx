import { Badge } from '@app/ui'

export function PainSection() {
	return (
		<section className="px-6 py-12 max-w-6xl mx-auto w-full">
			<div className="rounded-3xl bg-muted/40 border border-border/80 p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 shadow-xs">
				<Badge variant="secondary" size="xs">
					O Custo do Método Manual
				</Badge>
				<h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
					Você não virou professor para passar o domingo somando pontos na
					calculadora.
				</h2>
				<p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
					Em média, um professor gasta entre{' '}
					<strong>8 e 12 horas por semana</strong> apenas decifrando bolinhas de
					gabarito e recalculando notas por cansaço. É tempo de descanso,
					planejamento de aula e convívio com sua família que se perde em
					trabalho braçal repetitivo.
				</p>
			</div>
		</section>
	)
}
