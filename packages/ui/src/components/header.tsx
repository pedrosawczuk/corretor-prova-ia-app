import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../lib/utils'

const headerVariants = cva(
	'w-full flex items-center justify-between transition-all duration-200 select-none z-40',
	{
		variants: {
			variant: {
				default: 'bg-card border-b border-border text-card-foreground',
				glass:
					'sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/60 text-foreground',
				floating:
					'sticky top-3 mx-auto max-w-6xl rounded-2xl bg-card/85 backdrop-blur-md border border-border/80 shadow-md text-card-foreground px-6',
				transparent: 'bg-transparent border-transparent text-foreground',
				bordered: 'bg-background border-b border-border text-foreground',
			},
			size: {
				sm: 'h-12 px-4 gap-3 text-xs',
				default: 'h-16 px-6 gap-4 text-sm',
				lg: 'h-20 px-8 gap-6 text-base',
			},
			sticky: {
				true: 'sticky top-0',
				false: '',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
			sticky: false,
		},
	},
)

export interface HeaderProps
	extends React.HTMLAttributes<HTMLElement>,
		VariantProps<typeof headerVariants> {}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
	({ className, variant, size, sticky, ...props }, ref) => {
		return (
			<header
				ref={ref}
				className={cn(headerVariants({ variant, size, sticky }), className)}
				{...props}
			/>
		)
	},
)
Header.displayName = 'Header'

const HeaderBrand = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'div'
	return (
		<Comp
			ref={ref}
			className={cn(
				'flex items-center gap-2.5 font-bold tracking-tight text-foreground shrink-0 cursor-pointer',
				className,
			)}
			{...props}
		/>
	)
})
HeaderBrand.displayName = 'HeaderBrand'

const HeaderNav = React.forwardRef<
	HTMLElement,
	React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => {
	return (
		<nav
			ref={ref}
			className={cn('hidden md:flex items-center gap-6', className)}
			{...props}
		/>
	)
})
HeaderNav.displayName = 'HeaderNav'

const headerNavItemVariants = cva(
	'inline-flex items-center gap-1.5 font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md cursor-pointer',
	{
		variants: {
			variant: {
				default: 'text-muted-foreground hover:text-foreground text-sm',
				active: 'text-primary font-semibold text-sm',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

export interface HeaderNavItemProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
		VariantProps<typeof headerNavItemVariants> {
	asChild?: boolean
	isActive?: boolean
}

const HeaderNavItem = React.forwardRef<HTMLAnchorElement, HeaderNavItemProps>(
	(
		{ className, asChild = false, isActive = false, variant, ...props },
		ref,
	) => {
		const Comp = asChild ? Slot : 'a'
		const resolvedVariant = isActive ? 'active' : variant

		return (
			<Comp
				ref={ref}
				className={cn(
					headerNavItemVariants({ variant: resolvedVariant }),
					className,
				)}
				{...props}
			/>
		)
	},
)
HeaderNavItem.displayName = 'HeaderNavItem'

const HeaderActions = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			className={cn('flex items-center gap-3 shrink-0 ml-auto', className)}
			{...props}
		/>
	)
})
HeaderActions.displayName = 'HeaderActions'

const HeaderDivider = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	return (
		<div
			ref={ref}
			aria-hidden="true"
			className={cn('h-5 w-px bg-border select-none shrink-0', className)}
			{...props}
		/>
	)
})
HeaderDivider.displayName = 'HeaderDivider'

export {
	Header,
	HeaderActions,
	HeaderBrand,
	HeaderDivider,
	HeaderNav,
	HeaderNavItem,
	headerVariants,
}
