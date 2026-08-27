import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/utils'

const badgeVariants = cva(
	'inline-flex items-center justify-center font-medium transition-all duration-150 select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
				primary:
					'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
				secondary:
					'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
				outline:
					'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
				destructive:
					'bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90',
				'destructive-outline':
					'border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 hover:border-destructive/50',
				success:
					'bg-success text-success-foreground shadow-xs hover:bg-success/90',
				'success-outline':
					'border border-success/30 text-success bg-success/5 hover:bg-success/10 hover:border-success/50',
				warning:
					'bg-warning text-warning-foreground shadow-xs hover:bg-warning/90',
				'warning-outline':
					'border border-warning/30 text-warning bg-warning/5 hover:bg-warning/10 hover:border-warning/50',
				info: 'bg-info text-info-foreground shadow-xs hover:bg-info/90',
				'info-outline':
					'border border-info/30 text-info bg-info/5 hover:bg-info/10 hover:border-info/50',
				subtle:
					'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
				ghost:
					'hover:bg-accent hover:text-accent-foreground active:bg-accent/80',
			},
			size: {
				xs: 'h-4.5 px-1.5 text-[10px] font-medium rounded-xs gap-1 [&_svg]:size-2.5',
				sm: 'h-5 px-2 text-xs font-medium rounded-sm gap-1 [&_svg]:size-3',
				default:
					'h-6 px-2.5 text-xs font-semibold rounded-md gap-1.5 [&_svg]:size-3.5',
				lg: 'h-7 px-3 text-sm font-semibold rounded-lg gap-2 [&_svg]:size-4',
			},
			shape: {
				default: '',
				pill: 'rounded-full',
				square: 'rounded-none',
			},
			interactive: {
				true: 'cursor-pointer hover:scale-[1.02] active:scale-[0.97] motion-reduce:transform-none',
				false: '',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			shape: 'default',
			interactive: false,
		},
	},
)

const dotVariants = cva('rounded-full shrink-0', {
	variants: {
		size: {
			xs: 'size-1',
			sm: 'size-1.5',
			default: 'size-2',
			lg: 'size-2.5',
		},
	},
	defaultVariants: {
		size: 'default',
	},
})

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {
	/** Renderiza como componente filho via Radix Slot (ex: Link ou Anchor) */
	asChild?: boolean
	/** Exibe um indicador circular de status (dot) */
	dot?: boolean
	/** Faz o dot piscar suavemente para indicar atividade contínua */
	pulse?: boolean
	/** Cor customizada para a classe do dot */
	dotClassName?: string
	/** Ícone exibido à esquerda */
	leftIcon?: React.ReactNode
	/** Ícone exibido à direita */
	rightIcon?: React.ReactNode
	/** Callback executado ao clicar no botão de remover a tag */
	onDismiss?: (e: React.MouseEvent<HTMLButtonElement>) => void
	/** Label de acessibilidade para o botão de dismiss */
	dismissLabel?: string
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
	(
		{
			className,
			variant,
			size,
			shape,
			interactive,
			asChild = false,
			dot = false,
			pulse = false,
			dotClassName,
			leftIcon,
			rightIcon,
			onDismiss,
			dismissLabel = 'Remover badge',
			children,
			...props
		},
		ref,
	) => {
		const isInteractive = interactive || Boolean(props.onClick) || asChild

		if (asChild) {
			return (
				<Slot
					ref={ref}
					className={cn(
						badgeVariants({
							variant,
							size,
							shape,
							interactive: isInteractive,
							className,
						}),
					)}
					{...props}
				>
					{children}
				</Slot>
			)
		}

		return (
			<div
				ref={ref}
				className={cn(
					badgeVariants({
						variant,
						size,
						shape,
						interactive: isInteractive,
						className,
					}),
				)}
				{...props}
			>
				{dot && (
					<span
						className={cn(
							dotVariants({ size }),
							'bg-current opacity-80',
							pulse && 'animate-pulse',
							dotClassName,
						)}
						aria-hidden="true"
					/>
				)}

				{leftIcon}

				<span>{children}</span>

				{rightIcon}

				{onDismiss && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation()
							onDismiss(e)
						}}
						aria-label={dismissLabel}
						className="inline-flex items-center justify-center -mr-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-current"
					>
						<X className="size-3" />
					</button>
				)}
			</div>
		)
	},
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
