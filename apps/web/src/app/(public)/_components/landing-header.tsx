import {
	Button,
	Header,
	HeaderActions,
	HeaderBrand,
	HeaderNav,
	HeaderNavItem,
} from '@app/ui'
import Link from 'next/link'
import { BrandIcon } from '@/components/brand-icon'

export function LandingHeader() {
	return (
		<Header variant="glass">
			<HeaderBrand asChild>
				<Link href="/" className="flex items-center gap-2.5">
					<BrandIcon className="size-8 shrink-0" />
					<span className="text-base font-bold tracking-tight">
						Corrige<span className="text-primary">Go</span>
					</span>
				</Link>
			</HeaderBrand>

			<HeaderNav>
				<HeaderNavItem href="#como-funciona">Como funciona</HeaderNavItem>
				<HeaderNavItem href="#funcionalidades">Funcionalidades</HeaderNavItem>
				<HeaderNavItem href="#faq">FAQ</HeaderNavItem>
			</HeaderNav>

			<HeaderActions>
				<Button variant="ghost" size="sm" asChild>
					<Link href="/entrar">Entrar</Link>
				</Button>
				<Button variant="default" size="sm" asChild>
					<Link href="/criar-conta">Começar Grátis</Link>
				</Button>
			</HeaderActions>
		</Header>
	)
}
