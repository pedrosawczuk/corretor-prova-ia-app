import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/utils'

const buttonVariants = cva(
	'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] motion-reduce:transform-none touch-manipulation [&_svg]:pointer-events-none [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow',
				secondary:
					'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
				outline:
					'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
				ghost:
					'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
				link: 'text-primary underline-offset-4 hover:underline active:scale-100 p-0 h-auto font-normal',
				destructive:
					'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
				'destructive-outline':
					'border border-destructive/30 text-destructive bg-background hover:bg-destructive/10 hover:border-destructive/50',
				success:
					'bg-success text-success-foreground shadow-sm hover:bg-success/90',
				'success-outline':
					'border border-success/30 text-success bg-background hover:bg-success/10 hover:border-success/50',
				warning:
					'bg-warning text-warning-foreground shadow-sm hover:bg-warning/90',
				'warning-outline':
					'border border-warning/30 text-warning bg-background hover:bg-warning/10 hover:border-warning/50',
				info: 'bg-info text-info-foreground shadow-sm hover:bg-info/90',
				'info-outline':
					'border border-info/30 text-info bg-background hover:bg-info/10 hover:border-info/50',
				subtle:
					'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
			},
			size: {
				xs: 'h-7 px-2.5 text-xs rounded-sm gap-1.5 [&_svg]:size-3.5',
				sm: 'h-8 px-3 text-xs rounded-md gap-1.5 [&_svg]:size-4',
				default: 'h-10 px-4 py-2 text-sm rounded-md gap-2 [&_svg]:size-4',
				lg: 'h-11 px-6 text-base rounded-lg gap-2.5 [&_svg]:size-5',
				xl: 'h-12 px-8 text-base font-semibold rounded-lg gap-3 [&_svg]:size-5',
				'icon-xs': 'size-7 p-0 rounded-sm [&_svg]:size-3.5',
				'icon-sm': 'size-8 p-0 rounded-md [&_svg]:size-4',
				icon: 'size-10 p-0 rounded-md [&_svg]:size-5',
				'icon-lg': 'size-11 p-0 rounded-lg [&_svg]:size-5',
			},
			shape: {
				default: '',
				pill: 'rounded-full',
				square: 'rounded-none',
			},
			fullWidth: {
				true: 'w-full',
				false: '',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			shape: 'default',
			fullWidth: false,
		},
	},
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
	isLoading?: boolean
	loadingText?: string
	leftIcon?: React.ReactNode
	rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant,
			size,
			shape,
			fullWidth,
			asChild = false,
			isLoading = false,
			loadingText,
			leftIcon,
			rightIcon,
			disabled,
			children,
			...props
		},
		ref,
	) => {
		const isButtonDisabled = disabled || isLoading

		if (asChild) {
			const hasVisualDecorators =
				isLoading || leftIcon || rightIcon || loadingText

			if (React.isValidElement(children) && hasVisualDecorators) {
				const originalChild = children as React.ReactElement<{
					children?: React.ReactNode
				}>

				const wrappedChildren = (
					<>
						{isLoading ? (
							<>
								<Loader2 className="animate-spin" />
								{loadingText ?? originalChild.props.children}
							</>
						) : (
							<>
								{leftIcon}
								{originalChild.props.children}
								{rightIcon}
							</>
						)}
					</>
				)

				return (
					<Slot
						className={cn(
							buttonVariants({ variant, size, shape, fullWidth, className }),
						)}
						ref={ref}
						aria-disabled={isButtonDisabled || undefined}
						aria-busy={isLoading || undefined}
						{...props}
					>
						{React.cloneElement(originalChild, {
							children: wrappedChildren,
						})}
					</Slot>
				)
			}

			return (
				<Slot
					className={cn(
						buttonVariants({ variant, size, shape, fullWidth, className }),
					)}
					ref={ref}
					aria-disabled={isButtonDisabled || undefined}
					aria-busy={isLoading || undefined}
					{...props}
				>
					{children}
				</Slot>
			)
		}

		return (
			<button
				className={cn(
					buttonVariants({ variant, size, shape, fullWidth, className }),
				)}
				ref={ref}
				disabled={isButtonDisabled}
				aria-busy={isLoading || undefined}
				{...props}
			>
				{isLoading ? (
					<>
						<Loader2 className="animate-spin" />
						{loadingText ?? children}
					</>
				) : (
					<>
						{leftIcon}
						{children}
						{rightIcon}
					</>
				)}
			</button>
		)
	},
)

Button.displayName = 'Button'

export { Button, buttonVariants }
