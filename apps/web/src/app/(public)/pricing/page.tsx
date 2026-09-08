import {
	Badge,
	Button,
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	Footer,
	FooterBottom,
	FooterBrand,
	FooterContent,
	FooterGroup,
	FooterGroupTitle,
	FooterLink,
	FooterLinkList,
	FooterSocial,
	Header,
	HeaderActions,
	HeaderBrand,
	HeaderNav,
	HeaderNavItem,
} from '@app/ui'
import { Check, FileDown, Mail, MessageSquare, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAuthSession } from '@/lib/auth-server'

export const metadata: Metadata = {
	title: 'Planos e Preços — Gabarita.app',
	description:
		'Escolha o plano ideal para corrigir provas por foto com IA: pacote avulso ou assinatura mensal com correções ilimitadas dentro da sua cota.',
}

interface PricingPlan {
	slug: 'avulso' | 'essencial' | 'pro'
	name: string
	price: string
	period: string
	description: string
	features: string[]
	highlight?: boolean
	cta: string
}

const PLANS: PricingPlan[] = [
	{
		slug: 'avulso',
		name: 'Avulso',
		price: 'R$ 19,90',
		period: 'pacote de 10 correções',
		description:
			'Cobrança única, sem assinatura. Ideal para testar a plataforma ou para uso esporádico.',
		features: [
			'10 correções por foto com IA',
			'Créditos não expiram',
			'Geração de provas com IA ilimitada',
			'Exportação em PDF',
		],
		cta: 'Comprar pacote',
	},
	{
		slug: 'essencial',
		name: 'Essencial',
		price: 'R$ 39,90',
		period: 'por mês',
		description:
			'Para quem corrige provas com frequência ao longo do mês em uma ou mais turmas.',
		features: [
			'Até 100 correções por foto com IA/mês',
			'Geração de provas com IA ilimitada',
			'Turmas e provas ilimitadas',
			'Exportação em PDF',
		],
		highlight: true,
		cta: 'Assinar Essencial',
	},
	{
		slug: 'pro',
		name: 'Pro',
		price: 'R$ 99,90',
		period: 'por mês',
		description:
			'Para quem corrige em volume alto e quer editar as provas geradas em Word.',
		features: [
			'Até 500 correções por foto com IA/mês',
			'Geração de provas com IA ilimitada',
			'Turmas e provas ilimitadas',
			'Exportação em PDF e DOCX',
		],
		cta: 'Assinar Pro',
	},
]

export default async function PricingPage() {
	const session = await getAuthSession()
	const isAuthenticated = Boolean(session)

	function planHref(slug: PricingPlan['slug']) {
		return isAuthenticated
			? `/dashboard/configuracoes?plano=${slug}`
			: '/criar-conta'
	}

	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
			<Header variant="glass">
				<HeaderBrand asChild>
					<Link href="/" className="flex items-center gap-2.5">
						<div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
							G
						</div>
						<span className="text-base font-bold tracking-tight">
							gabarita<span className="text-primary">.app</span>
						</span>
					</Link>
				</HeaderBrand>

				<HeaderNav>
					<HeaderNavItem href="/#como-funciona">Como funciona</HeaderNavItem>
					<HeaderNavItem href="/#funcionalidades">
						Funcionalidades
					</HeaderNavItem>
					<HeaderNavItem href="/#faq">FAQ</HeaderNavItem>
				</HeaderNav>

				<HeaderActions>
					{isAuthenticated ? (
						<Button variant="default" size="sm" asChild>
							<Link href="/dashboard">Ir para o painel</Link>
						</Button>
					) : (
						<>
							<Button variant="ghost" size="sm" asChild>
								<Link href="/entrar">Entrar</Link>
							</Button>
							<Button variant="default" size="sm" asChild>
								<Link href="/criar-conta">Começar Grátis</Link>
							</Button>
						</>
					)}
				</HeaderActions>
			</Header>

			<main className="flex-1 py-12 md:py-20 px-6 max-w-6xl mx-auto w-full space-y-12">
				<div className="space-y-4 text-center max-w-2xl mx-auto">
					<Badge variant="primary" size="sm" leftIcon={<Sparkles />}>
						Planos e Preços
					</Badge>
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
						Escolha como quer corrigir suas provas
					</h1>
					<p className="text-sm sm:text-base text-muted-foreground">
						Cada correção por foto conta como 1 uso. Sem cartão de crédito
						escondido, sem fidelidade — cancele quando quiser.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
					{PLANS.map((plan) => (
						<Card
							key={plan.slug}
							variant={plan.highlight ? 'primary' : 'default'}
							className="flex flex-col"
						>
							<CardHeader className="space-y-3 pb-2">
								{plan.highlight && (
									<Badge variant="primary" size="sm" className="w-fit">
										Mais popular
									</Badge>
								)}
								<div>
									<h2 className="text-lg font-bold text-foreground">
										{plan.name}
									</h2>
									<p className="text-xs text-muted-foreground mt-1">
										{plan.description}
									</p>
								</div>
								<div className="flex items-baseline gap-1.5">
									<span className="text-3xl font-extrabold text-foreground">
										{plan.price}
									</span>
									<span className="text-xs text-muted-foreground">
										{plan.period}
									</span>
								</div>
							</CardHeader>

							<CardContent className="flex-1">
								<ul className="space-y-2.5">
									{plan.features.map((feature) => (
										<li
											key={feature}
											className="flex items-start gap-2 text-sm text-foreground/90"
										>
											{feature.includes('DOCX') ? (
												<FileDown className="size-4 mt-0.5 text-primary shrink-0" />
											) : (
												<Check className="size-4 mt-0.5 text-primary shrink-0" />
											)}
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>

							<CardFooter>
								<Button
									variant={plan.highlight ? 'default' : 'outline'}
									fullWidth
									asChild
								>
									<Link href={planHref(plan.slug)}>{plan.cta}</Link>
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>

				<p className="text-xs text-muted-foreground text-center max-w-lg mx-auto">
					Uma correção que falhe no processamento (foto ilegível, por exemplo)
					também consome 1 uso da sua cota. Trocas de plano valem a partir da
					próxima renovação, sem cobrança proporcional.
				</p>
			</main>

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
					</FooterBrand>

					<FooterGroup>
						<FooterGroupTitle>Navegação</FooterGroupTitle>
						<FooterLinkList>
							<li>
								<FooterLink href="/#como-funciona">Como funciona</FooterLink>
							</li>
							<li>
								<FooterLink href="/#funcionalidades">
									Funcionalidades
								</FooterLink>
							</li>
							<li>
								<FooterLink asChild>
									<Link
										href="/pricing"
										className="font-semibold text-foreground"
									>
										Planos e Preços
									</Link>
								</FooterLink>
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
						<FooterLink
							href="https://wa.me/5511999999999"
							aria-label="WhatsApp"
						>
							<MessageSquare className="size-4" />
						</FooterLink>
					</FooterSocial>
				</FooterBottom>
			</Footer>
		</div>
	)
}
