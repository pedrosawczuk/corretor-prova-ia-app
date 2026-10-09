import { dbEnv } from '@app/env'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { plansTable } from './schema/plans'

async function runSeed() {
	console.log('⏳ Iniciando seed dos planos...')

	const connection = postgres(dbEnv.DATABASE_URL, { max: 1 })
	const db = drizzle(connection)

	try {
		await db
			.insert(plansTable)
			.values([
				{
					slug: 'avulso',
					name: 'Avulso',
					billingType: 'one_time',
					priceCents: 1990,
					monthlyCorrectionsLimit: null,
					creditsGranted: 10,
					allowsDocxExport: false,
				},
				{
					slug: 'essencial',
					name: 'Essencial',
					billingType: 'recurring',
					priceCents: 3990,
					monthlyCorrectionsLimit: 100,
					creditsGranted: null,
					allowsDocxExport: false,
				},
				{
					slug: 'pro',
					name: 'Pro',
					billingType: 'recurring',
					priceCents: 9990,
					monthlyCorrectionsLimit: 500,
					creditsGranted: null,
					allowsDocxExport: true,
				},
			])
			.onConflictDoUpdate({
				target: plansTable.slug,
				set: {
					name: sql`excluded.name`,
					priceCents: sql`excluded.price_cents`,
					monthlyCorrectionsLimit: sql`excluded.monthly_corrections_limit`,
					creditsGranted: sql`excluded.credits_granted`,
					allowsDocxExport: sql`excluded.allows_docx_export`,
					updatedAt: sql`excluded.updated_at`,
				},
			})

		console.log('✅ Seed dos planos concluído com sucesso!')
	} catch (error) {
		console.error('❌ Erro executando seed dos planos:', error)
		process.exit(1)
	} finally {
		await connection.end()
	}
}

runSeed()
