import {
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core'

export const auditOutcomeEnum = pgEnum('audit_outcome', ['success', 'failure'])

export const auditLogsTable = pgTable(
	'audit_logs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		requestId: text('request_id').notNull(),

		actorId: text('actor_id'),
		actorEmail: text('actor_email'),
		sessionId: text('session_id'),

		action: text('action').notNull(),
		resourceType: text('resource_type'),
		resourceId: text('resource_id'),
		outcome: auditOutcomeEnum('outcome').notNull(),
		errorMessage: text('error_message'),

		httpMethod: text('http_method').notNull(),
		httpPath: text('http_path').notNull(),
		requestPayload: jsonb('request_payload'),
		responseStatusCode: integer('response_status_code').notNull(),

		changes: jsonb('changes'),
		metadata: jsonb('metadata'),

		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		durationMs: integer('duration_ms'),

		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [
		index('audit_logs_request_id_idx').on(table.requestId),
		index('audit_logs_actor_id_idx').on(table.actorId),
		index('audit_logs_action_idx').on(table.action),
		index('audit_logs_resource_idx').on(table.resourceType, table.resourceId),
		index('audit_logs_created_at_idx').on(table.createdAt),
	],
)
