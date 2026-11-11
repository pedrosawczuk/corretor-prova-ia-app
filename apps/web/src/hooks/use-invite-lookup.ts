import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type InviteLookup =
	| {
			status: 'pending'
			email: string
			hasAccount: boolean
			grantDurationMonths: number
			expiresAt: string
	  }
	| { status: 'accepted' | 'expired' | 'revoked' | 'not_found' }

export function useInviteLookup(token: string) {
	return useQuery({
		queryKey: ['invites', 'lookup', token],
		queryFn: () =>
			apiClient<InviteLookup>('/invites/lookup', {
				method: 'POST',
				body: JSON.stringify({ token }),
			}),
		retry: false,
		staleTime: Number.POSITIVE_INFINITY,
	})
}
