import dayjs from '@app/dayjs'
import type { AccessGrantReminderKind } from './access-grant-constants'

export function buildAccessGrantReminderCopy(
	kind: AccessGrantReminderKind,
	expiresAt: Date,
) {
	const expiresAtLabel = dayjs(expiresAt).format('DD/MM/YYYY')

	if (kind === '30_days') {
		return {
			subject: 'Falta 1 mês para sua cortesia do Pro acabar',
			title: 'Sua cortesia do Pro termina em 1 mês',
			message: `Seu acesso gratuito ao plano Pro vai até ${expiresAtLabel}. Aproveite para corrigir suas provas com a IA e, se quiser continuar depois disso, você pode assinar quando preferir.`,
			buttonLabel: 'Ver planos',
		}
	}

	if (kind === '7_days') {
		return {
			subject: 'Faltam 7 dias para sua cortesia do Pro acabar',
			title: 'Faltam 7 dias de Pro grátis',
			message: `Sua cortesia termina em ${expiresAtLabel}. Depois disso, as correções do plano Pro e a exportação em DOCX deixam de estar disponíveis. Assine para continuar sem interrupção.`,
			buttonLabel: 'Assinar o Pro',
		}
	}

	return {
		subject: 'Sua cortesia do Pro termina amanhã',
		title: 'Sua cortesia termina amanhã',
		message: `Amanhã (${expiresAtLabel}) sua conta volta para o plano gratuito. Suas turmas e provas continuam salvas. Assine agora para não perder o acesso ao Pro.`,
		buttonLabel: 'Assinar agora',
	}
}
