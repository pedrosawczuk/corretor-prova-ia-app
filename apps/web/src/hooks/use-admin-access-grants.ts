import type {
	CreateInviteInput,
	CreatePrivilegedEmailInput,
} from '@app/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked'
export type AccessGrantStatus = 'active' | 'expired' | 'revoked'
export type AccessGrantSource = 'invite' | 'privileged_email'

export interface AdminInvite {
	id: string
	email: string
	status: InviteStatus
	expiresAt: string
	acceptedAt: string | null
	revokedAt: string | null
	createdAt: string
}

export interface AdminPrivilegedEmail {
	id: string
	email: string
	note: string | null
	createdAt: string
	claimedAt: string | null
}

export interface AdminAccessGrant {
	id: string
	source: AccessGrantSource
	status: AccessGrantStatus
	startsAt: string
	expiresAt: string
	revokedAt: string | null
	userName: string
	userEmail: string
	planName: string
}

interface ListResponse<T> {
	data: T[]
}

const adminAccessGrantKeys = {
	invites: ['admin', 'invites'] as const,
	privilegedEmails: ['admin', 'privileged-emails'] as const,
	accessGrants: ['admin', 'access-grants'] as const,
}

export function useAdminInvites() {
	return useQuery({
		queryKey: adminAccessGrantKeys.invites,
		queryFn: () => apiClient<ListResponse<AdminInvite>>('/admin/invites'),
	})
}

export function useCreateInvite() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreateInviteInput) =>
			apiClient<AdminInvite>('/admin/invites', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminAccessGrantKeys.invites })
		},
	})
}

export function useResendInvite() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) =>
			apiClient<AdminInvite>(`/admin/invites/${id}/resend`, {
				method: 'POST',
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminAccessGrantKeys.invites })
		},
	})
}

export function useRevokeInvite() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) =>
			apiClient<void>(`/admin/invites/${id}`, { method: 'DELETE' }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminAccessGrantKeys.invites })
		},
	})
}

export function useAdminPrivilegedEmails() {
	return useQuery({
		queryKey: adminAccessGrantKeys.privilegedEmails,
		queryFn: () =>
			apiClient<ListResponse<AdminPrivilegedEmail>>('/admin/privileged-emails'),
	})
}

export function useCreatePrivilegedEmail() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: CreatePrivilegedEmailInput) =>
			apiClient<AdminPrivilegedEmail>('/admin/privileged-emails', {
				method: 'POST',
				body: JSON.stringify(data),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: adminAccessGrantKeys.privilegedEmails,
			})
		},
	})
}

export function useDeletePrivilegedEmail() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) =>
			apiClient<void>(`/admin/privileged-emails/${id}`, { method: 'DELETE' }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: adminAccessGrantKeys.privilegedEmails,
			})
		},
	})
}

export function useAdminAccessGrants() {
	return useQuery({
		queryKey: adminAccessGrantKeys.accessGrants,
		queryFn: () =>
			apiClient<ListResponse<AdminAccessGrant>>('/admin/access-grants'),
	})
}

export function useRevokeAccessGrant() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (id: string) =>
			apiClient<void>(`/admin/access-grants/${id}/revoke`, { method: 'POST' }),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: adminAccessGrantKeys.accessGrants,
			})
		},
	})
}
