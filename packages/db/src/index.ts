import { dbEnv } from '@app/env'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

const connectionString = dbEnv.DATABASE_URL
export const client = postgres(connectionString, {
	max: process.env.NODE_ENV === 'prod' ? 50 : 10,
})

export const db = drizzle(client, { schema })

export * from 'drizzle-orm'
export * from './schema'
