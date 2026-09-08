'use client'

import { Badge, Button, Card, CardContent, CardHeader } from '@app/ui'
import { CreditCard } from 'lucide-react'
import type { PlanSlug } from '@/hooks/use-billing'
import { useCreateCheckout } from '@/hooks/use-billing'
import { toastApiError } from '@/lib/api-error-handler'

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
	const createCheckout = useCreateCheckout()

	function handleSelect(slug: PlanSlug) {
		createCheckout.mutate(slug, {
			onSuccess: (data) => {
				window.location.href = data.checkoutUrl
			},
			onError: (error) => {
				toastApiError(
					error,
					'Não foi possível iniciar o checkout. Tente novamente.',
				)
			},
		})
	}

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
			{PLAN_OPTIONS.map((plan) => {
				const isPending =
					createCheckout.isPending && createCheckout.variables === plan.slug
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
								isLoading={isPending}
								disabled={createCheckout.isPending && !isPending}
								leftIcon={<CreditCard className="size-3.5" />}
								onClick={() => handleSelect(plan.slug)}
							>
								{plan.slug === 'avulso' ? 'Comprar' : 'Assinar'}
							</Button>
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}
