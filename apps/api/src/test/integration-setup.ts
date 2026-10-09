import '@/test/mock-external-services'
import { client } from '@app/db'
import { afterAll, beforeEach, vi } from 'vitest'
import { truncateDatabase } from '@/test/truncate-database'

beforeEach(async () => {
	vi.clearAllMocks()
	await truncateDatabase()
})

afterAll(async () => {
	await client.end()
})
