'use client'

import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Skeleton,
	toast,
} from '@app/ui'
import {
	ArrowLeftRight,
	CalendarClock,
	CreditCard,
	Wallet,
	XCircle,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
import type { PlanSlug, RecurringPlanSlug } from '@/hooks/use-billing'
import { useBillingStatus, useCreateCheckout } from '@/hooks/use-billing'
import { toastApiError } from '@/lib/api-error-handler'
import { formatDate } from '@/lib/date'
import { AssinarPlanoCards } from './assinar-plano-cards'
import { CancelarAssinaturaDialog } from './cancelar-assinatura-dialog'
import { TrocarPlanoDialog } from './trocar-plano-dialog'

const STATUS_BADGE: Record<
	string,
	{ label: string; variant: 'success-outline' | 'warning-outline' }
> = {
	active: { label: 'Ativa', variant: 'success-outline' },
	past_due: { label: 'Pagamento pendente', variant: 'warning-outline' },
}

const CHECKOUT_SUCCESS_POLL_MS = 3000
const CHECKOUT_SUCCESS_POLL_TIMEOUT_MS = 30000

interface PlanoFaturamentoSectionProps {
	checkoutStatus?: 'success' | 'cancelled'
	preselectedSlug?: PlanSlug
}

export function PlanoFaturamentoSection({
	checkoutStatus,
	preselectedSlug,
}: PlanoFaturamentoSectionProps) {
	const router = useRouter()
	const pathname = usePathname()
	const [isPolling, setIsPolling] = React.useState(checkoutStatus === 'success')
	const [isTrocarOpen, setIsTrocarOpen] = React.useState(false)
	const [isCancelarOpen, setIsCancelarOpen] = React.useState(false)
	const hasShownCheckoutToastRef = React.useRef(false)

	const { data, isLoading, isError } = useBillingStatus({
		refetchInterval: isPolling ? CHECKOUT_SUCCESS_POLL_MS : false,
	})
	const createCheckout = useCreateCheckout()

	React.useEffect(() => {
		if (!checkoutStatus || hasShownCheckoutToastRef.current) return
		hasShownCheckoutToastRef.current = true

		if (checkoutStatus === 'success') {
			toast.success(
				'Pagamento em processamento. Assim que for confirmado, seu plano é atualizado automaticamente aqui.',
			)
		} else {
			toast.info('Checkout cancelado. Nenhuma cobrança foi realizada.')
		}

		router.replace(pathname)
	}, [checkoutStatus, pathname, router])

	React.useEffect(() => {
		if (!isPolling) return

		const timeout = setTimeout(
			() => setIsPolling(false),
			CHECKOUT_SUCCESS_POLL_TIMEOUT_MS,
		)
		return () => clearTimeout(timeout)
	}, [isPolling])

	function handleBuyCredits() {
		createCheckout.mutate('avulso', {
			onSuccess: (checkout) => {
				window.location.href = checkout.checkoutUrl
			},
			onError: (error) => {
				toastApiError(
					error,
					'Não foi possível iniciar o checkout. Tente novamente.',
				)
			},
		})
	}

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Plano e Faturamento</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-24 rounded-xl" />
				</CardContent>
			</Card>
		)
	}

	if (isError || !data) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="text-base">Plano e Faturamento</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Não foi possível carregar as informações do seu plano. Recarregue a
						página para tentar novamente.
					</p>
				</CardContent>
			</Card>
		)
	}

	const { plan, subscriptionStatus, currentPeriodEnd, cancelAtPeriodEnd } = data
	const statusBadge = subscriptionStatus
		? STATUS_BADGE[subscriptionStatus]
		: null
	const usagePercent =
		plan?.monthlyCorrectionsLimit && plan.monthlyCorrectionsLimit > 0
			? Math.min(
					100,
					(data.correctionsUsed / plan.monthlyCorrectionsLimit) * 100,
				)
			: 0

	return (
		<div className="flex flex-col gap-4">
			<Card>
				<CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
					<div className="flex items-center gap-3">
						<div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
							<CreditCard className="size-4.5" />
						</div>
						<div>
							<CardTitle className="text-base">Plano e Faturamento</CardTitle>
							<p className="text-xs text-muted-foreground mt-0.5">
								Seu plano atual, uso do ciclo e créditos avulsos.
							</p>
						</div>
					</div>
					{statusBadge && (
						<Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
					)}
				</CardHeader>

				<CardContent className="space-y-4">
					{plan ? (
						<>
							<div className="flex items-center justify-between gap-3">
								<span className="text-lg font-bold text-foreground">
									{plan.name}
								</span>
								{plan.monthlyCorrectionsLimit && (
									<span className="text-xs text-muted-foreground">
										{data.correctionsUsed} / {plan.monthlyCorrectionsLimit}{' '}
										correções usadas
									</span>
								)}
							</div>

							{plan.monthlyCorrectionsLimit && (
								<div
									className="h-2 w-full rounded-full bg-muted overflow-hidden"
									role="progressbar"
									aria-valuenow={usagePercent}
									aria-valuemin={0}
									aria-valuemax={100}
								>
									<div
										className="h-full rounded-full bg-primary transition-all"
										style={{ width: `${usagePercent}%` }}
									/>
								</div>
							)}

							{currentPeriodEnd && (
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<CalendarClock className="size-3.5 shrink-0" />
									{cancelAtPeriodEnd ? (
										<span>
											Cancelada — acesso mantido até{' '}
											<strong className="text-foreground">
												{formatDate(currentPeriodEnd)}
											</strong>
											, sem renovação automática.
										</span>
									) : (
										<span>
											Renova em{' '}
											<strong className="text-foreground">
												{formatDate(currentPeriodEnd)}
											</strong>
										</span>
									)}
								</div>
							)}

							{subscriptionStatus === 'past_due' && (
								<p className="text-xs text-warning bg-warning/10 border border-warning/30 rounded-lg p-3">
									Não conseguimos confirmar seu último pagamento. Regularize
									para continuar usando a cota do plano, ou use créditos avulsos
									enquanto isso.
								</p>
							)}

							{!cancelAtPeriodEnd && (
								<div className="flex flex-col gap-2 sm:flex-row pt-1">
									<Button
										variant="outline"
										size="sm"
										leftIcon={<ArrowLeftRight className="size-3.5" />}
										onClick={() => setIsTrocarOpen(true)}
									>
										Trocar de plano
									</Button>
									<Button
										variant="destructive-outline"
										size="sm"
										leftIcon={<XCircle className="size-3.5" />}
										onClick={() => setIsCancelarOpen(true)}
									>
										Cancelar assinatura
									</Button>
								</div>
							)}
						</>
					) : (
						<>
							<p className="text-sm text-muted-foreground">
								Você ainda não tem uma assinatura ativa. Escolha um plano para
								liberar correções por foto com IA todo mês, ou compre um pacote
								avulso.
							</p>
							<AssinarPlanoCards preselectedSlug={preselectedSlug} />
						</>
					)}

					<div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
						<div className="flex items-center gap-2.5">
							<Wallet className="size-4 text-muted-foreground shrink-0" />
							<div>
								<p className="text-sm font-semibold text-foreground">
									{data.creditBalance} crédito(s) avulso(s)
								</p>
								<p className="text-xs text-muted-foreground">
									Usados automaticamente quando a cota do plano acabar.
								</p>
							</div>
						</div>
						<Button
							variant="outline"
							size="sm"
							isLoading={createCheckout.isPending}
							onClick={handleBuyCredits}
						>
							Comprar créditos
						</Button>
					</div>
				</CardContent>
			</Card>

			{plan && currentPeriodEnd && (
				<>
					<TrocarPlanoDialog
						open={isTrocarOpen}
						onOpenChange={setIsTrocarOpen}
						currentPlanSlug={plan.slug as RecurringPlanSlug}
					/>
					<CancelarAssinaturaDialog
						open={isCancelarOpen}
						onOpenChange={setIsCancelarOpen}
						currentPeriodEnd={currentPeriodEnd}
					/>
				</>
			)}
		</div>
	)
}
