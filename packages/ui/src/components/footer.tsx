import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '../lib/utils'

const footerVariants = cva(
	'w-full transition-colors select-none text-muted-foreground',
	{
		variants: {
			variant: {
				default: 'bg-card border-t border-border text-card-foreground',
				muted: 'bg-muted/30 border-t border-border',
				bordered: 'bg-background border-t border-border',
				glass: 'bg-background/80 backdrop-blur-md border-t border-border/60',
				minimal: 'bg-transparent border-t border-border/40 py-6',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

export interface FooterProps
	extends React.HTMLAttributes<HTMLElement>,
		VariantProps<typeof footerVariants> {}

const Footer = React.forwardRef<HTMLElement, FooterProps>(
	({ className, variant, ...props }, ref) => {
		return (
			<footer
				ref={ref}
				className={cn(footerVariants({ variant }), className)}
				{...props}
			/>
		)
	},
)
Footer.displayName = 'Footer'

const FooterContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			'mx-auto max-w-6xl px-6 py-12 grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12',
			className,
		)}
		{...props}
	/>
))
FooterContent.displayName = 'FooterContent'

const FooterBrand = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex flex-col gap-3 md:col-span-2', className)}
		{...props}
	/>
))
FooterBrand.displayName = 'FooterBrand'

const FooterGroup = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn('flex flex-col gap-3', className)} {...props} />
))
FooterGroup.displayName = 'FooterGroup'

const FooterGroupTitle = React.forwardRef<
	HTMLHeadingElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h4
		ref={ref}
		className={cn(
			'text-xs font-semibold uppercase tracking-wider text-foreground select-none',
			className,
		)}
		{...props}
	/>
))
FooterGroupTitle.displayName = 'FooterGroupTitle'

const FooterLinkList = React.forwardRef<
	HTMLUListElement,
	React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
	<ul
		ref={ref}
		className={cn('flex flex-col gap-2.5 list-none p-0 m-0', className)}
		{...props}
	/>
))
FooterLinkList.displayName = 'FooterLinkList'

export interface FooterLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	asChild?: boolean
}

const FooterLink = React.forwardRef<HTMLAnchorElement, FooterLinkProps>(
	({ className, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'a'
		return (
			<Comp
				ref={ref}
				className={cn(
					'text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm w-fit cursor-pointer',
					className,
				)}
				{...props}
			/>
		)
	},
)
FooterLink.displayName = 'FooterLink'

const FooterBottom = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			'border-t border-border/60 py-6 px-6 mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground',
			className,
		)}
		{...props}
	/>
))
FooterBottom.displayName = 'FooterBottom'

const FooterSocial = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex items-center gap-3 text-muted-foreground', className)}
		{...props}
	/>
))
FooterSocial.displayName = 'FooterSocial'

export {
	Footer,
	FooterBottom,
	FooterBrand,
	FooterContent,
	FooterGroup,
	FooterGroupTitle,
	FooterLink,
	FooterLinkList,
	FooterSocial,
	footerVariants,
}
