import { auditLogsTable, db } from '@app/db'

type AuditOutcome = 'success' | 'failure'

export type AuditLogEntry = {
	requestId: string
	actorId?: string | null
	actorEmail?: string | null
	sessionId?: string | null
	action: string
	resourceType?: string | null
	resourceId?: string | null
	outcome: AuditOutcome
	errorMessage?: string | null
	httpMethod: string
	httpPath: string
	requestPayload?: unknown
	responseStatusCode: number
	changes?: unknown
	metadata?: unknown
	ipAddress?: string | null
	userAgent?: string | null
	durationMs?: number | null
}

export async function recordAuditLog(entry: AuditLogEntry) {
	try {
		await db.insert(auditLogsTable).values(entry)
	} catch (error) {
		console.error('Failed to record audit log', error)
	}
}
