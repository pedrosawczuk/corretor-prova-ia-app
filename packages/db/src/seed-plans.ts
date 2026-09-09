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
					abacatepayProductId: dbEnv.ABACATEPAY_PRODUCT_ID_AVULSO,
					monthlyCorrectionsLimit: null,
					creditsGranted: 10,
					allowsDocxExport: false,
				},
				{
					slug: 'essencial',
					name: 'Essencial',
					billingType: 'recurring',
					priceCents: 3990,
					abacatepayProductId: dbEnv.ABACATEPAY_PRODUCT_ID_ESSENCIAL,
					monthlyCorrectionsLimit: 100,
					creditsGranted: null,
					allowsDocxExport: false,
				},
				{
					slug: 'pro',
					name: 'Pro',
					billingType: 'recurring',
					priceCents: 9990,
					abacatepayProductId: dbEnv.ABACATEPAY_PRODUCT_ID_PRO,
					monthlyCorrectionsLimit: 500,
					creditsGranted: null,
					allowsDocxExport: true,
				},
			])
			.onConflictDoUpdate({
				target: plansTable.slug,
				set: {
					abacatepayProductId: sql`excluded.abacatepay_product_id`,
					updatedAt: new Date(),
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
