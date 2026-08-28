import * as SliderPrimitive from '@radix-ui/react-slider'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/utils'

const sliderTrackVariants = cva(
	'relative w-full grow overflow-hidden rounded-full bg-muted transition-colors',
	{
		variants: {
			size: {
				sm: 'h-1.5',
				default: 'h-2',
				lg: 'h-3',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
)

const sliderRangeVariants = cva('absolute h-full transition-all', {
	variants: {
		variant: {
			default: 'bg-primary',
			secondary: 'bg-secondary-foreground',
			success: 'bg-success',
			warning: 'bg-warning',
			destructive: 'bg-destructive',
			info: 'bg-info',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
})

const sliderThumbVariants = cva(
	'block rounded-full border-2 border-background bg-primary shadow-md transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 motion-reduce:transform-none',
	{
		variants: {
			variant: {
				default: 'bg-primary border-background',
				secondary: 'bg-secondary-foreground border-background',
				success: 'bg-success border-background',
				warning: 'bg-warning border-background',
				destructive: 'bg-destructive border-background',
				info: 'bg-info border-background',
			},
			size: {
				sm: 'size-4',
				default: 'size-5',
				lg: 'size-6',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export interface SliderMark {
	value: number
	label?: React.ReactNode
}

export interface SliderProps
	extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
		VariantProps<typeof sliderRangeVariants>,
		VariantProps<typeof sliderTrackVariants> {
	label?: React.ReactNode
	helperText?: string
	errorMessage?: string
	showValue?: boolean
	valuePrefix?: string
	valueSuffix?: string
	formatValue?: (value: number) => React.ReactNode
	marks?: SliderMark[]
	containerClassName?: string
}

const Slider = React.forwardRef<
	React.ElementRef<typeof SliderPrimitive.Root>,
	SliderProps
>(
	(
		{
			className,
			containerClassName,
			variant,
			size,
			label,
			helperText,
			errorMessage,
			showValue = false,
			valuePrefix = '',
			valueSuffix = '',
			formatValue,
			marks,
			value,
			defaultValue = [0],
			min = 0,
			max = 100,
			step = 1,
			disabled,
			...props
		},
		ref,
	) => {
		const currentValues = value ?? defaultValue ?? [0]
		const valuesArray = Array.isArray(currentValues)
			? currentValues
			: [currentValues]

		const formatDisplay = (val: number) => {
			if (formatValue) return formatValue(val)
			return `${valuePrefix}${val}${valueSuffix}`
		}

		return (
			<div className={cn('flex flex-col gap-2 w-full', containerClassName)}>
				{(label || showValue) && (
					<div className="flex items-center justify-between text-xs select-none">
						{label && (
							<span className="font-semibold tracking-wide text-foreground">
								{label}
							</span>
						)}
						{showValue && (
							<span className="font-semibold font-mono text-primary">
								{valuesArray.map(formatDisplay).join(' - ')}
							</span>
						)}
					</div>
				)}

				<SliderPrimitive.Root
					ref={ref}
					min={min}
					max={max}
					step={step}
					disabled={disabled}
					value={value}
					defaultValue={defaultValue}
					className={cn(
						'relative flex w-full touch-none select-none items-center py-1 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
						className,
					)}
					{...props}
				>
					<SliderPrimitive.Track className={sliderTrackVariants({ size })}>
						<SliderPrimitive.Range
							className={sliderRangeVariants({ variant })}
						/>
					</SliderPrimitive.Track>

					{valuesArray.map((_, index) => (
						<SliderPrimitive.Thumb
							// biome-ignore lint/suspicious/noArrayIndexKey: slider thumb index
							key={index}
							className={sliderThumbVariants({ variant, size })}
							aria-label={label ? String(label) : `Slider thumb ${index + 1}`}
						/>
					))}
				</SliderPrimitive.Root>

				{marks && marks.length > 0 && (
					<div className="relative w-full flex justify-between px-1 text-[11px] text-muted-foreground select-none">
						{marks.map((mark) => {
							const percentage = ((mark.value - min) / (max - min)) * 100
							return (
								<div
									key={mark.value}
									className="flex flex-col items-center -translate-x-1/2"
									style={{ left: `${percentage}%`, position: 'absolute' }}
								>
									<span className="h-1 w-px bg-border mb-1" />
									<span className="font-medium">
										{mark.label ?? mark.value}
									</span>
								</div>
							)
						})}
					</div>
				)}

				{errorMessage ? (
					<p className="text-xs text-destructive flex items-center gap-1 font-medium mt-0.5 animate-in fade-in-50 duration-150">
						<AlertCircle className="size-3.5 shrink-0" />
						<span>{errorMessage}</span>
					</p>
				) : helperText ? (
					<p className="text-xs text-muted-foreground mt-0.5">{helperText}</p>
				) : null}
			</div>
		)
	},
)

Slider.displayName = 'Slider'

export { Slider, sliderRangeVariants, sliderThumbVariants, sliderTrackVariants }
