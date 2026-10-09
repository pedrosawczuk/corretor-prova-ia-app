export function assertTestDatabaseUrl(url: string) {
	const databaseName = decodeURIComponent(
		new URL(url).pathname.replace(/^\//, ''),
	)

	if (!databaseName.endsWith('_test')) {
		throw new Error(
			`Recusando usar o banco "${databaseName}" nos testes de integração: o nome precisa terminar em "_test". Ajuste TEST_DATABASE_URL no .env.`,
		)
	}
}
