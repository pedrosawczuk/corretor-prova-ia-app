import { cn } from '@/lib/utils'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, Check, ChevronDown, ChevronUp } from 'lucide-react'
import * as React from 'react'

const selectTriggerVariants = cva(
	[
		'flex w-full items-center justify-between gap-2 border transition-all duration-150 outline-none',
		'text-sm text-foreground placeholder:text-muted-foreground',
		'focus:ring-2 focus:ring-ring focus:ring-offset-0',
		'disabled:pointer-events-none disabled:opacity-50',
		'data-[placeholder]:text-muted-foreground',
		'[&>span]:line-clamp-1 [&>span]:text-left',
	],
	{
		variants: {
			variant: {
				default:
					'bg-background border-input hover:border-primary/60 focus:border-primary',
				filled:
					'bg-muted/40 border-transparent hover:bg-muted/70 focus:bg-background focus:border-primary',
				outline:
					'bg-transparent border-2 border-input hover:border-primary/60 focus:border-primary',
				ghost:
					'bg-transparent border-transparent hover:bg-muted/40 focus:bg-muted/20 focus:border-primary',
				underlined:
					'rounded-none border-0 border-b border-input bg-transparent px-0 hover:border-primary/60 focus:border-primary focus:ring-0',
			},
			status: {
				default: '',
				error:
					'border-destructive hover:border-destructive focus:border-destructive focus:ring-destructive/20',
				success:
					'border-success hover:border-success focus:border-success focus:ring-success/20',
				warning:
					'border-warning hover:border-warning focus:border-warning focus:ring-warning/20',
			},
			size: {
				xs: 'h-7 px-2 text-xs rounded-sm',
				sm: 'h-8 px-3 text-sm rounded-md',
				default: 'h-10 px-3 rounded-lg',
				lg: 'h-11 px-4 rounded-lg text-base',
				xl: 'h-12 px-4 rounded-xl text-base',
			},
		},
		defaultVariants: {
			variant: 'default',
			status: 'default',
			size: 'default',
		},
	},
)

const SelectRoot = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

export interface SelectProps
	extends Omit<
			React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>,
			'children'
		>,
		VariantProps<typeof selectTriggerVariants> {
	placeholder?: string
	label?: string
	helperText?: string
	errorMessage?: string
	required?: boolean
	disabled?: boolean
	/** Icon shown on the left side of the trigger */
	leftIcon?: React.ReactNode
	/** Full width trigger */
	fullWidth?: boolean
	containerClassName?: string
	triggerClassName?: string
	contentClassName?: string
	children: React.ReactNode
}

const Select = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Trigger>,
	SelectProps
>(
	(
		{
			variant,
			status,
			size,
			placeholder,
			label,
			helperText,
			errorMessage,
			required,
			disabled,
			leftIcon,
			fullWidth,
			containerClassName,
			triggerClassName,
			contentClassName,
			children,
			...props
		},
		ref,
	) => {
		const resolvedStatus = errorMessage ? 'error' : status

		return (
			<div
				className={cn(
					'flex flex-col gap-1.5',
					fullWidth && 'w-full',
					containerClassName,
				)}
			>
				{label && (
					<span className="text-xs font-semibold tracking-wide text-foreground select-none flex items-center gap-1">
						{label}
						{required && <span className="text-destructive text-xs">*</span>}
					</span>
				)}

				<SelectRoot disabled={disabled} {...props}>
					<SelectPrimitive.Trigger
						ref={ref}
						className={cn(
							selectTriggerVariants({ variant, size, status: resolvedStatus }),
							fullWidth && 'w-full',
							triggerClassName,
						)}
					>
						{leftIcon && (
							<span className="text-muted-foreground shrink-0 [&_svg]:size-4">
								{leftIcon}
							</span>
						)}
						<SelectValue placeholder={placeholder ?? 'Selecione...'} />
						<SelectPrimitive.Icon asChild>
							<ChevronDown className="size-4 text-muted-foreground shrink-0 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
						</SelectPrimitive.Icon>
					</SelectPrimitive.Trigger>

					<SelectPrimitive.Portal>
						<SelectPrimitive.Content
							className={cn(
								'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg',
								'data-[state=open]:animate-in data-[state=closed]:animate-out',
								'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
								'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
								'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2',
								contentClassName,
							)}
							position="popper"
							sideOffset={6}
						>
							<SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6 bg-popover text-muted-foreground cursor-default">
								<ChevronUp className="size-4" />
							</SelectPrimitive.ScrollUpButton>

							<SelectPrimitive.Viewport className="p-1.5">
								{children}
							</SelectPrimitive.Viewport>

							<SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6 bg-popover text-muted-foreground cursor-default">
								<ChevronDown className="size-4" />
							</SelectPrimitive.ScrollDownButton>
						</SelectPrimitive.Content>
					</SelectPrimitive.Portal>
				</SelectRoot>

				{errorMessage ? (
					<p className="text-xs text-destructive flex items-center gap-1 font-medium animate-in fade-in-50 duration-150">
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
Select.displayName = 'Select'

export interface SelectItemProps
	extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
	/** Optional icon shown to the left of the label */
	icon?: React.ReactNode
	/** Optional badge/tag shown to the right */
	badge?: React.ReactNode
	/** Secondary description line below the label */
	description?: string
}

const SelectItem = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Item>,
	SelectItemProps
>(({ className, children, icon, badge, description, ...props }, ref) => (
	<SelectPrimitive.Item
		ref={ref}
		className={cn(
			'relative flex w-full cursor-pointer select-none items-center rounded-lg px-2 py-2 text-sm outline-none gap-2',
			'text-foreground',
			'focus:bg-accent focus:text-accent-foreground',
			'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
			'data-[state=checked]:bg-primary/8 data-[state=checked]:text-primary',
			className,
		)}
		{...props}
	>
		<span className="flex size-4 items-center justify-center shrink-0">
			<SelectPrimitive.ItemIndicator>
				<Check className="size-4" />
			</SelectPrimitive.ItemIndicator>
		</span>

		{icon && (
			<span className="shrink-0 text-muted-foreground [&_svg]:size-4">
				{icon}
			</span>
		)}

		<div className="flex flex-col flex-1 min-w-0">
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
			{description && (
				<span className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">
					{description}
				</span>
			)}
		</div>

		{badge && <div className="shrink-0 ml-auto">{badge}</div>}
	</SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectLabel = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Label>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Label
		ref={ref}
		className={cn(
			'px-8 py-1.5 text-xs font-semibold text-muted-foreground tracking-wide uppercase',
			className,
		)}
		{...props}
	/>
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectSeparator = React.forwardRef<
	React.ElementRef<typeof SelectPrimitive.Separator>,
	React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
	<SelectPrimitive.Separator
		ref={ref}
		className={cn('-mx-1 my-1 h-px bg-border', className)}
		{...props}
	/>
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
	Select,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectRoot,
	SelectSeparator,
	selectTriggerVariants,
	SelectValue,
}
