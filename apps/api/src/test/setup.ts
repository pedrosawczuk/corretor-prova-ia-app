import '@/test/mock-external-services'
import { beforeEach, vi } from 'vitest'
import {
	sendNewLoginEmail,
	sendPasswordResetEmail,
	sendPaymentFailedEmail,
	sendSubscriptionCancelledEmail,
	sendWelcomeEmail,
} from '@/lib/mail/mail'

vi.mock('@app/db', () => ({
	accessGrantRemindersTable: {},
	accessGrantsTable: {},
	billingCustomersTable: {},
	billingEventsTable: {},
	classroomsTable: {},
	correctionCreditsTable: {},
	correctionUsageLogsTable: {},
	examsTable: {},
	invitesTable: {},
	plansTable: {},
	privilegedEmailsTable: {},
	questionsTable: {},
	questionOptionsTable: {},
	subjectsTable: {},
	submissionsTable: {},
	submissionPagesTable: {},
	submissionAnswersTable: {},
	subscriptionsTable: {},
	user: {},
	db: {
		delete: vi.fn(),
		insert: vi.fn(),
		select: vi.fn(),
		transaction: vi.fn(),
		update: vi.fn(),
	},
	and: vi.fn(),
	asc: vi.fn(),
	count: vi.fn(),
	desc: vi.fn(),
	eq: vi.fn(),
	gt: vi.fn(),
	gte: vi.fn(),
	inArray: vi.fn(),
	isNotNull: vi.fn(),
	isNull: vi.fn(),
	lte: vi.fn(),
	ne: vi.fn(),
	sql: vi.fn(),
}))

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(sendWelcomeEmail).mockResolvedValue(undefined)
	vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined)
	vi.mocked(sendNewLoginEmail).mockResolvedValue(undefined)
	vi.mocked(sendPaymentFailedEmail).mockResolvedValue(undefined)
	vi.mocked(sendSubscriptionCancelledEmail).mockResolvedValue(undefined)
})
