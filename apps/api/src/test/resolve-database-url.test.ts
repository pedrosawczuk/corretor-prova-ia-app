import { resolveDatabaseUrl } from '@app/env'
import { describe, expect, it } from 'vitest'

const DEV_URL =
	'postgresql://postgres:postgres@localhost:5432/corretor_prova_db'
const TEST_URL =
	'postgresql://postgres:postgres@localhost:5432/corretor_prova_test'

describe('resolveDatabaseUrl', () => {
	it('usa DATABASE_URL em dev e ignora TEST_DATABASE_URL', () => {
		expect(
			resolveDatabaseUrl({
				NODE_ENV: 'dev',
				DATABASE_URL: DEV_URL,
				TEST_DATABASE_URL: TEST_URL,
			}),
		).toBe(DEV_URL)
	})

	it('usa DATABASE_URL em prod mesmo sem TEST_DATABASE_URL', () => {
		expect(
			resolveDatabaseUrl({ NODE_ENV: 'prod', DATABASE_URL: DEV_URL }),
		).toBe(DEV_URL)
	})

	it('usa TEST_DATABASE_URL quando NODE_ENV é test', () => {
		expect(
			resolveDatabaseUrl({
				NODE_ENV: 'test',
				DATABASE_URL: DEV_URL,
				TEST_DATABASE_URL: TEST_URL,
			}),
		).toBe(TEST_URL)
	})

	it('lança erro quando NODE_ENV é test e TEST_DATABASE_URL está ausente', () => {
		expect(() =>
			resolveDatabaseUrl({ NODE_ENV: 'test', DATABASE_URL: DEV_URL }),
		).toThrow(/TEST_DATABASE_URL não definida/)
	})

	it('lança erro quando TEST_DATABASE_URL é igual a DATABASE_URL', () => {
		expect(() =>
			resolveDatabaseUrl({
				NODE_ENV: 'test',
				DATABASE_URL: DEV_URL,
				TEST_DATABASE_URL: DEV_URL,
			}),
		).toThrow(/não pode ser igual a DATABASE_URL/)
	})

	it('lança erro quando o nome do banco de teste não termina em _test', () => {
		expect(() =>
			resolveDatabaseUrl({
				NODE_ENV: 'test',
				DATABASE_URL: DEV_URL,
				TEST_DATABASE_URL:
					'postgresql://postgres:postgres@localhost:5432/corretor_prova_tests',
			}),
		).toThrow(/não termina em "_test"/)
	})
})
