'use client'

import { Badge, Button, Card, CardContent, CardHeader } from '@app/ui'
import { CreditCard } from 'lucide-react'
import type { PlanSlug } from '@/hooks/use-billing'
import { useStartCheckout } from '@/hooks/use-start-checkout'
import { InformarDocumentoDialog } from './informar-documento-dialog'

interface PlanOption {
	slug: PlanSlug
	name: string
	price: string
	period: string
	description: string
	highlight?: boolean
}

const PLAN_OPTIONS: PlanOption[] = [
	{
		slug: 'avulso',
		name: 'Avulso',
		price: 'R$ 19,90',
		period: 'pacote de 10 correções',
		description: 'Cobrança única, sem assinatura.',
	},
	{
		slug: 'essencial',
		name: 'Essencial',
		price: 'R$ 39,90',
		period: 'por mês · 100 correções',
		description: 'Assinatura mensal, cancele quando quiser.',
		highlight: true,
	},
	{
		slug: 'pro',
		name: 'Pro',
		price: 'R$ 99,90',
		period: 'por mês · 500 correções',
		description: 'Assinatura mensal com exportação em DOCX.',
	},
]

interface AssinarPlanoCardsProps {
	preselectedSlug?: PlanSlug
}

export function AssinarPlanoCards({ preselectedSlug }: AssinarPlanoCardsProps) {
	const { startCheckout, isPending, pendingPlanSlug, dialogProps } =
		useStartCheckout()

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
			{PLAN_OPTIONS.map((plan) => {
				const isPlanPending = pendingPlanSlug === plan.slug
				const isPreselected = preselectedSlug === plan.slug

				return (
					<Card
						key={plan.slug}
						variant={plan.highlight || isPreselected ? 'primary' : 'default'}
						padding="sm"
						className="flex flex-col"
					>
						<CardHeader className="space-y-1.5 pb-1">
							<div className="flex items-center justify-between gap-2">
								<span className="text-sm font-bold text-foreground">
									{plan.name}
								</span>
								{plan.highlight && (
									<Badge variant="primary" size="xs">
										Popular
									</Badge>
								)}
							</div>
							<p className="text-xs text-muted-foreground">
								{plan.description}
							</p>
						</CardHeader>
						<CardContent className="flex flex-1 flex-col justify-between gap-3 pt-1">
							<div>
								<span className="text-xl font-extrabold text-foreground">
									{plan.price}
								</span>
								<p className="text-[11px] text-muted-foreground">
									{plan.period}
								</p>
							</div>
							<Button
								size="sm"
								fullWidth
								variant={plan.highlight ? 'default' : 'outline'}
								isLoading={isPlanPending}
								disabled={isPending && !isPlanPending}
								leftIcon={<CreditCard className="size-3.5" />}
								onClick={() => startCheckout(plan.slug)}
							>
								{plan.slug === 'avulso' ? 'Comprar' : 'Assinar'}
							</Button>
						</CardContent>
					</Card>
				)
			})}
			<InformarDocumentoDialog {...dialogProps} />
		</div>
	)
}
