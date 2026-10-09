type DatabaseUrlInput = {
	NODE_ENV: 'dev' | 'prod' | 'test'
	DATABASE_URL: string
	TEST_DATABASE_URL?: string
}

export function getDatabaseName(url: string) {
	return decodeURIComponent(new URL(url).pathname.replace(/^\//, ''))
}

export function resolveDatabaseUrl(input: DatabaseUrlInput) {
	if (input.NODE_ENV !== 'test') {
		return input.DATABASE_URL
	}

	if (!input.TEST_DATABASE_URL) {
		throw new Error(
			'TEST_DATABASE_URL não definida. Com NODE_ENV=test é obrigatório configurar TEST_DATABASE_URL no .env apontando para um banco separado cujo nome termine em "_test" (ex.: postgresql://postgres:postgres@localhost:5432/corretor_prova_test).',
		)
	}

	if (input.TEST_DATABASE_URL === input.DATABASE_URL) {
		throw new Error(
			'TEST_DATABASE_URL não pode ser igual a DATABASE_URL. Configure no .env um banco de testes separado cujo nome termine em "_test".',
		)
	}

	const databaseName = getDatabaseName(input.TEST_DATABASE_URL)

	if (!databaseName.endsWith('_test')) {
		throw new Error(
			`O banco de testes "${databaseName}" não termina em "_test". Ajuste TEST_DATABASE_URL no .env para um banco dedicado a testes (ex.: corretor_prova_test).`,
		)
	}

	return input.TEST_DATABASE_URL
}
