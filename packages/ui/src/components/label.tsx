import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../lib/utils'

const labelVariants = cva(
	'inline-flex items-center text-foreground font-semibold leading-none select-none transition-colors duration-150 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 disabled:cursor-not-allowed disabled:opacity-50',
	{
		variants: {
			size: {
				xs: 'text-xs gap-1',
				sm: 'text-xs tracking-wide gap-1',
				default: 'text-sm gap-1.5',
				lg: 'text-base gap-2',
			},
			weight: {
				normal: 'font-normal',
				medium: 'font-medium',
				semibold: 'font-semibold',
				bold: 'font-bold',
			},
			status: {
				default: 'text-foreground',
				muted: 'text-muted-foreground',
				destructive: 'text-destructive',
				success: 'text-success',
				warning: 'text-warning',
				info: 'text-info',
			},
			disabled: {
				true: 'opacity-50 cursor-not-allowed pointer-events-none',
				false: '',
			},
		},
		defaultVariants: {
			size: 'default',
			weight: 'semibold',
			status: 'default',
			disabled: false,
		},
	},
)

export interface LabelProps
	extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
		VariantProps<typeof labelVariants> {
	/** Exibe o indicador de campo obrigatório (*) */
	required?: boolean
	/** Exibe texto secundário discreto indicando campo opcional */
	optional?: boolean
	/** Ícone ou elemento exibido à esquerda do texto */
	leftIcon?: React.ReactNode
	/** Ícone ou elemento exibido à direita do texto (ex: Tooltip / Help) */
	rightIcon?: React.ReactNode
	/** Subtexto ou descrição auxiliar exibido abaixo do rótulo */
	helperText?: React.ReactNode
	/** Container wrapper customizado para layouts com subtexto */
	containerClassName?: string
}

const Label = React.forwardRef<
	React.ElementRef<typeof LabelPrimitive.Root>,
	LabelProps
>(
	(
		{
			className,
			containerClassName,
			size,
			weight,
			status,
			disabled = false,
			required = false,
			optional = false,
			leftIcon,
			rightIcon,
			helperText,
			children,
			...props
		},
		ref,
	) => {
		const labelElement = (
			<LabelPrimitive.Root
				ref={ref}
				className={cn(
					labelVariants({ size, weight, status, disabled }),
					className,
				)}
				{...props}
			>
				{leftIcon && (
					<span className="shrink-0 text-muted-foreground [&_svg]:size-3.5">
						{leftIcon}
					</span>
				)}

				<span>{children}</span>

				{required && (
					<span
						aria-hidden="true"
						className="text-destructive font-bold text-xs select-none ml-0.5"
						title="Campo obrigatório"
					>
						*
					</span>
				)}

				{optional && !required && (
					<span className="text-muted-foreground font-normal text-[11px] select-none ml-1">
						(opcional)
					</span>
				)}

				{rightIcon && <span className="shrink-0">{rightIcon}</span>}
			</LabelPrimitive.Root>
		)

		if (!helperText) {
			return labelElement
		}

		return (
			<div className={cn('flex flex-col gap-0.5', containerClassName)}>
				{labelElement}
				<p className="text-xs text-muted-foreground leading-normal">
					{helperText}
				</p>
			</div>
		)
	},
)

Label.displayName = 'Label'

export { Label, labelVariants }
