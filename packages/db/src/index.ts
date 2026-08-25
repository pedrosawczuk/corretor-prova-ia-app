import { dbEnv } from '@app/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const connectionString = dbEnv.DATABASE_URL
const client = postgres(connectionString, {
	max: dbEnv.DATABASE_URL.includes('localhost') ? 1 : undefined,
})

export const db = drizzle(client, { schema })

export * from './schema'
