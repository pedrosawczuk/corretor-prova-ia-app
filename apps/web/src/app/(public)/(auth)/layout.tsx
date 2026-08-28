import { Badge } from '@app/ui'
import {
	Camera,
	CheckCircle2,
	GraduationCap,
	ShieldCheck,
	Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import type * as React from 'react'

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-background">

			<div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 md:p-12">

				<header className="flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
					>
						<div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
							G
						</div>
						<span className="text-lg font-bold tracking-tight text-foreground">
							gabarita<span className="text-primary">.app</span>
						</span>
					</Link>

					<Link
						href="/"
						className="text-xs text-muted-foreground hover:text-foreground transition-colors"
					>
						← Voltar ao início
					</Link>
				</header>

				<main className="my-auto py-8 w-full max-w-md mx-auto">{children}</main>

				<footer className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-6 border-t border-border/40">
					<span>© {new Date().getFullYear()} gabarita.app</span>
					<div className="flex items-center gap-4">
						<Link
							href="/privacidade"
							className="hover:text-foreground transition-colors"
						>
							Privacidade
						</Link>
						<Link
							href="/termos"
							className="hover:text-foreground transition-colors"
						>
							Termos de Uso
						</Link>
					</div>
				</footer>
			</div>

			<div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative bg-gradient-to-br from-[#0c0d0e] via-[#171a1c] to-[#291e52] text-white p-12 flex-col justify-between overflow-hidden border-l border-border/40">

				<div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

				<div className="relative z-10 flex items-center justify-between">
					<Badge
						size="sm"
						variant="secondary"
						className="bg-white/10 text-white border-white/15 backdrop-blur-md"
						leftIcon={<Sparkles className="size-3.5 text-primary" />}
					>
						Assistente do Professor
					</Badge>

					<div className="flex items-center gap-1.5 text-xs text-zinc-400">
						<ShieldCheck className="size-4 text-emerald-400" />
						<span>100% em conformidade com a LGPD</span>
					</div>
				</div>

				<div className="relative z-10 max-w-lg mx-auto space-y-6">
					<div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-2xl space-y-5">
						<div className="flex items-center justify-between border-b border-white/10 pb-4">
							<div className="flex items-center gap-3">
								<div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
									<Camera className="size-5" />
								</div>
								<div>
									<h4 className="text-sm font-semibold text-white">
										Correção Instantânea
									</h4>
									<p className="text-xs text-zinc-400">
										8º Ano A • História Geral
									</p>
								</div>
							</div>
							<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
								10.0 / 10.0
							</span>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs text-zinc-300 bg-white/5 p-2.5 rounded-lg">
								<span>Questão 1: Alternativa C</span>
								<span className="text-emerald-400 font-semibold flex items-center gap-1">
									<CheckCircle2 className="size-3.5" /> Correto
								</span>
							</div>
							<div className="flex items-center justify-between text-xs text-zinc-300 bg-white/5 p-2.5 rounded-lg">
								<span>Questão 2: Alternativa A</span>
								<span className="text-emerald-400 font-semibold flex items-center gap-1">
									<CheckCircle2 className="size-3.5" /> Correto
								</span>
							</div>
							<div className="flex items-center justify-between text-xs text-zinc-300 bg-white/5 p-2.5 rounded-lg">
								<span>Questão 3: Alternativa E</span>
								<span className="text-emerald-400 font-semibold flex items-center gap-1">
									<CheckCircle2 className="size-3.5" /> Correto
								</span>
							</div>
						</div>
					</div>

					<div className="space-y-2 text-center sm:text-left">
						<h3 className="text-2xl font-bold tracking-tight text-white">
							Recupere até 12 horas por semana.
						</h3>
						<p className="text-sm text-zinc-300 leading-relaxed">
							Do gerador de avaliações em PDF à leitura de gabarito por foto: o
							Gabarita.app cuida da rotina mecânica para você focar no ensino.
						</p>
					</div>
				</div>

				<div className="relative z-10 flex items-center gap-3 text-xs text-zinc-400">
					<GraduationCap className="size-4 text-primary" />
					<span>
						Projetado exclusivamente para a produtividade do professor.
					</span>
				</div>
			</div>
		</div>
	)
}

