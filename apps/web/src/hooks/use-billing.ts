import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type PlanSlug = 'avulso' | 'essencial' | 'pro'
export type RecurringPlanSlug = Extract<PlanSlug, 'essencial' | 'pro'>

export interface BillingPlan {
	slug: PlanSlug
	name: string
	monthlyCorrectionsLimit: number | null
	allowsDocxExport: boolean
}

export interface BillingStatus {
	plan: BillingPlan | null
	subscriptionStatus: 'active' | 'past_due' | 'canceled' | null
	currentPeriodEnd: string | null
	cancelAtPeriodEnd: boolean
	correctionsUsed: number
	creditBalance: number
}

interface CheckoutResponse {
	checkoutUrl: string
}

interface ChangePlanResponse {
	checkoutUrl?: string
	pendingPlanSlug?: RecurringPlanSlug | null
	effectiveAt?: string
}

interface CancelSubscriptionResponse {
	cancelAtPeriodEnd: boolean
	currentPeriodEnd: string
}

const billingKeys = {
	status: ['billing', 'status'] as const,
}

export function useBillingStatus(options?: {
	refetchInterval?: number | false
}) {
	return useQuery({
		queryKey: billingKeys.status,
		queryFn: () => apiClient<BillingStatus>('/billing/status'),
		refetchInterval: options?.refetchInterval,
	})
}

export function useCreateCheckout() {
	return useMutation({
		mutationFn: (planSlug: PlanSlug) =>
			apiClient<CheckoutResponse>('/billing/checkout', {
				method: 'POST',
				body: JSON.stringify({ planSlug }),
			}),
	})
}

export function useChangePlan() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: ({
			planSlug,
			immediate,
		}: {
			planSlug: RecurringPlanSlug
			immediate?: boolean
		}) =>
			apiClient<ChangePlanResponse>('/billing/change-plan', {
				method: 'POST',
				body: JSON.stringify({ planSlug, immediate }),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: billingKeys.status })
		},
	})
}

export function useCancelSubscription() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: () =>
			apiClient<CancelSubscriptionResponse>('/billing/cancel', {
				method: 'POST',
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: billingKeys.status })
		},
	})
}
