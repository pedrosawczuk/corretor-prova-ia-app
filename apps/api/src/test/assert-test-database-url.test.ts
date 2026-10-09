import { describe, expect, it } from 'vitest'
import { assertTestDatabaseUrl } from '@/test/assert-test-database-url'

describe('assertTestDatabaseUrl', () => {
	it('aceita banco cujo nome termina em _test', () => {
		expect(() =>
			assertTestDatabaseUrl(
				'postgresql://postgres:postgres@localhost:5432/corretor_prova_test',
			),
		).not.toThrow()
	})

	it('rejeita banco sem o sufixo _test', () => {
		expect(() =>
			assertTestDatabaseUrl(
				'postgresql://postgres:postgres@localhost:5432/corretor_prova_db',
			),
		).toThrow(/_test/)
	})

	it('rejeita banco que só contém _test no meio do nome', () => {
		expect(() =>
			assertTestDatabaseUrl(
				'postgresql://postgres:postgres@localhost:5432/corretor_test_db',
			),
		).toThrow(/_test/)
	})
})
