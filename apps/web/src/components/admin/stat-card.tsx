import { Card, CardContent, Skeleton } from '@app/ui'
import type { ElementType, ReactNode } from 'react'

interface StatCardProps {
	icon: ElementType
	iconStyle: string
	value: ReactNode
	label: string
	isLoading: boolean
}

export function StatCard({
	icon: Icon,
	iconStyle,
	value,
	label,
	isLoading,
}: StatCardProps) {
	return (
		<Card>
			<CardContent className="flex items-center gap-3 pt-4 sm:pt-6">
				<div
					className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${iconStyle}`}
				>
					<Icon className="size-5" />
				</div>
				<div>
					{isLoading ? (
						<Skeleton className="h-7 w-10" />
					) : (
						<p className="text-2xl font-bold tracking-tight text-foreground">
							{value}
						</p>
					)}
					<p className="text-xs text-muted-foreground">{label}</p>
				</div>
			</CardContent>
		</Card>
	)
}
