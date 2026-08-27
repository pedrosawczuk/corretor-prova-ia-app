import { Badge, Button } from '@app/ui'
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const GabaritoDemo = dynamic(
	() => import('@/components/gabarito-demo').then((mod) => mod.GabaritoDemo),
	{ ssr: true },
)

export function HeroSection() {
	return (
		<section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
			<div className="lg:col-span-7 flex flex-col items-start gap-6 text-left">
				<Badge variant="primary" size="sm" leftIcon={<Sparkles />}>
					Correção Instantânea de Avaliações
				</Badge>

				<h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15] text-foreground">
					Corrija pilhas de provas em{' '}
					<span className="text-primary underline decoration-primary/30 underline-offset-8">
						minutos
					</span>
					, não em fins de semana inteiros.
				</h1>

				<p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
					Aponte a câmera do seu celular para as folhas de respostas dos seus
					alunos. O Gabarita.app confere as alternativas, calcula a nota e
					aponta rasuras na hora.
				</p>

				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-2">
					<Button
						size="lg"
						variant="default"
						asChild
						rightIcon={<ArrowRight />}
					>
						<Link href="/criar-conta">Começar a Corrigir Grátis</Link>
					</Button>
					<Button size="lg" variant="outline" asChild>
						<Link href="#como-funciona">Ver Demonstração</Link>
					</Button>
				</div>

				<div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
					<CheckCircle className="size-4 text-emerald-500 shrink-0" />
					<span>
						Mais de <strong>4.800 avaliações</strong> corrigidas por professores
						em fase beta
					</span>
				</div>
			</div>

			<div className="lg:col-span-5 flex justify-center w-full">
				<GabaritoDemo />
			</div>
		</section>
	)
}
