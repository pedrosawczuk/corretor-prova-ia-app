import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button } from './button'

export type PaginationRangeItem = number | 'ellipsis-start' | 'ellipsis-end'

function range(start: number, end: number): number[] {
	return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function getPaginationRange(
	page: number,
	totalPages: number,
	siblingCount = 1,
): PaginationRangeItem[] {
	const totalVisiblePages = siblingCount * 2 + 5

	if (totalVisiblePages >= totalPages) {
		return range(1, totalPages)
	}

	const leftSiblingIndex = Math.max(page - siblingCount, 1)
	const rightSiblingIndex = Math.min(page + siblingCount, totalPages)

	const showLeftEllipsis = leftSiblingIndex > 2
	const showRightEllipsis = rightSiblingIndex < totalPages - 1

	if (!showLeftEllipsis && showRightEllipsis) {
		return [...range(1, 3 + siblingCount * 2), 'ellipsis-end', totalPages]
	}

	if (showLeftEllipsis && !showRightEllipsis) {
		return [
			1,
			'ellipsis-start',
			...range(totalPages - (3 + siblingCount * 2) + 1, totalPages),
		]
	}

	return [
		1,
		'ellipsis-start',
		...range(leftSiblingIndex, rightSiblingIndex),
		'ellipsis-end',
		totalPages,
	]
}

export interface PaginationProps {
	page: number
	totalPages: number
	onPageChange: (page: number) => void
	siblingCount?: number
	className?: string
}

export function Pagination({
	page,
	totalPages,
	onPageChange,
	siblingCount = 1,
	className,
}: PaginationProps) {
	if (totalPages <= 1) {
		return null
	}

	const rangeItems = getPaginationRange(page, totalPages, siblingCount)

	return (
		<nav
			aria-label="Paginação"
			className={cn('flex items-center justify-center gap-1', className)}
		>
			<Button
				type="button"
				variant="outline"
				size="icon-sm"
				disabled={page <= 1}
				onClick={() => onPageChange(page - 1)}
				aria-label="Página anterior"
			>
				<ChevronLeft />
			</Button>

			{rangeItems.map((item) =>
				typeof item === 'number' ? (
					<Button
						key={item}
						type="button"
						variant={item === page ? 'default' : 'ghost'}
						size="icon-sm"
						onClick={() => onPageChange(item)}
						aria-current={item === page ? 'page' : undefined}
					>
						{item}
					</Button>
				) : (
					<span
						key={item}
						className="flex size-8 items-center justify-center text-sm text-muted-foreground"
					>
						…
					</span>
				),
			)}

			<Button
				type="button"
				variant="outline"
				size="icon-sm"
				disabled={page >= totalPages}
				onClick={() => onPageChange(page + 1)}
				aria-label="Próxima página"
			>
				<ChevronRight />
			</Button>
		</nav>
	)
}
