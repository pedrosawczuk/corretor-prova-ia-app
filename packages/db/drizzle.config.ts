import { dbEnv } from '@app/env'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
	schema: './src/schema/index.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: dbEnv.DATABASE_URL,
	},
})
