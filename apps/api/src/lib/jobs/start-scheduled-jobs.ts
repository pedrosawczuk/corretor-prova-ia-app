import { Cron } from 'croner'
import { sendAccessGrantReminders } from '@/modules/access-grants/send-access-grant-reminders'

const HOURLY = '0 * * * *'

export function startScheduledJobs() {
	return [
		new Cron(HOURLY, { name: 'access-grant-reminders', protect: true }, async () => {
			try {
				const sentCount = await sendAccessGrantReminders()
				if (sentCount > 0) {
					console.log(`[jobs] ${sentCount} lembrete(s) de cortesia enviado(s).`)
				}
			} catch (error) {
				console.error('[jobs] Falha no job de lembretes de cortesia.', error)
			}
		}),
	]
}
