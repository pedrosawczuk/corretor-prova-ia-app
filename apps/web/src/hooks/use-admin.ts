import { keepPreviousData, useQuery } from '@tanstack/react-query'
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

export interface AdminTopSubject {
	subject: string
	classroomsCount: number
	examsCount: number
}

export interface AdminOverview {
	totalUsers: number
	totalClassrooms: number
	totalExams: number
	totalSubjects: number
	activeSessionsUsers: number
	twoFactorEnabledUsers: number
	finalizedExams: number
	recentAuditLogs: AdminAuditLog[]
	topSubjects: AdminTopSubject[]
	examsCreatedAt: string[]
	usersCreatedAt: string[]
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

export interface PaginationMeta {
	page: number
	pageSize: number
	total: number
	totalPages: number
}

export interface AdminUsersPage {
	data: AdminUser[]
	pagination: PaginationMeta
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
	users: (page: number, pageSize: number) =>
		['admin', 'users', page, pageSize] as const,
	sessions: ['admin', 'sessions'] as const,
	auditLogs: ['admin', 'audit-logs'] as const,
}

export function useAdminOverview() {
	return useQuery({
		queryKey: adminKeys.overview,
		queryFn: () => apiClient<AdminOverview>('/admin/overview'),
	})
}

export function useAdminUsers(page = 1, pageSize = 20) {
	return useQuery({
		queryKey: adminKeys.users(page, pageSize),
		queryFn: () =>
			apiClient<AdminUsersPage>(
				`/admin/users?page=${page}&pageSize=${pageSize}`,
			),
		placeholderData: keepPreviousData,
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
