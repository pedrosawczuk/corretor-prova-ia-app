import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/utils'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Overlay
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
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const dialogContentVariants = cva(
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

export interface DialogContentProps
	extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
		VariantProps<typeof dialogContentVariants> {
	hideClose?: boolean
}

const DialogContent = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Content>,
	DialogContentProps
>(({ className, size, hideClose = false, children, ...props }, ref) => (
	<DialogPortal>
		<DialogOverlay />
		<DialogPrimitive.Content
			ref={ref}
			className={cn(dialogContentVariants({ size }), className)}
			{...props}
		>
			{children}

			{!hideClose && (
				<DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer">
					<X className="size-4" />
					<span className="sr-only">Fechar</span>
				</DialogPrimitive.Close>
			)}
		</DialogPrimitive.Content>
	</DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
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
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
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
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Title>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Title
		ref={ref}
		className={cn(
			'text-lg font-semibold tracking-tight text-foreground flex items-center gap-2',
			className,
		)}
		{...props}
	/>
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
	React.ElementRef<typeof DialogPrimitive.Description>,
	React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
	<DialogPrimitive.Description
		ref={ref}
		className={cn('text-sm text-muted-foreground leading-relaxed', className)}
		{...props}
	/>
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
	dialogContentVariants,
}
