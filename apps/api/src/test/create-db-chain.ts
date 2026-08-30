import { vi } from 'vitest'

const CHAIN_METHODS = [
	'from',
	'where',
	'orderBy',
	'values',
	'set',
	'returning',
] as const

export function createDbChain(result: unknown) {
	const chain = Object.assign(
		Promise.resolve(result),
		{} as Record<string, unknown>,
	)

	for (const method of CHAIN_METHODS) {
		chain[method] = vi.fn(() => chain)
	}

	return chain
}

export function createDbTransactionMock(tx: unknown) {
	return async (callback: (tx: unknown) => unknown) => callback(tx)
}
