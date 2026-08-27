import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/utils'

const alertVariants = cva(
	'relative w-full rounded-2xl border p-4 text-sm transition-all duration-200 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg]:size-5 select-none shadow-xs',
	{
		variants: {
			variant: {
				default:
					'bg-card text-card-foreground border-border [&>svg]:text-foreground',
				destructive:
					'border-destructive/30 bg-destructive/5 text-destructive [&>svg]:text-destructive dark:border-destructive/40',
				success:
					'border-success/30 bg-success/5 text-success [&>svg]:text-success dark:border-success/40',
				warning:
					'border-warning/30 bg-warning/5 text-warning [&>svg]:text-warning dark:border-warning/40',
				info: 'border-info/30 bg-info/5 text-info [&>svg]:text-info dark:border-info/40',
				subtle:
					'border-border bg-muted/50 text-muted-foreground [&>svg]:text-muted-foreground',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

export interface AlertProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof alertVariants> {
	/** Exibe o ícone padrão correspondente à variante */
	showDefaultIcon?: boolean
	/** Ícone customizado para substituir o padrão */
	icon?: React.ReactNode
	/** Callback executado ao clicar no botão de fechar o alerta */
	onClose?: () => void
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
	(
		{
			className,
			variant = 'default',
			showDefaultIcon = true,
			icon,
			onClose,
			children,
			...props
		},
		ref,
	) => {
		const defaultIcon = React.useMemo(() => {
			if (!showDefaultIcon && !icon) return null
			if (icon) return icon

			switch (variant) {
				case 'destructive':
					return <AlertCircle />
				case 'success':
					return <CheckCircle2 />
				case 'warning':
					return <AlertTriangle />
				case 'info':
					return <Info />
				default:
					return <Info />
			}
		}, [variant, showDefaultIcon, icon])

		return (
			<div
				ref={ref}
				role="alert"
				className={cn(alertVariants({ variant }), className)}
				{...props}
			>
				{defaultIcon}
				<div className="flex-1 min-w-0">{children}</div>
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						aria-label="Fechar aviso"
						className="absolute top-3.5 right-3.5 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-current"
					>
						<X className="size-4" />
					</button>
				)}
			</div>
		)
	},
)
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h5
		ref={ref}
		className={cn(
			'mb-1 font-semibold leading-tight tracking-tight text-foreground text-sm',
			className,
		)}
		{...props}
	/>
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('text-xs text-muted-foreground leading-relaxed', className)}
		{...props}
	/>
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertDescription, AlertTitle, alertVariants }
