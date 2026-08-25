import { dbEnv } from '@app/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function runMigrations() {
	console.log('⏳ Iniciando migrations...')

	const sql = postgres(dbEnv.DATABASE_URL, { max: 1 })
	const db = drizzle(sql)

	try {
		await migrate(db, { migrationsFolder: './drizzle' })
		console.log('✅ Migrations concluídas com sucesso!')
	} catch (error) {
		console.error('❌ Erro aplicando migrations:', error)
		process.exit(1)
	} finally {
		await sql.end()
	}
}

runMigrations()
