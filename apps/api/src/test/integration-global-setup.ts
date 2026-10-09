import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { assertTestDatabaseUrl } from './assert-test-database-url'

const migrationsFolder = fileURLToPath(
	new URL('../../../../packages/db/drizzle', import.meta.url),
)

function toDatabaseUnavailableError(error: unknown) {
	return new Error(
		'Não foi possível conectar ao Postgres dos testes de integração. Suba o banco com "docker compose -f docker-compose.dev.yml up -d" e confira TEST_DATABASE_URL no .env.',
		{ cause: error },
	)
}

async function ensureDatabaseExists(testDatabaseUrl: string) {
	const adminUrl = new URL(testDatabaseUrl)
	const databaseName = decodeURIComponent(adminUrl.pathname.replace(/^\//, ''))
	adminUrl.pathname = '/postgres'

	const adminClient = postgres(adminUrl.toString(), {
		max: 1,
		onnotice: () => {},
	})

	try {
		const existing = await adminClient`
			select 1 from pg_database where datname = ${databaseName}
		`

		if (existing.length === 0) {
			await adminClient.unsafe(
				`create database "${databaseName.replaceAll('"', '""')}"`,
			)
		}
	} catch (error) {
		throw toDatabaseUnavailableError(error)
	} finally {
		await adminClient.end()
	}
}

async function runMigrations(testDatabaseUrl: string) {
	const migrationClient = postgres(testDatabaseUrl, {
		max: 1,
		onnotice: () => {},
	})

	try {
		await migrate(drizzle(migrationClient), { migrationsFolder })
	} finally {
		await migrationClient.end()
	}
}

export default async function setup() {
	process.env.NODE_ENV = 'test'

	const { dbEnv } = await import('@app/env')

	assertTestDatabaseUrl(dbEnv.DATABASE_URL)

	await ensureDatabaseExists(dbEnv.DATABASE_URL)
	await runMigrations(dbEnv.DATABASE_URL)
}
