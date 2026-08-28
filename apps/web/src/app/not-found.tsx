import { Badge, Button } from '@app/ui'
import { ArrowLeft, Home, LifeBuoy, SearchX } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingFooter, LandingHeader } from './(public)/_components'

export const metadata: Metadata = {
	title: 'Página não encontrada — Gabarita.app',
	description: 'A página que você procura não existe ou foi movida.',
}

const options = ['A', 'B', 'C', 'D', 'E']

export default function NotFound() {
	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
			<LandingHeader />

			<main className="flex-1 flex items-center px-6 py-16 md:py-24">
				<div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
					<div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
						<Badge
							variant="destructive-outline"
							size="sm"
							leftIcon={<SearchX />}
						>
							Erro 404
						</Badge>

						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-foreground">
							Essa questão não está no{' '}
							<span className="text-primary underline decoration-primary/30 underline-offset-8">
								gabarito
							</span>
							.
						</h1>

						<p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
							A página que você tentou acessar não existe, foi movida ou o
							endereço foi digitado incorretamente. Vamos te levar de volta para
							um lugar conhecido.
						</p>

						<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-2">
							<Button size="lg" variant="default" asChild leftIcon={<Home />}>
								<Link href="/">Voltar para o início</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								asChild
								leftIcon={<ArrowLeft />}
							>
								<Link href="/dashboard">Ir para o Dashboard</Link>
							</Button>
						</div>

						<div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
							<LifeBuoy className="size-4 text-primary shrink-0" />
							<span>
								Precisa de ajuda? Fale com a gente em{' '}
								<a
									href="mailto:contato@gabarita.app"
									className="font-semibold text-primary hover:underline"
								>
									contato@gabarita.app
								</a>
							</span>
						</div>
					</div>

					<div className="lg:col-span-5 flex justify-center w-full">
						<div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xl text-card-foreground select-none">
							<div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
								<div className="flex items-center gap-2">
									<span className="size-2 rounded-full bg-destructive animate-pulse" />
									<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										Cartão-Resposta
									</span>
								</div>
								<Badge size="xs" variant="destructive-outline">
									Não Encontrada
								</Badge>
							</div>

							<div className="rounded-xl border border-border/50 bg-background/50 p-4 mb-4">
								<div className="flex items-center justify-between text-xs">
									<span className="font-bold text-foreground w-10">404.</span>
									<div className="flex items-center gap-1.5 sm:gap-2">
										{options.map((opt) => (
											<span
												key={opt}
												className="size-7 sm:size-8 rounded-full border border-border/70 text-muted-foreground text-xs flex items-center justify-center"
											>
												{opt}
											</span>
										))}
									</div>
									<div className="w-6 flex justify-end">
										<span className="text-xs font-bold text-destructive">
											✕
										</span>
									</div>
								</div>
							</div>

							<div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border/40">
								<div>
									<span className="text-[11px] text-muted-foreground block">
										Resultado
									</span>
									<div className="flex items-baseline gap-1">
										<strong className="text-xl sm:text-2xl font-black text-foreground">
											0.0
										</strong>
										<span className="text-xs text-muted-foreground">
											/ 10.0
										</span>
									</div>
								</div>

								<div className="text-right">
									<span className="text-[11px] text-muted-foreground block">
										Status
									</span>
									<span className="text-xs font-semibold text-destructive flex items-center gap-1 justify-end">
										<SearchX className="size-3.5" />
										Página inexistente
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			<LandingFooter />
		</div>
	)
}
