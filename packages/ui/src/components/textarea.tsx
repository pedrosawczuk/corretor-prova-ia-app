import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/utils'

const textareaContainerVariants = cva(
	'relative flex flex-col w-full transition-all duration-150 rounded-md',
	{
		variants: {
			variant: {
				default:
					'bg-background border border-input shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
				filled:
					'bg-muted/60 border border-transparent hover:bg-muted/80 focus-within:bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
				outline:
					'bg-background border-2 border-input focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20',
				ghost:
					'bg-transparent border border-transparent hover:bg-muted/40 focus-within:bg-background focus-within:border-input focus-within:ring-2 focus-within:ring-primary/20',
				underlined:
					'bg-transparent border-b-2 border-input rounded-none px-0 focus-within:border-primary focus-within:ring-0',
			},
			status: {
				default: '',
				error:
					'!border-destructive focus-within:!border-destructive focus-within:!ring-destructive/20',
				success:
					'!border-success focus-within:!border-success focus-within:!ring-success/20',
				warning:
					'!border-warning focus-within:!border-warning focus-within:!ring-warning/20',
			},
			size: {
				sm: 'text-xs min-h-[64px]',
				default: 'text-base sm:text-sm min-h-[96px]',
				lg: 'text-base min-h-[128px]',
				xl: 'text-base min-h-[160px]',
			},
			shape: {
				default: '',
				rounded: 'rounded-xl',
				square: 'rounded-none',
			},
		},
		defaultVariants: {
			variant: 'default',
			status: 'default',
			size: 'default',
			shape: 'default',
		},
	},
)

const resizeVariants = {
	none: 'resize-none',
	vertical: 'resize-y',
	horizontal: 'resize-x',
	both: 'resize',
}

export interface TextareaProps
	extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
		VariantProps<typeof textareaContainerVariants> {
	label?: string
	helperText?: string
	errorMessage?: string
	showCount?: boolean
	maxLength?: number
	resize?: keyof typeof resizeVariants
	headerSlot?: React.ReactNode
	footerSlot?: React.ReactNode
	containerClassName?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{
			className,
			containerClassName,
			variant,
			status,
			size,
			shape,
			resize = 'none',
			label,
			helperText,
			errorMessage,
			showCount = false,
			maxLength,
			disabled,
			id,
			value,
			defaultValue,
			onChange,
			headerSlot,
			footerSlot,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId()
		const textareaId = id ?? generatedId
		const [internalValue, setInternalValue] = React.useState(
			value ?? defaultValue ?? '',
		)

		const currentValue =
			value !== undefined ? String(value) : String(internalValue)
		const currentCount = currentValue.length
		const effectiveStatus = errorMessage ? 'error' : status
		const isNearLimit = maxLength ? currentCount >= maxLength * 0.9 : false
		const isAtLimit = maxLength ? currentCount >= maxLength : false

		const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			if (value === undefined) {
				setInternalValue(e.target.value)
			}
			onChange?.(e)
		}

		const statusIcon = React.useMemo(() => {
			if (effectiveStatus === 'error') {
				return <AlertCircle className="text-destructive size-4 shrink-0" />
			}
			if (effectiveStatus === 'success') {
				return <CheckCircle2 className="text-success size-4 shrink-0" />
			}
			if (effectiveStatus === 'warning') {
				return <AlertTriangle className="text-warning size-4 shrink-0" />
			}
			return null
		}, [effectiveStatus])

		return (
			<div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
				{label && (
					<label
						htmlFor={textareaId}
						className="text-xs font-semibold tracking-wide text-foreground flex items-center justify-between select-none"
					>
						<span>{label}</span>
						{props.required && (
							<span className="text-destructive text-xs ml-1">*</span>
						)}
					</label>
				)}

				<div
					className={cn(
						textareaContainerVariants({
							variant,
							status: effectiveStatus,
							size,
							shape,
						}),
						disabled &&
							'opacity-50 pointer-events-none cursor-not-allowed bg-muted/30',
						className,
					)}
				>
					{headerSlot && (
						<div className="flex items-center justify-between px-3 pt-2.5 pb-1 border-b border-border/50 text-xs text-muted-foreground select-none">
							{headerSlot}
						</div>
					)}

					<textarea
						ref={ref}
						id={textareaId}
						disabled={disabled}
						value={value}
						defaultValue={defaultValue}
						onChange={handleChange}
						maxLength={maxLength}
						aria-invalid={effectiveStatus === 'error' ? true : undefined}
						aria-describedby={
							errorMessage
								? `${textareaId}-error`
								: helperText
									? `${textareaId}-helper`
									: undefined
						}
						className={cn(
							'w-full flex-1 bg-transparent p-3 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed text-inherit font-inherit leading-relaxed',
							resizeVariants[resize],
						)}
						{...props}
					/>

					{(footerSlot || showCount || statusIcon) && (
						<div className="flex items-center justify-between px-3 pb-2.5 pt-1 text-xs select-none">
							<div className="flex items-center gap-2 text-muted-foreground">
								{footerSlot}
								{statusIcon}
							</div>

							{showCount && (
								<span
									className={cn(
										'text-xs font-medium ml-auto transition-colors',
										isAtLimit
											? 'text-destructive font-semibold'
											: isNearLimit
												? 'text-warning font-semibold'
												: 'text-muted-foreground',
									)}
								>
									{currentCount}
									{maxLength ? ` / ${maxLength}` : ' caracteres'}
								</span>
							)}
						</div>
					)}
				</div>

				{errorMessage ? (
					<p
						id={`${textareaId}-error`}
						className="text-xs text-destructive flex items-center gap-1 font-medium mt-0.5 animate-in fade-in-50 duration-150"
					>
						<AlertCircle className="size-3.5 shrink-0" />
						<span>{errorMessage}</span>
					</p>
				) : helperText ? (
					<p
						id={`${textareaId}-helper`}
						className="text-xs text-muted-foreground mt-0.5"
					>
						{helperText}
					</p>
				) : null}
			</div>
		)
	},
)

Textarea.displayName = 'Textarea'

export { Textarea, textareaContainerVariants }
