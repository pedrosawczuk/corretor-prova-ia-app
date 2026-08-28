import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../lib/utils'
import { buttonVariants } from './button'

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Overlay
		ref={ref}
		className={cn(
			'fixed inset-0 z-50 bg-black/60 backdrop-blur-xs',
			'data-[state=open]:animate-in data-[state=closed]:animate-out',
			'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200',
			className,
		)}
		{...props}
	/>
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const alertDialogContentVariants = cva(
	cn(
		'fixed left-[50%] top-[50%] z-50 grid w-[calc(100vw-2rem)] sm:w-full max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] gap-4 p-5 sm:p-6 shadow-xl transition-all duration-200',
		'border border-border bg-card text-card-foreground rounded-2xl',
		'data-[state=open]:animate-in data-[state=closed]:animate-out',
		'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
		'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
		'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
		'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
	),
	{
		variants: {
			size: {
				sm: 'max-w-sm',
				default: 'max-w-lg',
				lg: 'max-w-xl',
				xl: 'max-w-2xl',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
)

export interface AlertDialogContentProps
	extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>,
		VariantProps<typeof alertDialogContentVariants> {}

const AlertDialogContent = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Content>,
	AlertDialogContentProps
>(({ className, size, children, ...props }, ref) => (
	<AlertDialogPortal>
		<AlertDialogOverlay />
		<AlertDialogPrimitive.Content
			ref={ref}
			className={cn(alertDialogContentVariants({ size }), className)}
			{...props}
		>
			{children}
		</AlertDialogPrimitive.Content>
	</AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-col gap-2 text-center sm:text-left select-none',
			className,
		)}
		{...props}
	/>
)
AlertDialogHeader.displayName = 'AlertDialogHeader'

const AlertDialogFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn(
			'flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2 gap-2 mt-2',
			className,
		)}
		{...props}
	/>
)
AlertDialogFooter.displayName = 'AlertDialogFooter'

const AlertDialogTitle = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Title
		ref={ref}
		className={cn(
			'text-lg font-semibold tracking-tight text-foreground flex items-center gap-2',
			className,
		)}
		{...props}
	/>
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<AlertDialogPrimitive.Description
		ref={ref}
		className={cn('text-sm text-muted-foreground leading-relaxed', className)}
		{...props}
	/>
))
AlertDialogDescription.displayName =
	AlertDialogPrimitive.Description.displayName

export interface AlertDialogActionProps
	extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>,
		VariantProps<typeof buttonVariants> {}

const AlertDialogAction = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Action>,
	AlertDialogActionProps
>(({ className, variant = 'default', size = 'default', ...props }, ref) => (
	<AlertDialogPrimitive.Action
		ref={ref}
		className={cn(buttonVariants({ variant, size }), className)}
		{...props}
	/>
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

export interface AlertDialogCancelProps
	extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>,
		VariantProps<typeof buttonVariants> {}

const AlertDialogCancel = React.forwardRef<
	React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
	AlertDialogCancelProps
>(({ className, variant = 'outline', size = 'default', ...props }, ref) => (
	<AlertDialogPrimitive.Cancel
		ref={ref}
		className={cn(buttonVariants({ variant, size }), className)}
		{...props}
	/>
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

const alertIconVariants = cva(
	'flex size-12 shrink-0 items-center justify-center rounded-full mx-auto sm:mx-0 mb-1 [&_svg]:size-6',
	{
		variants: {
			variant: {
				default: 'bg-primary/10 text-primary',
				destructive: 'bg-destructive/10 text-destructive',
				warning: 'bg-warning/10 text-warning',
				success: 'bg-success/10 text-success',
				info: 'bg-info/10 text-info',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

export interface AlertDialogMediaProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof alertIconVariants> {}

const AlertDialogMedia = ({
	className,
	variant,
	children,
	...props
}: AlertDialogMediaProps) => (
	<div
		className={cn(alertIconVariants({ variant }), className)}
		aria-hidden="true"
		{...props}
	>
		{children}
	</div>
)
AlertDialogMedia.displayName = 'AlertDialogMedia'

export {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogOverlay,
	AlertDialogPortal,
	AlertDialogTitle,
	AlertDialogTrigger,
	alertDialogContentVariants,
}
