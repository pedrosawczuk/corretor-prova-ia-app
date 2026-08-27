import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../lib/utils'

const separatorVariants = cva('shrink-0 select-none transition-colors', {
	variants: {
		orientation: {
			horizontal: 'w-full',
			vertical: 'h-full',
		},
		variant: {
			default: 'bg-border',
			subtle: 'bg-muted/70',
			primary: 'bg-primary/40',
			secondary: 'bg-secondary',
			destructive: 'bg-destructive/30',
			success: 'bg-success/30',
			warning: 'bg-warning/30',
			info: 'bg-info/30',
		},
		thickness: {
			xs: '',
			sm: '',
			md: '',
		},
	},
	compoundVariants: [
		{
			orientation: 'horizontal',
			thickness: 'xs',
			className: 'h-px',
		},
		{
			orientation: 'horizontal',
			thickness: 'sm',
			className: 'h-0.5',
		},
		{
			orientation: 'horizontal',
			thickness: 'md',
			className: 'h-1 rounded-full',
		},
		{
			orientation: 'vertical',
			thickness: 'xs',
			className: 'w-px',
		},
		{
			orientation: 'vertical',
			thickness: 'sm',
			className: 'w-0.5',
		},
		{
			orientation: 'vertical',
			thickness: 'md',
			className: 'w-1 rounded-full',
		},
	],
	defaultVariants: {
		orientation: 'horizontal',
		variant: 'default',
		thickness: 'xs',
	},
})

export interface SeparatorProps
	extends Omit<
			React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
			'orientation'
		>,
		Omit<VariantProps<typeof separatorVariants>, 'orientation'> {
	/** Orientação do separador */
	orientation?: 'horizontal' | 'vertical'
	/** Rótulo ou conteúdo central exibido no separador (apenas para orientação horizontal) */
	label?: React.ReactNode
	/** Alinhamento do rótulo na horizontal */
	labelAlignment?: 'start' | 'center' | 'end'
	/** Estilo da linha (sólida, tracejada ou pontilhada) */
	borderStyle?: 'solid' | 'dashed' | 'dotted'
}

const Separator = React.forwardRef<
	React.ElementRef<typeof SeparatorPrimitive.Root>,
	SeparatorProps
>(
	(
		{
			className,
			orientation = 'horizontal',
			decorative = true,
			variant,
			thickness,
			label,
			labelAlignment = 'center',
			borderStyle = 'solid',
			children,
			...props
		},
		ref,
	) => {
		const content = label ?? children
		const isHorizontal = orientation === 'horizontal'

		if (isHorizontal && content) {
			const borderClass = cn(
				'flex-1 border-t transition-colors',
				variant === 'default' && 'border-border',
				variant === 'subtle' && 'border-muted',
				variant === 'primary' && 'border-primary/40',
				variant === 'secondary' && 'border-secondary-foreground/20',
				variant === 'destructive' && 'border-destructive/40',
				variant === 'success' && 'border-success/40',
				variant === 'warning' && 'border-warning/40',
				variant === 'info' && 'border-info/40',
				borderStyle === 'dashed' && 'border-dashed',
				borderStyle === 'dotted' && 'border-dotted',
				thickness === 'sm' && 'border-t-2',
				thickness === 'md' && 'border-t-4 rounded-full',
			)

			return (
				<div
					{...(decorative
						? { role: 'none' }
						: { role: 'separator', 'aria-orientation': 'horizontal' })}
					className={cn(
						'flex w-full items-center text-xs text-muted-foreground select-none gap-3 my-2',
						labelAlignment === 'start' && 'justify-start',
						labelAlignment === 'end' && 'justify-end',
						className,
					)}
				>
					<div
						className={cn(borderClass, labelAlignment === 'start' && 'max-w-6')}
					/>
					<span className="shrink-0 font-medium tracking-wide uppercase text-[11px]">
						{content}
					</span>
					<div
						className={cn(borderClass, labelAlignment === 'end' && 'max-w-6')}
					/>
				</div>
			)
		}

		if (borderStyle !== 'solid') {
			if (isHorizontal) {
				return (
					<SeparatorPrimitive.Root
						ref={ref}
						decorative={decorative}
						orientation={orientation}
						className={cn(
							'w-full border-t',
							variant === 'default' && 'border-border',
							variant === 'subtle' && 'border-muted',
							variant === 'primary' && 'border-primary/40',
							variant === 'secondary' && 'border-secondary-foreground/20',
							variant === 'destructive' && 'border-destructive/40',
							variant === 'success' && 'border-success/40',
							variant === 'warning' && 'border-warning/40',
							variant === 'info' && 'border-info/40',
							borderStyle === 'dashed' && 'border-dashed',
							borderStyle === 'dotted' && 'border-dotted',
							thickness === 'sm' && 'border-t-2',
							thickness === 'md' && 'border-t-4',
							className,
						)}
						{...props}
					/>
				)
			}

			return (
				<SeparatorPrimitive.Root
					ref={ref}
					decorative={decorative}
					orientation={orientation}
					className={cn(
						'h-full border-l',
						variant === 'default' && 'border-border',
						variant === 'subtle' && 'border-muted',
						variant === 'primary' && 'border-primary/40',
						variant === 'secondary' && 'border-secondary-foreground/20',
						variant === 'destructive' && 'border-destructive/40',
						variant === 'success' && 'border-success/40',
						variant === 'warning' && 'border-warning/40',
						variant === 'info' && 'border-info/40',
						borderStyle === 'dashed' && 'border-dashed',
						borderStyle === 'dotted' && 'border-dotted',
						thickness === 'sm' && 'border-l-2',
						thickness === 'md' && 'border-l-4',
						className,
					)}
					{...props}
				/>
			)
		}

		return (
			<SeparatorPrimitive.Root
				ref={ref}
				decorative={decorative}
				orientation={orientation}
				className={cn(
					separatorVariants({ orientation, variant, thickness }),
					className,
				)}
				{...props}
			/>
		)
	},
)

Separator.displayName = 'Separator'

export { Separator, separatorVariants }
