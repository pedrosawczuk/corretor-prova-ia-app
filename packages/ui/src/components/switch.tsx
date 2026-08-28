import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/utils'

const switchVariants = cva(
	'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 select-none active:scale-95 motion-reduce:transform-none',
	{
		variants: {
			variant: {
				default:
					'data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
				secondary:
					'data-[state=checked]:bg-secondary-foreground data-[state=unchecked]:bg-input',
				success:
					'data-[state=checked]:bg-success data-[state=unchecked]:bg-input',
				warning:
					'data-[state=checked]:bg-warning data-[state=unchecked]:bg-input',
				destructive:
					'data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input',
				info: 'data-[state=checked]:bg-info data-[state=unchecked]:bg-input',
			},
			size: {
				sm: 'h-4 w-7',
				default: 'h-6 w-11',
				lg: 'h-7 w-13',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

const switchThumbVariants = cva(
	'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 flex items-center justify-center text-muted-foreground',
	{
		variants: {
			size: {
				sm: 'size-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0',
				default:
					'size-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
				lg: 'size-6 data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
)

export interface SwitchProps
	extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>,
		VariantProps<typeof switchVariants> {
	label?: React.ReactNode
	description?: React.ReactNode
	helperText?: string
	errorMessage?: string
	containerClassName?: string
	thumbIcon?: React.ReactNode
	asCard?: boolean
}

const Switch = React.forwardRef<
	React.ElementRef<typeof SwitchPrimitive.Root>,
	SwitchProps
>(
	(
		{
			className,
			containerClassName,
			variant,
			size,
			label,
			description,
			helperText,
			errorMessage,
			thumbIcon,
			asCard = false,
			disabled,
			id,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId()
		const switchId = id ?? generatedId

		const switchElement = (
			<SwitchPrimitive.Root
				ref={ref}
				id={switchId}
				disabled={disabled}
				className={cn(switchVariants({ variant, size }), className)}
				{...props}
			>
				<SwitchPrimitive.Thumb className={switchThumbVariants({ size })}>
					{thumbIcon}
				</SwitchPrimitive.Thumb>
			</SwitchPrimitive.Root>
		)

		if (!label && !description && !errorMessage && !helperText && !asCard) {
			return switchElement
		}

		if (asCard) {
			return (
				<label
					htmlFor={switchId}
					className={cn(
						'flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer select-none shadow-xs',
						'has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5',
						disabled &&
							'opacity-50 cursor-not-allowed pointer-events-none bg-muted/20',
						errorMessage && '!border-destructive',
						containerClassName,
					)}
				>
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
					<div>{switchElement}</div>
				</label>
			)
		}

		return (
			<div className={cn('flex flex-col gap-1', containerClassName)}>
				<div className="flex items-start justify-between gap-3">
					{(label || description) && (
						<div className="flex flex-col gap-0.5 select-none flex-1">
							{label && (
								<label
									htmlFor={switchId}
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
					<div className="pt-0.5">{switchElement}</div>
				</div>

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

Switch.displayName = 'Switch'

export { Switch, switchThumbVariants, switchVariants }

