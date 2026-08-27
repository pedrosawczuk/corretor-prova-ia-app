import {
	Footer,
	FooterBottom,
	FooterBrand,
	FooterContent,
	FooterGroup,
	FooterGroupTitle,
	FooterLink,
	FooterLinkList,
	FooterSocial,
} from '@app/ui'
import { Mail, MessageSquare, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export function LandingFooter() {
	return (
		<Footer variant="default">
			<FooterContent>
				<FooterBrand>
					<div className="flex items-center gap-2.5">
						<div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
							G
						</div>
						<span className="text-base font-bold tracking-tight">
							gabarita<span className="text-primary">.app</span>
						</span>
					</div>
					<p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
						Assistente inteligente para elaboração, diagramação e correção
						automática de avaliações escolares.
					</p>
					<div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
						<ShieldCheck className="size-4 text-emerald-500" />
						<span>Plataforma em conformidade com a LGPD</span>
					</div>
				</FooterBrand>

				<FooterGroup>
					<FooterGroupTitle>Navegação</FooterGroupTitle>
					<FooterLinkList>
						<li>
							<FooterLink href="#como-funciona">Como funciona</FooterLink>
						</li>
						<li>
							<FooterLink href="#funcionalidades">Funcionalidades</FooterLink>
						</li>
						<li>
							<FooterLink href="#faq">Dúvidas Frequentes</FooterLink>
						</li>
					</FooterLinkList>
				</FooterGroup>

				<FooterGroup>
					<FooterGroupTitle>Legal & Privacidade</FooterGroupTitle>
					<FooterLinkList>
						<li>
							<FooterLink asChild>
								<Link href="/privacidade">Política de Privacidade</Link>
							</FooterLink>
						</li>
						<li>
							<FooterLink asChild>
								<Link href="/termos">Termos de Uso</Link>
							</FooterLink>
						</li>
					</FooterLinkList>
				</FooterGroup>

				<FooterGroup>
					<FooterGroupTitle>Fale Conosco</FooterGroupTitle>
					<FooterLinkList>
						<li>
							<FooterLink href="mailto:contato@gabarita.app">
								contato@gabarita.app
							</FooterLink>
						</li>
						<li>
							<FooterLink
								href="https://wa.me/5511999999999"
								target="_blank"
								rel="noopener noreferrer"
							>
								WhatsApp Suporte
							</FooterLink>
						</li>
					</FooterLinkList>
				</FooterGroup>
			</FooterContent>

			<FooterBottom>
				<span>
					© {new Date().getFullYear()} gabarita.app — Todos os direitos
					reservados.
				</span>
				<FooterSocial>
					<FooterLink
						href="mailto:contato@gabarita.app"
						aria-label="E-mail de Contato"
					>
						<Mail className="size-4" />
					</FooterLink>
					<FooterLink href="https://wa.me/5511999999999" aria-label="WhatsApp">
						<MessageSquare className="size-4" />
					</FooterLink>
				</FooterSocial>
			</FooterBottom>
		</Footer>
	)
}
