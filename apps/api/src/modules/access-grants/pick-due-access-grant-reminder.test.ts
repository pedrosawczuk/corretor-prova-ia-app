import { describe, expect, it } from 'vitest'
import { pickDueAccessGrantReminder } from './pick-due-access-grant-reminder'

const DAY_MS = 1000 * 60 * 60 * 24
const now = new Date('2026-11-09T12:00:00Z')

function expiresIn(days: number) {
	return new Date(now.getTime() + days * DAY_MS)
}

describe('pickDueAccessGrantReminder', () => {
	it('não envia nada quando faltam mais de 30 dias', () => {
		expect(pickDueAccessGrantReminder(expiresIn(31), [], now)).toBeNull()
	})

	it('envia o lembrete de 30 dias quando entra na janela', () => {
		expect(pickDueAccessGrantReminder(expiresIn(29.9), [], now)).toEqual({
			kind: '30_days',
			kindsToMark: ['30_days'],
		})
	})

	it('envia o de 7 dias quando o de 30 já foi enviado', () => {
		expect(
			pickDueAccessGrantReminder(expiresIn(6), ['30_days'], now),
		).toEqual({ kind: '7_days', kindsToMark: ['30_days', '7_days'] })
	})

	it('envia só o mais urgente quando vários lembretes ficaram para trás', () => {
		expect(pickDueAccessGrantReminder(expiresIn(0.5), [], now)).toEqual({
			kind: '1_day',
			kindsToMark: ['30_days', '7_days', '1_day'],
		})
	})

	it('não repete um lembrete já enviado', () => {
		expect(
			pickDueAccessGrantReminder(expiresIn(5), ['30_days', '7_days'], now),
		).toBeNull()
	})

	it('não envia depois que a cortesia venceu', () => {
		expect(pickDueAccessGrantReminder(expiresIn(-1), [], now)).toBeNull()
	})
})
