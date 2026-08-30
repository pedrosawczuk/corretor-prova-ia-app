import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'

export interface AdminAuditLog {
	id: string
	requestId: string
	actorId: string | null
	actorEmail: string | null
	action: string
	resourceType: string | null
	resourceId: string | null
	outcome: 'success' | 'failure'
	errorMessage: string | null
	httpMethod: string
	httpPath: string
	responseStatusCode: number
	ipAddress: string | null
	userAgent: string | null
	createdAt: string
}

export interface AdminOverview {
	totalUsers: number
	totalClassrooms: number
	totalExams: number
	activeSessionsUsers: number
	twoFactorEnabledUsers: number
	recentAuditLogs: AdminAuditLog[]
}

export interface AdminUser {
	id: string
	name: string
	email: string
	role: string | null
	banned: boolean
	emailVerified: boolean
	twoFactorEnabled: boolean
	createdAt: string
	classroomsCount: number
	examsCount: number
	lastSeenAt: string | null
}

export interface AdminSession {
	id: string
	userId: string
	userName: string
	userEmail: string
	ipAddress: string | null
	userAgent: string | null
	createdAt: string
	updatedAt: string
	expiresAt: string
	isActive: boolean
}

const adminKeys = {
	overview: ['admin', 'overview'] as const,
	users: ['admin', 'users'] as const,
	sessions: ['admin', 'sessions'] as const,
	auditLogs: ['admin', 'audit-logs'] as const,
}

export function useAdminOverview() {
	return useQuery({
		queryKey: adminKeys.overview,
		queryFn: () => apiClient<AdminOverview>('/admin/overview'),
	})
}

export function useAdminUsers() {
	return useQuery({
		queryKey: adminKeys.users,
		queryFn: () => apiClient<AdminUser[]>('/admin/users'),
	})
}

export function useAdminSessions() {
	return useQuery({
		queryKey: adminKeys.sessions,
		queryFn: () => apiClient<AdminSession[]>('/admin/sessions'),
	})
}

export function useAdminAuditLogs() {
	return useQuery({
		queryKey: adminKeys.auditLogs,
		queryFn: () => apiClient<AdminAuditLog[]>('/admin/audit-logs'),
	})
}
