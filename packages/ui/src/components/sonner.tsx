'use client'

import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Info,
	Loader2,
} from 'lucide-react'
import type * as React from 'react'
import { Toaster as Sonner, toast } from 'sonner'
import { cn } from '../lib/utils'

export type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ className, ...props }: ToasterProps) => {
	return (
		<Sonner
			className={cn('toaster group', className)}
			toastOptions={{
				classNames: {
					toast: cn(
						'group toast font-sans select-none',
						'group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:gap-3',
					),
					description:
						'group-[.toast]:text-muted-foreground group-[.toast]:text-xs leading-relaxed',
					actionButton: cn(
						'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-medium group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:hover:bg-primary/90 transition-colors',
					),
					cancelButton: cn(
						'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-medium group-[.toast]:rounded-lg group-[.toast]:text-xs group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:hover:bg-muted/80 transition-colors',
					),
					closeButton: cn(
						'group-[.toast]:border-border group-[.toast]:bg-background group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground',
					),
					error:
						'!border-destructive/30 !bg-card text-destructive [&>[data-icon]]:text-destructive',
					success:
						'!border-success/30 !bg-card text-success [&>[data-icon]]:text-success',
					warning:
						'!border-warning/30 !bg-card text-warning [&>[data-icon]]:text-warning',
					info: '!border-info/30 !bg-card text-info [&>[data-icon]]:text-info',
				},
			}}
			icons={{
				success: <CheckCircle2 className="size-5 shrink-0 text-success" />,
				info: <Info className="size-5 shrink-0 text-info" />,
				warning: <AlertTriangle className="size-5 shrink-0 text-warning" />,
				error: <AlertCircle className="size-5 shrink-0 text-destructive" />,
				loading: (
					<Loader2 className="size-5 shrink-0 animate-spin text-primary" />
				),
			}}
			{...props}
		/>
	)
}

export { Toaster, toast }
