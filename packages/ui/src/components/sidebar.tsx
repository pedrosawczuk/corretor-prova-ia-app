'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { PanelLeft } from 'lucide-react'
import * as React from 'react'
import { cn } from '../lib/utils'
import { Button } from './button'

const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_MOBILE = '18rem'
const SIDEBAR_WIDTH_ICON = '3.5rem'
const SIDEBAR_KEYBOARD_SHORTCUT = 'b'

type SidebarContext = {
	state: 'expanded' | 'collapsed'
	open: boolean
	setOpen: (open: boolean) => void
	openMobile: boolean
	setOpenMobile: (open: boolean) => void
	isMobile: boolean
	toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
	const context = React.useContext(SidebarContext)
	if (!context) {
		throw new Error('useSidebar must be used within a <SidebarProvider />')
	}
	return context
}

const SidebarProvider = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		defaultOpen?: boolean
		open?: boolean
		onOpenChange?: (open: boolean) => void
	}
>(
	(
		{
			defaultOpen = true,
			open: openProp,
			onOpenChange: setOpenProp,
			className,
			style,
			children,
			...props
		},
		ref,
	) => {
		const [isMobile, setIsMobile] = React.useState(false)
		const [openMobile, setOpenMobile] = React.useState(false)

		const [_open, _setOpen] = React.useState(defaultOpen)
		const open = openProp ?? _open
		const setOpen = React.useCallback(
			(value: boolean | ((value: boolean) => boolean)) => {
				const openState = typeof value === 'function' ? value(open) : value
				if (setOpenProp) {
					setOpenProp(openState)
				} else {
					_setOpen(openState)
				}

				if (typeof document !== 'undefined') {
					// biome-ignore lint/suspicious/noDocumentCookie: client-side cookie persistence for sidebar state
					document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
				}
			},
			[setOpenProp, open],
		)

		React.useEffect(() => {
			const checkMobile = () => {
				setIsMobile(window.innerWidth < 768)
			}
			checkMobile()
			window.addEventListener('resize', checkMobile)
			return () => window.removeEventListener('resize', checkMobile)
		}, [])

		const toggleSidebar = React.useCallback(() => {
			return isMobile
				? setOpenMobile((prev) => !prev)
				: setOpen((prev) => !prev)
		}, [isMobile, setOpen])

		React.useEffect(() => {
			const handleKeyDown = (event: KeyboardEvent) => {
				if (
					event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
					(event.metaKey || event.ctrlKey)
				) {
					event.preventDefault()
					toggleSidebar()
				}
			}

			window.addEventListener('keydown', handleKeyDown)
			return () => window.removeEventListener('keydown', handleKeyDown)
		}, [toggleSidebar])

		const state = open ? 'expanded' : 'collapsed'

		const contextValue = React.useMemo<SidebarContext>(
			() => ({
				state,
				open,
				setOpen,
				isMobile,
				openMobile,
				setOpenMobile,
				toggleSidebar,
			}),
			[state, open, setOpen, isMobile, openMobile, toggleSidebar],
		)

		return (
			<SidebarContext.Provider value={contextValue}>
				<div
					style={
						{
							'--sidebar-width': SIDEBAR_WIDTH,
							'--sidebar-width-mobile': SIDEBAR_WIDTH_MOBILE,
							'--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
							...style,
						} as React.CSSProperties
					}
					className={cn(
						'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-muted/40',
						className,
					)}
					ref={ref}
					{...props}
				>
					{children}
				</div>
			</SidebarContext.Provider>
		)
	},
)
SidebarProvider.displayName = 'SidebarProvider'

const Sidebar = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & {
		side?: 'left' | 'right'
		variant?: 'sidebar' | 'floating' | 'inset'
		collapsible?: 'offcanvas' | 'icon' | 'none'
	}
>(
	(
		{
			side = 'left',
			variant = 'sidebar',
			collapsible = 'icon',
			className,
			children,
			...props
		},
		ref,
	) => {
		const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

		if (collapsible === 'none') {
			return (
				<div
					className={cn(
						'flex h-full w-(--sidebar-width) flex-col bg-card border-r border-border text-card-foreground',
						className,
					)}
					ref={ref}
					{...props}
				>
					{children}
				</div>
			)
		}

		if (isMobile) {
			return (
				<>
					{openMobile && (
						<button
							type="button"
							aria-label="Fechar menu lateral"
							onClick={() => setOpenMobile(false)}
							className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
						/>
					)}
					<div
						ref={ref}
						data-sidebar="sidebar"
						data-mobile="true"
						className={cn(
							'fixed inset-y-0 z-50 flex h-full w-(--sidebar-width) flex-col bg-card border-r border-border text-card-foreground shadow-2xl transition-transform duration-300 ease-in-out',
							side === 'left'
								? openMobile
									? 'left-0 translate-x-0'
									: 'left-0 -translate-x-full'
								: openMobile
									? 'right-0 translate-x-0'
									: 'right-0 translate-x-full',
							className,
						)}
						{...props}
					>
						{children}
					</div>
				</>
			)
		}

		return (
			<div
				ref={ref}
				className="group peer hidden md:block text-card-foreground select-none"
				data-state={state}
				data-collapsible={state === 'collapsed' ? collapsible : ''}
				data-variant={variant}
				data-side={side}
			>
				<div
					className={cn(
						'duration-200 relative h-svh bg-transparent transition-[width] ease-linear',
						'w-(--sidebar-width)',
						'group-data-[collapsible=offcanvas]:w-0',
						'group-data-[side=right]:rotate-180',
						variant === 'floating' || variant === 'inset'
							? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+theme(spacing.4))]'
							: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
					)}
				/>
				<div
					className={cn(
						'duration-200 fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] ease-linear md:flex',
						side === 'left'
							? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
							: 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
						variant === 'floating'
							? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+theme(spacing.4)+2px)]'
							: variant === 'inset'
								? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+theme(spacing.4)+2px)]'
								: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l border-border',
						className,
					)}
					{...props}
				>
					<div
						data-sidebar="sidebar"
						className={cn(
							'flex h-full w-full flex-col bg-card',
							(variant === 'floating' || variant === 'inset') &&
								'rounded-2xl border border-border shadow-sm',
						)}
					>
						{children}
					</div>
				</div>
			</div>
		)
	},
)
Sidebar.displayName = 'Sidebar'

const SidebarTrigger = React.forwardRef<
	React.ElementRef<typeof Button>,
	React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
	const { toggleSidebar } = useSidebar()

	return (
		<Button
			ref={ref}
			data-sidebar="trigger"
			variant="ghost"
			size="icon-sm"
			className={cn(
				'size-8 text-muted-foreground hover:text-foreground',
				className,
			)}
			onClick={(event) => {
				onClick?.(event)
				toggleSidebar()
			}}
			aria-label="Alternar barra lateral (Ctrl+B)"
			{...props}
		>
			<PanelLeft className="size-4" />
			<span className="sr-only">Alternar Barra Lateral</span>
		</Button>
	)
})
SidebarTrigger.displayName = 'SidebarTrigger'

const SidebarHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		data-sidebar="header"
		className={cn(
			'flex flex-col gap-2 p-3 border-b border-border/60',
			className,
		)}
		{...props}
	/>
))
SidebarHeader.displayName = 'SidebarHeader'

const SidebarFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		data-sidebar="footer"
		className={cn(
			'flex flex-col gap-2 p-3 border-t border-border/60 mt-auto',
			className,
		)}
		{...props}
	/>
))
SidebarFooter.displayName = 'SidebarFooter'

const SidebarContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		data-sidebar="content"
		className={cn(
			'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-2 group-data-[collapsible=icon]:overflow-hidden',
			className,
		)}
		{...props}
	/>
))
SidebarContent.displayName = 'SidebarContent'

const SidebarGroup = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		data-sidebar="group"
		className={cn('relative flex w-full min-w-0 flex-col p-1.5', className)}
		{...props}
	/>
))
SidebarGroup.displayName = 'SidebarGroup'

const SidebarGroupLabel = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'div'

	return (
		<Comp
			ref={ref}
			data-sidebar="group-label"
			className={cn(
				'duration-200 flex h-7 shrink-0 items-center rounded-md px-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider outline-none transition-[margin,opacity] ease-linear',
				'group-data-[collapsible=icon]:-mt-7 group-data-[collapsible=icon]:opacity-0',
				className,
			)}
			{...props}
		/>
	)
})
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

const SidebarGroupAction = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			ref={ref}
			data-sidebar="group-action"
			className={cn(
				'absolute right-3 top-3 flex size-5 items-center justify-center rounded-md p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground outline-none transition-colors cursor-pointer',
				'group-data-[collapsible=icon]:hidden',
				className,
			)}
			{...props}
		/>
	)
})
SidebarGroupAction.displayName = 'SidebarGroupAction'

const SidebarGroupContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		data-sidebar="group-content"
		className={cn('w-full text-sm', className)}
		{...props}
	/>
))
SidebarGroupContent.displayName = 'SidebarGroupContent'

const SidebarMenu = React.forwardRef<
	HTMLUListElement,
	React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
	<ul
		ref={ref}
		data-sidebar="menu"
		className={cn('flex w-full min-w-0 flex-col gap-1', className)}
		{...props}
	/>
))
SidebarMenu.displayName = 'SidebarMenu'

const SidebarMenuItem = React.forwardRef<
	HTMLLIElement,
	React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
	<li
		ref={ref}
		data-sidebar="menu-item"
		className={cn('group/menu-item relative list-none', className)}
		{...props}
	/>
))
SidebarMenuItem.displayName = 'SidebarMenuItem'

const sidebarMenuButtonVariants = cva(
	'peer/menu-button flex w-full items-center gap-2.5 overflow-hidden rounded-xl p-2 text-left text-sm font-medium outline-none transition-all hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring active:bg-accent/80 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 cursor-pointer',
	{
		variants: {
			variant: {
				default: 'text-muted-foreground hover:text-foreground',
				active: 'bg-primary/10 text-primary hover:bg-primary/15 font-semibold',
			},
			size: {
				default: 'h-9 text-sm',
				sm: 'h-8 text-xs [&>svg]:size-3.5',
				lg: 'h-11 text-sm [&>svg]:size-5 p-2.5',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export interface SidebarMenuButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof sidebarMenuButtonVariants> {
	asChild?: boolean
	isActive?: boolean
	tooltip?: string
}

const SidebarMenuButton = React.forwardRef<
	HTMLButtonElement,
	SidebarMenuButtonProps
>(
	(
		{
			asChild = false,
			isActive = false,
			variant = 'default',
			size = 'default',
			className,
			...props
		},
		ref,
	) => {
		const Comp = asChild ? Slot : 'button'
		const resolvedVariant = isActive ? 'active' : variant

		return (
			<Comp
				ref={ref}
				data-sidebar="menu-button"
				data-size={size}
				data-active={isActive}
				className={cn(
					sidebarMenuButtonVariants({ variant: resolvedVariant, size }),
					className,
				)}
				{...props}
			/>
		)
	},
)
SidebarMenuButton.displayName = 'SidebarMenuButton'

const SidebarMenuAction = React.forwardRef<
	HTMLButtonElement,
	React.ButtonHTMLAttributes<HTMLButtonElement> & {
		asChild?: boolean
		showOnHover?: boolean
	}
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button'

	return (
		<Comp
			ref={ref}
			data-sidebar="menu-action"
			className={cn(
				'absolute right-1 top-1.5 flex size-6 items-center justify-center rounded-md p-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground outline-none transition-transform cursor-pointer',
				showOnHover &&
					'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 md:opacity-0',
				className,
			)}
			{...props}
		/>
	)
})
SidebarMenuAction.displayName = 'SidebarMenuAction'

const SidebarMenuBadge = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		data-sidebar="menu-badge"
		className={cn(
			'pointer-events-none absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tracking-tight text-primary bg-primary/10 select-none',
			className,
		)}
		{...props}
	/>
))
SidebarMenuBadge.displayName = 'SidebarMenuBadge'

const SidebarInset = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
	return (
		<main
			ref={ref}
			className={cn(
				'relative flex min-h-svh min-w-0 flex-1 flex-col bg-background',
				'peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-2xl md:peer-data-[variant=inset]:shadow-xs',
				className,
			)}
			{...props}
		/>
	)
})
SidebarInset.displayName = 'SidebarInset'

export {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
}
