import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, Check, Minus } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

const checkboxVariants = cva(
	'peer shrink-0 border border-input shadow-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center select-none active:scale-95 motion-reduce:transform-none',
	{
		variants: {
			variant: {
				default:
					'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground',
				secondary:
					'data-[state=checked]:bg-secondary data-[state=checked]:border-secondary data-[state=checked]:text-secondary-foreground data-[state=indeterminate]:bg-secondary data-[state=indeterminate]:border-secondary data-[state=indeterminate]:text-secondary-foreground',
				success:
					'data-[state=checked]:bg-success data-[state=checked]:border-success data-[state=checked]:text-success-foreground data-[state=indeterminate]:bg-success data-[state=indeterminate]:border-success data-[state=indeterminate]:text-success-foreground',
				warning:
					'data-[state=checked]:bg-warning data-[state=checked]:border-warning data-[state=checked]:text-warning-foreground data-[state=indeterminate]:bg-warning data-[state=indeterminate]:border-warning data-[state=indeterminate]:text-warning-foreground',
				destructive:
					'data-[state=checked]:bg-destructive data-[state=checked]:border-destructive data-[state=checked]:text-destructive-foreground data-[state=indeterminate]:bg-destructive data-[state=indeterminate]:border-destructive data-[state=indeterminate]:text-destructive-foreground',
				info: 'data-[state=checked]:bg-info data-[state=checked]:border-info data-[state=checked]:text-info-foreground data-[state=indeterminate]:bg-info data-[state=indeterminate]:border-info data-[state=indeterminate]:text-info-foreground',
			},
			size: {
				sm: 'size-3.5 rounded-[3px] [&_svg]:size-2.5',
				default: 'size-4.5 rounded-sm [&_svg]:size-3.5',
				lg: 'size-6 rounded-md [&_svg]:size-4',
			},
			shape: {
				default: '',
				circle: 'rounded-full',
				square: 'rounded-none',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			shape: 'default',
		},
	},
)

export interface CheckboxProps
	extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
		VariantProps<typeof checkboxVariants> {
	label?: React.ReactNode
	description?: React.ReactNode
	errorMessage?: string
	helperText?: string
	containerClassName?: string
	asCard?: boolean
}

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	CheckboxProps
>(
	(
		{
			className,
			containerClassName,
			variant,
			size,
			shape,
			label,
			description,
			errorMessage,
			helperText,
			asCard = false,
			disabled,
			id,
			checked,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId()
		const checkboxId = id ?? generatedId
		const isIndeterminate = checked === 'indeterminate'

		const checkboxElement = (
			<CheckboxPrimitive.Root
				ref={ref}
				id={checkboxId}
				disabled={disabled}
				checked={checked}
				className={cn(
					checkboxVariants({ variant, size, shape }),
					errorMessage &&
						'!border-destructive focus-visible:!ring-destructive/20',
					className,
				)}
				{...props}
			>
				<CheckboxPrimitive.Indicator className="flex items-center justify-center text-current transition-transform duration-100">
					{isIndeterminate ? (
						<Minus className="stroke-[3]" />
					) : (
						<Check className="stroke-[3]" />
					)}
				</CheckboxPrimitive.Indicator>
			</CheckboxPrimitive.Root>
		)

		if (!label && !description && !errorMessage && !helperText && !asCard) {
			return checkboxElement
		}

		if (asCard) {
			return (
				<label
					htmlFor={checkboxId}
					className={cn(
						'flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer select-none shadow-xs',
						'has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5',
						disabled &&
							'opacity-50 cursor-not-allowed pointer-events-none bg-muted/20',
						errorMessage && '!border-destructive',
						containerClassName,
					)}
				>
					<div className="pt-0.5">{checkboxElement}</div>
					<div className="flex flex-col gap-1 flex-1">
						{label && (
							<span className="text-sm font-semibold text-foreground leading-tight">
								{label}
							</span>
						)}
						{description && (
							<span className="text-xs text-muted-foreground leading-relaxed">
								{description}
							</span>
						)}
						{errorMessage && (
							<span className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
								<AlertCircle className="size-3.5 shrink-0" />
								{errorMessage}
							</span>
						)}
					</div>
				</label>
			)
		}

		return (
			<div className={cn('flex flex-col gap-1', containerClassName)}>
				<div className="flex items-start gap-2.5">
					<div className="pt-0.5">{checkboxElement}</div>
					{(label || description) && (
						<div className="flex flex-col gap-0.5 select-none">
							{label && (
								<label
									htmlFor={checkboxId}
									className={cn(
										'text-sm font-medium text-foreground cursor-pointer leading-tight',
										disabled && 'cursor-not-allowed opacity-70',
									)}
								>
									{label}
								</label>
							)}
							{description && (
								<p className="text-xs text-muted-foreground leading-relaxed">
									{description}
								</p>
							)}
						</div>
					)}
				</div>

				{errorMessage ? (
					<p className="text-xs text-destructive flex items-center gap-1 font-medium mt-0.5 pl-7 animate-in fade-in-50 duration-150">
						<AlertCircle className="size-3.5 shrink-0" />
						<span>{errorMessage}</span>
					</p>
				) : helperText ? (
					<p className="text-xs text-muted-foreground pl-7">{helperText}</p>
				) : null}
			</div>
		)
	},
)

Checkbox.displayName = 'Checkbox'

export { Checkbox, checkboxVariants }
