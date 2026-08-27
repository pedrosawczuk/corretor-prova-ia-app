import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../lib/utils'

const skeletonVariants = cva(
	'relative overflow-hidden select-none pointer-events-none',
	{
		variants: {
			animation: {
				pulse: 'animate-pulse bg-muted',
				shimmer:
					'bg-muted after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/20 dark:after:via-white/10 after:to-transparent',
				none: 'bg-muted',
			},
			shape: {
				default: 'rounded-lg',
				sm: 'rounded-md',
				circle: 'rounded-full',
				square: 'rounded-none',
			},
			variant: {
				default: 'bg-muted/80',
				subtle: 'bg-muted/40',
				card: 'bg-card border border-border/60',
				primary: 'bg-primary/10',
			},
		},
		defaultVariants: {
			animation: 'pulse',
			shape: 'default',
			variant: 'default',
		},
	},
)

export interface SkeletonProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof skeletonVariants> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
	({ className, animation, shape, variant, ...props }, ref) => {
		return (
			<div
				ref={ref}
				aria-hidden="true"
				aria-busy="true"
				className={cn(
					skeletonVariants({ animation, shape, variant }),
					className,
				)}
				{...props}
			/>
		)
	},
)

Skeleton.displayName = 'Skeleton'

export { Skeleton, skeletonVariants }
