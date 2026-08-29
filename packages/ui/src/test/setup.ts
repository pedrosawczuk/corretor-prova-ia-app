import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
	cleanup()
})

class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock)

// Radix primitives (Select, Dialog) call pointer-capture and scrollIntoView
// APIs that jsdom doesn't implement.
for (const method of [
	'hasPointerCapture',
	'setPointerCapture',
	'releasePointerCapture',
] as const) {
	if (!Element.prototype[method]) {
		Element.prototype[method] = () => false
	}
}

if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = () => {}
}

// sonner checks prefers-reduced-motion via matchMedia, which jsdom lacks.
if (!window.matchMedia) {
	window.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}) as unknown as MediaQueryList
}
