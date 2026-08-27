import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
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
import {
	Mail,
	MessageSquare,
	RefreshCw,
	Scale,
	Sparkles,
	UserCheck,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Termos de Uso — Gabarita.app',
	description:
		'Condições claras, justas e sem letras miúdas para a utilização da plataforma Gabarita.app.',
}

export default function TermosPage() {
	const lastUpdate = '26 de Agosto de 2026'

	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
			{/* HEADER */}
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
					<Button variant="ghost" size="sm" asChild>
						<Link href="/entrar">Entrar</Link>
					</Button>
					<Button variant="default" size="sm" asChild>
						<Link href="/criar-conta">Começar Grátis</Link>
					</Button>
				</HeaderActions>
			</Header>

			<main className="flex-1 py-12 md:py-20 px-6 max-w-4xl mx-auto w-full space-y-12">
				{/* Topo do Documento */}
				<div className="space-y-4 text-left border-b border-border/60 pb-8">
					<Badge variant="primary" size="sm" leftIcon={<Scale />}>
						Termos & Condições
					</Badge>
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
						Termos de Uso
					</h1>
					<p className="text-sm text-muted-foreground">
						Última atualização: {lastUpdate} • Termos claros e diretos para o
						uso da nossa plataforma.
					</p>
				</div>

				{/* Resumo em Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1">
								<RefreshCw className="size-4" />
							</div>
							<CardTitle className="text-sm">Cancele Quando Quiser</CardTitle>
						</CardHeader>
						<CardContent className="text-xs text-muted-foreground leading-relaxed">
							Sem fidelidade ou multas de rescisão. Você pode pausar ou cancelar
							a qualquer instante.
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-1">
								<Sparkles className="size-4" />
							</div>
							<CardTitle className="text-sm">Autonomia Pedagógica</CardTitle>
						</CardHeader>
						<CardContent className="text-xs text-muted-foreground leading-relaxed">
							Todas as avaliações e questões geradas pertencem integralmente a
							você.
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<div className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-1">
								<UserCheck className="size-4" />
							</div>
							<CardTitle className="text-sm">Humano no Controle</CardTitle>
						</CardHeader>
						<CardContent className="text-xs text-muted-foreground leading-relaxed">
							O Gabarita.app apoia a correção; a decisão e validação final da
							nota cabem sempre ao professor.
						</CardContent>
					</Card>
				</div>

				{/* Conteúdo Textual Estruturado */}
				<div className="space-y-8 text-sm sm:text-base text-foreground/90 leading-relaxed">
					<section className="space-y-3">
						<h2 className="text-xl font-bold text-foreground">
							1. Aceitação dos Termos
						</h2>
						<p className="text-muted-foreground">
							Ao criar uma conta ou utilizar os serviços do{' '}
							<strong>Gabarita.app</strong>, você concorda expressamente com as
							disposições aqui estabelecidas. Caso não concorde com qualquer
							termo, solicitamos que não utilize a plataforma.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-bold text-foreground">
							2. Descrição dos Serviços
						</h2>
						<p className="text-muted-foreground">
							O Gabarita.app fornece ferramentas de software SaaS destinadas
							exclusivamente a professores, educadores e gestores escolares
							para:
						</p>
						<ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
							<li>Elaboração e diagramação de provas e simulados escolares;</li>
							<li>
								Geração de cadernos de questões e folhas de gabarito para
								impressão;
							</li>
							<li>
								Digitalização por imagem e correção automatizada de folhas de
								respostas com auxílio de algoritmos inteligentes;
							</li>
							<li>Organização de turmas e consolidação de notas.</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-bold text-foreground">
							3. Responsabilidade Pedagógica (Human-in-the-Loop)
						</h2>
						<p className="text-muted-foreground">
							O sistema atua como assistente tecnológico de produtividade. Em
							situações de rasuras, grafias ambíguas ou baixa iluminação da
							foto, o sistema sinaliza a dúvida na tela para homologação do
							professor. A atribuição oficial da nota no diário de classe é de
							responsabilidade exclusiva do docente responsável.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-bold text-foreground">
							4. Propriedade Intelectual e Conteúdo
						</h2>
						<p className="text-muted-foreground">
							• <strong>Seu Conteúdo:</strong> Todas as avaliações, enunciados e
							gabaritos cadastrados ou gerados continuam sendo de sua
							titularidade.
							<br />• <strong>A Plataforma:</strong> O código-fonte, layout,
							marca "Gabarita.app", design system e algoritmos são de
							propriedade exclusiva dos desenvolvedores.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-bold text-foreground">
							5. Planos, Assinaturas e Cancelamento
						</h2>
						<p className="text-muted-foreground">
							Oferecemos plano gratuito de entrada e planos de assinatura com
							recursos avançados. O cancelamento pode ser efetuado a qualquer
							momento direto pelo painel de controle do usuário, sem necessidade
							de aviso prévio ou pagamento de multas rescisórias.
						</p>
					</section>

					<section className="space-y-3 border-t border-border/60 pt-6">
						<h2 className="text-xl font-bold text-foreground">
							6. Contato e Suporte
						</h2>
						<p className="text-muted-foreground">
							Dúvidas sobre estes termos de uso podem ser esclarecidas pelo
							canal:
						</p>
						<p className="font-semibold text-primary">
							<a href="mailto:contato@gabarita.app" className="hover:underline">
								contato@gabarita.app
							</a>
						</p>
					</section>
				</div>
			</main>

			{/* FOOTER */}
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
								<FooterLink href="/#faq">Dúvidas Frequentes</FooterLink>
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
									<Link
										href="/termos"
										className="font-semibold text-foreground"
									>
										Termos de Uso
									</Link>
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
