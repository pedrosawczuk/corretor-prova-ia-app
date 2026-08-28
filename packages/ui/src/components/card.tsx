import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../lib/utils'

const cardVariants = cva(
	'relative flex flex-col rounded-2xl border text-card-foreground transition-all duration-200 select-none',
	{
		variants: {
			variant: {
				default: 'bg-card border-border shadow-xs',
				elevated: 'bg-card border-border/80 shadow-md hover:shadow-lg',
				outline: 'bg-transparent border-border',
				primary: 'bg-card border-primary/20 shadow-xs hover:border-primary/50',
				subtle: 'bg-muted/40 border-transparent',
				glass: 'bg-card/75 backdrop-blur-md border-border/50 shadow-sm',
				dashed:
					'border-2 border-dashed border-border bg-muted/20 hover:bg-muted/30 hover:border-primary/40',
			},
			padding: {
				none: '[&>*]:p-0',
				sm: '[&>*]:p-4',
				default: '',
				lg: '[&>*]:p-8',
			},
			interactive: {
				true: 'cursor-pointer hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md motion-reduce:transform-none',
				false: '',
			},
		},
		defaultVariants: {
			variant: 'default',
			padding: 'default',
			interactive: false,
		},
	},
)

export interface CardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
	({ className, variant, padding, interactive, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(cardVariants({ variant, padding, interactive }), className)}
			{...props}
		/>
	),
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex flex-col space-y-1.5 p-4 sm:p-6', className)}
		{...props}
	/>
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h3
		ref={ref}
		className={cn(
			'text-base sm:text-lg font-semibold leading-tight tracking-tight text-foreground flex items-center justify-between gap-2',
			className,
		)}
		{...props}
	/>
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn(
			'text-xs sm:text-sm text-muted-foreground leading-relaxed',
			className,
		)}
		{...props}
	/>
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('p-4 sm:p-6 pt-0 sm:pt-0 flex-1', className)}
		{...props}
	/>
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex items-center p-4 sm:p-6 pt-0 sm:pt-0 gap-2', className)}
		{...props}
	/>
))
CardFooter.displayName = 'CardFooter'

export interface CardMediaProps extends React.HTMLAttributes<HTMLDivElement> {
	aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto'
}

const CardMedia = React.forwardRef<HTMLDivElement, CardMediaProps>(
	({ className, aspectRatio = '16/9', children, ...props }, ref) => {
		const aspectClass =
			aspectRatio === '16/9'
				? 'aspect-video'
				: aspectRatio === '4/3'
					? 'aspect-4/3'
					: aspectRatio === '1/1'
						? 'aspect-square'
						: ''

		return (
			<div
				ref={ref}
				className={cn(
					'relative w-full overflow-hidden rounded-t-2xl bg-muted [&_img]:size-full [&_img]:object-cover',
					aspectClass,
					className,
				)}
				{...props}
			>
				{children}
			</div>
		)
	},
)
CardMedia.displayName = 'CardMedia'

export {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardMedia,
	CardTitle,
	cardVariants,
}

