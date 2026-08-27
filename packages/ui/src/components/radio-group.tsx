import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, Circle } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/utils'

const radioGroupVariants = cva('grid gap-2.5', {
	variants: {
		orientation: {
			vertical: 'grid-flow-row',
			horizontal: 'grid-flow-col auto-cols-max items-center gap-4',
		},
	},
	defaultVariants: {
		orientation: 'vertical',
	},
})

export interface RadioGroupProps
	extends Omit<
			React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
			'orientation'
		>,
		VariantProps<typeof radioGroupVariants> {
	label?: string
	description?: string
	errorMessage?: string
	helperText?: string
	required?: boolean
}

const RadioGroup = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Root>,
	RadioGroupProps
>(
	(
		{
			className,
			orientation = 'vertical',
			label,
			description,
			errorMessage,
			helperText,
			required,
			children,
			...props
		},
		ref,
	) => {
		return (
			<div className="flex flex-col gap-2 w-full">
				{(label || description) && (
					<div className="flex flex-col gap-0.5 select-none">
						{label && (
							<span className="text-xs font-semibold tracking-wide text-foreground flex items-center gap-1">
								{label}
								{required && (
									<span className="text-destructive text-xs">*</span>
								)}
							</span>
						)}
						{description && (
							<p className="text-xs text-muted-foreground">{description}</p>
						)}
					</div>
				)}

				<RadioGroupPrimitive.Root
					ref={ref}
					orientation={orientation ?? undefined}
					className={cn(radioGroupVariants({ orientation }), className)}
					{...props}
				>
					{children}
				</RadioGroupPrimitive.Root>

				{errorMessage ? (
					<p className="text-xs text-destructive flex items-center gap-1 font-medium mt-0.5 animate-in fade-in-50 duration-150">
						<AlertCircle className="size-3.5 shrink-0" />
						<span>{errorMessage}</span>
					</p>
				) : helperText ? (
					<p className="text-xs text-muted-foreground">{helperText}</p>
				) : null}
			</div>
		)
	},
)
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const radioItemVariants = cva(
	'aspect-square rounded-full border border-input shadow-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center select-none active:scale-95 motion-reduce:transform-none shrink-0',
	{
		variants: {
			variant: {
				default:
					'text-primary border-input data-[state=checked]:border-primary data-[state=checked]:bg-primary/5',
				secondary:
					'text-secondary-foreground border-input data-[state=checked]:border-secondary-foreground data-[state=checked]:bg-secondary/30',
				success:
					'text-success border-input data-[state=checked]:border-success data-[state=checked]:bg-success/5',
				warning:
					'text-warning border-input data-[state=checked]:border-warning data-[state=checked]:bg-warning/5',
				destructive:
					'text-destructive border-input data-[state=checked]:border-destructive data-[state=checked]:bg-destructive/5',
				info: 'text-info border-input data-[state=checked]:border-info data-[state=checked]:bg-info/5',
			},
			size: {
				sm: 'size-3.5 [&_svg]:size-1.5',
				default: 'size-4.5 [&_svg]:size-2',
				lg: 'size-6 [&_svg]:size-2.5',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export interface RadioGroupItemProps
	extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
		VariantProps<typeof radioItemVariants> {
	label?: React.ReactNode
	description?: React.ReactNode
	badge?: React.ReactNode
	asCard?: boolean
	containerClassName?: string
}

const RadioGroupItem = React.forwardRef<
	React.ElementRef<typeof RadioGroupPrimitive.Item>,
	RadioGroupItemProps
>(
	(
		{
			className,
			containerClassName,
			variant,
			size,
			label,
			description,
			badge,
			asCard = false,
			disabled,
			id,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId()
		const itemId = id ?? generatedId

		const radioElement = (
			<RadioGroupPrimitive.Item
				ref={ref}
				id={itemId}
				disabled={disabled}
				className={cn(radioItemVariants({ variant, size }), className)}
				{...props}
			>
				<RadioGroupPrimitive.Indicator className="flex items-center justify-center text-current">
					<Circle className="fill-current text-current stroke-none" />
				</RadioGroupPrimitive.Indicator>
			</RadioGroupPrimitive.Item>
		)

		if (!label && !description && !asCard && !badge) {
			return radioElement
		}

		if (asCard) {
			return (
				<label
					htmlFor={itemId}
					className={cn(
						'flex items-start gap-3.5 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer select-none shadow-xs',
						'has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5 has-[button[data-state=checked]]:shadow-sm',
						disabled &&
							'opacity-50 cursor-not-allowed pointer-events-none bg-muted/20',
						containerClassName,
					)}
				>
					<div className="pt-0.5">{radioElement}</div>
					<div className="flex flex-col gap-1 flex-1">
						<div className="flex items-center justify-between gap-2">
							{label && (
								<span className="text-sm font-semibold text-foreground leading-tight">
									{label}
								</span>
							)}
							{badge && <div className="shrink-0">{badge}</div>}
						</div>
						{description && (
							<span className="text-xs text-muted-foreground leading-relaxed">
								{description}
							</span>
						)}
					</div>
				</label>
			)
		}

		return (
			<div className={cn('flex items-start gap-2.5', containerClassName)}>
				<div className="pt-0.5">{radioElement}</div>
				{(label || description || badge) && (
					<div className="flex flex-col gap-0.5 select-none">
						<div className="flex items-center gap-2">
							{label && (
								<label
									htmlFor={itemId}
									className={cn(
										'text-sm font-medium text-foreground cursor-pointer leading-tight',
										disabled && 'cursor-not-allowed opacity-70',
									)}
								>
									{label}
								</label>
							)}
							{badge && <div className="shrink-0">{badge}</div>}
						</div>
						{description && (
							<p className="text-xs text-muted-foreground leading-relaxed">
								{description}
							</p>
						)}
					</div>
				)}
			</div>
		)
	},
)
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem, radioGroupVariants, radioItemVariants }
