import { describe, expect, it } from 'vitest'
import { resolveAccessGrantUsagePeriod } from './resolve-access-grant-usage-period'

const grant = {
	startsAt: new Date('2026-01-10T12:00:00Z'),
	expiresAt: new Date('2026-04-10T12:00:00Z'),
}

describe('resolveAccessGrantUsagePeriod', () => {
	it('retorna o primeiro mês da cortesia logo após o início', () => {
		const period = resolveAccessGrantUsagePeriod(
			grant,
			new Date('2026-01-20T12:00:00Z'),
		)

		expect(period).toEqual({
			start: new Date('2026-01-10T12:00:00Z'),
			end: new Date('2026-02-10T12:00:00Z'),
		})
	})

	it('avança a janela mensal conforme os meses passam', () => {
		const period = resolveAccessGrantUsagePeriod(
			grant,
			new Date('2026-02-15T12:00:00Z'),
		)

		expect(period).toEqual({
			start: new Date('2026-02-10T12:00:00Z'),
			end: new Date('2026-03-10T12:00:00Z'),
		})
	})

	it('limita o fim da janela à data de expiração da cortesia', () => {
		const period = resolveAccessGrantUsagePeriod(
			{ ...grant, expiresAt: new Date('2026-03-01T12:00:00Z') },
			new Date('2026-02-15T12:00:00Z'),
		)

		expect(period.end).toEqual(new Date('2026-03-01T12:00:00Z'))
	})
})
