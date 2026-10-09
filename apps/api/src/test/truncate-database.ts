import { client } from '@app/db'
import { dbEnv } from '@app/env'
import { assertTestDatabaseUrl } from '@/test/assert-test-database-url'

export async function truncateDatabase() {
	assertTestDatabaseUrl(dbEnv.DATABASE_URL)

	const tables = await client<{ tablename: string }[]>`
		select tablename from pg_tables where schemaname = 'public'
	`

	if (tables.length === 0) {
		return
	}

	const tableList = tables
		.map(({ tablename }) => `"public"."${tablename.replaceAll('"', '""')}"`)
		.join(', ')

	await client.unsafe(`truncate table ${tableList} restart identity cascade`)
}
