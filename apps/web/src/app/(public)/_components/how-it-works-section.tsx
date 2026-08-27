import {
	Badge,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@app/ui'
import { Camera, CheckCircle } from 'lucide-react'

export function HowItWorksSection() {
	return (
		<section
			id="como-funciona"
			className="py-16 md:py-24 px-6 max-w-6xl mx-auto w-full space-y-12"
		>
			<div className="text-center max-w-2xl mx-auto space-y-3">
				<Badge variant="primary" size="xs">
					Simples e Direto
				</Badge>
				<h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
					Como funciona na prática
				</h2>
				<p className="text-sm text-muted-foreground">
					Três passos objetivos para zerar a pilha de provas da sua mesa.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<Card className="flex flex-col justify-between">
					<CardHeader>
						<div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-2">
							1
						</div>
						<CardTitle>Crie o Gabarito</CardTitle>
						<CardDescription>
							Defina as respostas corretas em segundos, ou use nosso assistente
							para gerar a prova completa diagramada para impressão.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="p-3 rounded-xl bg-muted/40 text-xs font-mono text-muted-foreground border">
							1-B • 2-D • 3-A • 4-C • 5-E
						</div>
					</CardContent>
				</Card>

				<Card className="flex flex-col justify-between">
					<CardHeader>
						<div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-2">
							2
						</div>
						<CardTitle>Escaneie as Folhas</CardTitle>
						<CardDescription>
							Aponte a câmera do seu smartphone para as folhas de respostas dos
							alunos em sequência contínua, sem complicação.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground border">
							<Camera className="size-4 text-emerald-500" />
							<span>Leitura instantânea por foto</span>
						</div>
					</CardContent>
				</Card>

				<Card className="flex flex-col justify-between">
					<CardHeader>
						<div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base mb-2">
							3
						</div>
						<CardTitle>Receba a Nota na Hora</CardTitle>
						<CardDescription>
							A nota total e o acerto questão a questão são calculados
							automaticamente. Se houver rasura, você confirma com um toque.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
							<span>Resultado: 9.0 / 10.0</span>
							<CheckCircle className="size-4" />
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	)
}
