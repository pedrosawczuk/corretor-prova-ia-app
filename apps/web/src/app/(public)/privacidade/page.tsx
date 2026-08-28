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
	Lock,
	Mail,
	MessageSquare,
	ShieldCheck,
	Trash2,
	UserCheck,
} from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Política de Privacidade — Gabarita.app',
	description:
		'Transparência total sobre como tratamos e protegemos seus dados e avaliações em conformidade com a LGPD.',
}

export default function PrivacidadePage() {
	const lastUpdate = '26 de Agosto de 2026'

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
					<Button variant="ghost" size="sm" asChild>
						<Link href="/entrar">Entrar</Link>
					</Button>
					<Button variant="default" size="sm" asChild>
						<Link href="/criar-conta">Começar Grátis</Link>
					</Button>
				</HeaderActions>
			</Header>

			<main className="flex-1 py-12 md:py-20 px-6 max-w-4xl mx-auto w-full space-y-12">

				<div className="space-y-4 text-left border-b border-border/60 pb-8">
					<Badge variant="primary" size="sm" leftIcon={<ShieldCheck />}>
						Privacidade & LGPD
					</Badge>
					<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
						Política de Privacidade
					</h1>
					<p className="text-sm text-muted-foreground">
						Última atualização: {lastUpdate} • Em conformidade com a Lei Geral
						de Proteção de Dados (Lei nº 13.709/2018).
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<Card>
						<CardHeader className="pb-2">
							<div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1">
								<UserCheck className="size-4" />
							</div>
							<CardTitle className="text-sm">Sem Dados de Menores</CardTitle>
						</CardHeader>
						<CardContent className="text-xs text-muted-foreground leading-relaxed">
							Não exigimos cadastro de CPF, matrícula ou dados pessoais de
							alunos para corrigir provas.
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-1">
								<Lock className="size-4" />
							</div>
							<CardTitle className="text-sm">Fotos Criptografadas</CardTitle>
						</CardHeader>
						<CardContent className="text-xs text-muted-foreground leading-relaxed">
							As imagens enviadas para leitura de gabarito são processadas sob
							criptografia de ponta a ponta.
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<div className="size-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-1">
								<Trash2 className="size-4" />
							</div>
							<CardTitle className="text-sm">Controle Total</CardTitle>
						</CardHeader>
						<CardContent className="text-xs text-muted-foreground leading-relaxed">
							Você pode excluir suas turmas, provas e fotos a qualquer momento
							com apenas um clique.
						</CardContent>
					</Card>
				</div>

				<div className="space-y-8 text-sm sm:text-base text-foreground/90 leading-relaxed">
					<section className="space-y-3">
						<h2 className="text-xl font-bold text-foreground">
							1. Compromisso com a Privacidade Docente e Escolar
						</h2>
						<p className="text-muted-foreground">
							O <strong>Gabarita.app</strong> foi concebido desde a sua primeira
							linha de código com o princípio de <em>Privacy by Design</em>.
							Nosso objetivo é acelerar a rotina do professor sem criar riscos
							de conformidade ou exposição de informações escolares.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-bold text-foreground">
							2. Dados Coletados e Finalidade
						</h2>
						<p className="text-muted-foreground">
							Coletamos apenas o estritamente necessário para o funcionamento da
							plataforma:
						</p>
						<ul className="list-disc pl-6 space-y-2 text-muted-foreground">
							<li>
								<strong>Dados do Professor:</strong> Nome completo, endereço de
								e-mail e credenciais de acesso para autenticação e gestão da
								conta.
							</li>
							<li>
								<strong>Dados Pedagógicos Criados pelo Usuário:</strong> Nomes
								das turmas (agrupadores), disciplinas, temas de provas e
								gabaritos cadastrados.
							</li>
							<li>
								<strong>Imagens de Folhas de Respostas:</strong> Fotografias
								capturadas pela câmera exclusivamente para processamento de
								reconhecimento visual das alternativas preenchidas e cálculo
								matemático da nota.
							</li>
						</ul>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-bold text-foreground">
							3. Tratamento de Dados de Menores e Alunos
						</h2>
						<p className="text-muted-foreground">
							Em respeito ao Estatuto da Criança e do Adolescente (ECA) e ao
							artigo 14 da LGPD:
						</p>
						<div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-muted-foreground space-y-2">
							<p>
								• O Gabarita.app <strong>não cria perfis de estudantes</strong>,
								não armazena dados de contato de menores e não realiza
								cruzamento de dados escolares para fins comerciais.
							</p>
							<p>
								• As fotos de gabaritos servem puramente para apuração de
								acertos/erros no momento da correção pelo professor.
							</p>
						</div>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-bold text-foreground">
							4. Não Compartilhamento com Terceiros
						</h2>
						<p className="text-muted-foreground">
							O Gabarita.app{' '}
							<strong>nunca comercializa, aluga ou compartilha</strong> seus
							dados pedagógicos ou imagens de provas com empresas de
							publicidade, corretores de dados ou terceiros não autorizados.
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-xl font-bold text-foreground">
							5. Seus Direitos (LGPD)
						</h2>
						<p className="text-muted-foreground">
							Como titular dos dados, você tem direito a:
						</p>
						<ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
							<li>
								Confirmar a existência de tratamento e acessar seus dados;
							</li>
							<li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
							<li>
								Solicitar a exclusão definitiva da sua conta e de todo o
								histórico de avaliações a qualquer momento;
							</li>
							<li>Revogar consentimentos concedidos anteriormente.</li>
						</ul>
					</section>

					<section className="space-y-3 border-t border-border/60 pt-6">
						<h2 className="text-xl font-bold text-foreground">
							6. Canal de Atendimento do Encarregado de Dados (DPO)
						</h2>
						<p className="text-muted-foreground">
							Para qualquer solicitação sobre privacidade e proteção de dados,
							entre em contato diretamente pelo e-mail:
						</p>
						<p className="font-semibold text-primary">
							<a
								href="mailto:privacidade@gabarita.app"
								className="hover:underline"
							>
								privacidade@gabarita.app
							</a>
						</p>
					</section>
				</div>
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
								<FooterLink href="/#faq">Dúvidas Frequentes</FooterLink>
							</li>
						</FooterLinkList>
					</FooterGroup>

					<FooterGroup>
						<FooterGroupTitle>Legal & Privacidade</FooterGroupTitle>
						<FooterLinkList>
							<li>
								<FooterLink asChild>
									<Link
										href="/privacidade"
										className="font-semibold text-foreground"
									>
										Política de Privacidade
									</Link>
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

