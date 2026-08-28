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
	const chain: Record<string, unknown> = {}

	for (const method of CHAIN_METHODS) {
		chain[method] = vi.fn(() => chain)
	}

	chain.then = (
		onFulfilled: (value: unknown) => unknown,
		onRejected?: (reason: unknown) => unknown,
	) => Promise.resolve(result).then(onFulfilled, onRejected)

	chain.catch = (onRejected: (reason: unknown) => unknown) =>
		Promise.resolve(result).catch(onRejected)

	return chain
}

export function createDbTransactionMock(tx: unknown) {
	return async (callback: (tx: unknown) => unknown) => callback(tx)
}
