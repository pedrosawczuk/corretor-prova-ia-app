import * as React from 'react'
import {
	type PlanSlug,
	useBillingStatus,
	useCreateCheckout,
} from '@/hooks/use-billing'
import { toastApiError } from '@/lib/api-error-handler'

export function useStartCheckout() {
	const { data: billingStatus } = useBillingStatus()
	const createCheckout = useCreateCheckout()
	const [documentPlanSlug, setDocumentPlanSlug] =
		React.useState<PlanSlug | null>(null)

	function checkout(planSlug: PlanSlug, cpfCnpj?: string) {
		createCheckout.mutate(
			{ planSlug, cpfCnpj },
			{
				onSuccess: (data) => {
					window.location.href = data.checkoutUrl
				},
				onError: (error) => {
					createCheckout.reset()
					toastApiError(
						error,
						'Não foi possível iniciar o checkout. Tente novamente.',
					)
				},
			},
		)
	}

	function startCheckout(planSlug: PlanSlug) {
		if (billingStatus?.hasBillingCustomer) {
			checkout(planSlug)
			return
		}

		setDocumentPlanSlug(planSlug)
	}

	return {
		startCheckout,
		isPending: createCheckout.isPending,
		pendingPlanSlug: createCheckout.isPending
			? createCheckout.variables?.planSlug
			: undefined,
		dialogProps: {
			open: documentPlanSlug !== null,
			onOpenChange: (open: boolean) => {
				if (!open) {
					setDocumentPlanSlug(null)
				}
			},
			onSubmit: (cpfCnpj: string) => {
				if (documentPlanSlug) {
					checkout(documentPlanSlug, cpfCnpj)
				}
			},
			isPending: createCheckout.isPending,
		},
	}
}
