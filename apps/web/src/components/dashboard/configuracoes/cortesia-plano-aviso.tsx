import { CalendarClock, Info } from 'lucide-react'
import type { PlanSlug } from '@/hooks/use-billing'
import { formatDate } from '@/lib/date'
import { AssinarPlanoCards } from './assinar-plano-cards'

interface CortesiaPlanoAvisoProps {
	expiresAt: string
	preselectedSlug?: PlanSlug
}

export function CortesiaPlanoAviso({
	expiresAt,
	preselectedSlug,
}: CortesiaPlanoAvisoProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 text-xs text-muted-foreground">
				<CalendarClock className="size-3.5 shrink-0" />
				<span>
					Cortesia válida até{' '}
					<strong className="text-foreground">{formatDate(expiresAt)}</strong>.
					Depois disso, sua conta volta para o plano gratuito, sem nenhuma
					cobrança.
				</span>
			</div>

			<div className="flex gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-foreground">
				<Info className="size-4 shrink-0 text-info" />
				<p>
					Quer continuar depois da cortesia? Você pode assinar quando quiser. Ao
					assinar, a cobrança começa no dia da assinatura e ela passa a valer no
					lugar da cortesia.
				</p>
			</div>

			<AssinarPlanoCards preselectedSlug={preselectedSlug} />
		</div>
	)
}
