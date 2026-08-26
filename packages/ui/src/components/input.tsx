import { cva, type VariantProps } from 'class-variance-authority'
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Eye,
	EyeOff,
	Loader2,
	X,
} from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

const inputContainerVariants = cva(
	'relative flex items-center w-full transition-all duration-150 group',
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
				xs: 'h-7 text-xs rounded-sm',
				sm: 'h-8 text-xs rounded-md',
				default: 'h-10 text-sm rounded-md',
				lg: 'h-11 text-base rounded-lg',
				xl: 'h-12 text-base rounded-lg',
			},
			shape: {
				default: '',
				pill: 'rounded-full',
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

export interface InputProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
		VariantProps<typeof inputContainerVariants> {
	leftIcon?: React.ReactNode
	rightIcon?: React.ReactNode
	leftAddon?: React.ReactNode
	rightAddon?: React.ReactNode
	isLoading?: boolean
	isClearable?: boolean
	onClear?: () => void
	label?: string
	helperText?: string
	errorMessage?: string
	containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	(
		{
			className,
			containerClassName,
			type = 'text',
			variant,
			status,
			size,
			shape,
			leftIcon,
			rightIcon,
			leftAddon,
			rightAddon,
			isLoading = false,
			isClearable = false,
			onClear,
			label,
			helperText,
			errorMessage,
			disabled,
			id,
			value,
			defaultValue,
			onChange,
			...props
		},
		ref,
	) => {
		const generatedId = React.useId()
		const inputId = id ?? generatedId
		const [showPassword, setShowPassword] = React.useState(false)
		const [internalValue, setInternalValue] = React.useState(
			value ?? defaultValue ?? '',
		)

		const isPasswordType = type === 'password'
		const currentType = isPasswordType
			? showPassword
				? 'text'
				: 'password'
			: type
		const effectiveStatus = errorMessage ? 'error' : status
		const hasValue = Boolean(value !== undefined ? value : internalValue)

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			if (value === undefined) {
				setInternalValue(e.target.value)
			}
			onChange?.(e)
		}

		const handleClear = () => {
			setInternalValue('')
			onClear?.()
		}

		const statusIcon = React.useMemo(() => {
			if (isLoading) {
				return (
					<Loader2 className="animate-spin text-muted-foreground size-4 shrink-0" />
				)
			}
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
		}, [isLoading, effectiveStatus])

		return (
			<div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
				{label && (
					<label
						htmlFor={inputId}
						className="text-xs font-semibold tracking-wide text-foreground flex items-center justify-between select-none"
					>
						<span>{label}</span>
						{props.required && (
							<span className="text-destructive text-xs ml-1">*</span>
						)}
					</label>
				)}

				<div className="flex items-stretch w-full">
					{leftAddon && (
						<div className="flex items-center px-3 bg-muted/70 text-muted-foreground text-xs font-medium border border-r-0 border-input rounded-l-md select-none">
							{leftAddon}
						</div>
					)}

					<div
						className={cn(
							inputContainerVariants({
								variant,
								status: effectiveStatus,
								size,
								shape,
							}),
							disabled &&
								'opacity-50 pointer-events-none cursor-not-allowed bg-muted/30',
							leftAddon && 'rounded-l-none',
							rightAddon && 'rounded-r-none',
							className,
						)}
					>
						{leftIcon && (
							<div className="pl-3 pr-1 text-muted-foreground flex items-center pointer-events-none shrink-0 [&_svg]:size-4">
								{leftIcon}
							</div>
						)}

						<input
							ref={ref}
							id={inputId}
							type={currentType}
							disabled={disabled}
							value={value}
							defaultValue={defaultValue}
							onChange={handleChange}
							aria-invalid={effectiveStatus === 'error' ? true : undefined}
							aria-describedby={
								errorMessage
									? `${inputId}-error`
									: helperText
										? `${inputId}-helper`
										: undefined
							}
							className={cn(
								'w-full h-full bg-transparent px-3 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed text-inherit font-inherit',
								leftIcon && 'pl-1.5',
								(rightIcon || isPasswordType || isClearable || statusIcon) &&
									'pr-1.5',
							)}
							{...props}
						/>

						<div className="flex items-center gap-1.5 pr-3 shrink-0">
							{isClearable && hasValue && !disabled && (
								<button
									type="button"
									onClick={handleClear}
									tabIndex={-1}
									aria-label="Limpar campo"
									className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-muted focus:outline-none cursor-pointer"
								>
									<X className="size-3.5" />
								</button>
							)}

							{isPasswordType && !disabled && (
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									tabIndex={-1}
									aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
									className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-muted focus:outline-none cursor-pointer"
								>
									{showPassword ? (
										<EyeOff className="size-4" />
									) : (
										<Eye className="size-4" />
									)}
								</button>
							)}

							{statusIcon}

							{rightIcon && !statusIcon && (
								<div className="text-muted-foreground flex items-center pointer-events-none [&_svg]:size-4">
									{rightIcon}
								</div>
							)}
						</div>
					</div>

					{rightAddon && (
						<div className="flex items-center px-3 bg-muted/70 text-muted-foreground text-xs font-medium border border-l-0 border-input rounded-r-md select-none">
							{rightAddon}
						</div>
					)}
				</div>

				{errorMessage ? (
					<p
						id={`${inputId}-error`}
						className="text-xs text-destructive flex items-center gap-1 font-medium mt-0.5 animate-in fade-in-50 duration-150"
					>
						<AlertCircle className="size-3.5 shrink-0" />
						<span>{errorMessage}</span>
					</p>
				) : helperText ? (
					<p
						id={`${inputId}-helper`}
						className="text-xs text-muted-foreground mt-0.5"
					>
						{helperText}
					</p>
				) : null}
			</div>
		)
	},
)

Input.displayName = 'Input'

export { Input, inputContainerVariants }
