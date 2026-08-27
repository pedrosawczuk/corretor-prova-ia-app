import { Button } from '@app/ui'
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function CtaSection() {
	return (
		<section className="px-6 py-16 md:py-24 max-w-6xl mx-auto w-full">
			<div className="relative rounded-3xl bg-gradient-to-br from-[#0c0d0e] via-[#171a1c] to-[#201740] border border-white/10 p-8 sm:p-14 md:p-16 text-white overflow-hidden shadow-2xl">
				<div className="absolute -top-32 -right-32 size-80 rounded-full bg-primary/30 blur-3xl pointer-events-none" />
				<div className="absolute -bottom-32 -left-32 size-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

				<div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium text-white backdrop-blur-md">
						<Sparkles className="size-3.5 text-primary" />
						<span>Acesso Imediato • Sem burocracia</span>
					</div>

					<h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
						Pronto para recuperar seus fins de semana?
					</h2>

					<p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-xl mx-auto">
						Crie sua primeira avaliação ou aponte a câmera para corrigir suas
						folhas de respostas agora mesmo.
					</p>

					<div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
						<Button
							size="lg"
							variant="default"
							asChild
							rightIcon={<ArrowRight />}
							className="h-12 px-8 text-base shadow-lg shadow-primary/30 font-semibold w-full sm:w-auto"
						>
							<Link href="/criar-conta">Criar Conta Gratuita</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							asChild
							className="h-12 px-8 text-base bg-white/5 border-white/15 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto"
						>
							<Link href="/entrar">Já tenho uma conta</Link>
						</Button>
					</div>

					<div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
						<div className="flex items-center gap-1.5">
							<CheckCircle className="size-4 text-emerald-400" />
							<span>Sem cartão de crédito</span>
						</div>
						<div className="flex items-center gap-1.5">
							<CheckCircle className="size-4 text-emerald-400" />
							<span>Pronto em 1 minuto</span>
						</div>
						<div className="flex items-center gap-1.5">
							<CheckCircle className="size-4 text-emerald-400" />
							<span>100% em conformidade com a LGPD</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
