import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
	it('joins truthy class names', () => {
		expect(cn('foo', 'bar')).toBe('foo bar')
	})

	it('drops falsy values', () => {
		expect(cn('foo', false && 'bar', undefined, null, '')).toBe('foo')
	})

	it('merges conflicting tailwind classes, keeping the last one', () => {
		expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
	})

	it('resolves conflicts introduced via conditional objects', () => {
		expect(cn('text-sm', { 'text-lg': true, 'text-red-500': false })).toBe(
			'text-lg',
		)
	})
})
