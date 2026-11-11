import dayjs from '@app/dayjs'
import { env } from '@app/env'
import { sendInviteEmail } from '@/lib/mail/mail'
import {
	ACCESS_GRANT_DURATION_MONTHS,
	INVITE_TTL_DAYS,
} from './access-grant-constants'
import { generateInviteToken, hashInviteToken } from './invite-token'

export function buildInviteCredentials(now: Date = new Date()) {
	const token = generateInviteToken()

	return {
		token,
		tokenHash: hashInviteToken(token),
		expiresAt: dayjs(now).add(INVITE_TTL_DAYS, 'day').toDate(),
	}
}

export async function deliverInviteEmail(email: string, token: string) {
	await sendInviteEmail({
		to: email,
		inviteUrl: `${env.WEB_URL}/convite/${token}`,
		grantDurationMonths: ACCESS_GRANT_DURATION_MONTHS,
		inviteExpiresInDays: INVITE_TTL_DAYS,
	})
}
