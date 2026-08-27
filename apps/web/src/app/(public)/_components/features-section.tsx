import { Badge, Card, CardDescription, CardHeader, CardTitle } from '@app/ui'
import {
	Camera,
	FileSpreadsheet,
	Printer,
	Sparkles,
	UserCheck,
	Zap,
} from 'lucide-react'

export function FeaturesSection() {
	return (
		<section
			id="funcionalidades"
			className="bg-muted/20 border-y border-border/60 py-16 md:py-24 px-6"
		>
			<div className="max-w-6xl mx-auto w-full space-y-12">
				<div className="text-center max-w-2xl mx-auto space-y-3">
					<Badge variant="primary" size="xs">
						Feito Para a Sua Rotina
					</Badge>
					<h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
						O que muda no seu dia a dia
					</h2>
					<p className="text-sm text-muted-foreground">
						Cada recurso foi desenhado para devolver horas de liberdade ao
						professor.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
								<Zap className="size-5" />
							</div>
							<CardTitle className="text-base">Correção em Segundos</CardTitle>
							<CardDescription>
								Corrija uma prova inteira mais rápido do que leva para ler um
								enunciado. Uma turma de 40 alunos é corrigida no intervalo do
								café.
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
								<UserCheck className="size-5" />
							</div>
							<CardTitle className="text-base">
								Você no Controle Total
							</CardTitle>
							<CardDescription>
								Se o aluno rasurar ou fizer dupla marcação, o sistema nunca
								chuta: ele destaca a dúvida na tela para você validar com um
								toque.
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
								<Printer className="size-5" />
							</div>
							<CardTitle className="text-base">
								Caderno Pronto para Impressão
							</CardTitle>
							<CardDescription>
								Gere provas formatadas com diagramação limpa e folha de
								respostas padronizada com identificador automático para cada
								turma.
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
								<Sparkles className="size-5" />
							</div>
							<CardTitle className="text-base">
								Elaboração Rápida de Questões
							</CardTitle>
							<CardDescription>
								Crie avaliações inéditas sobre qualquer assunto em minutos, sem
								perder noites pesquisando ou digitando alternativas do zero.
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
								<FileSpreadsheet className="size-5" />
							</div>
							<CardTitle className="text-base">Zero Erro de Soma</CardTitle>
							<CardDescription>
								Elimine revisões de prova motivadas por erro de cálculo. As
								notas de cada questão são somadas com exatidão matemática.
							</CardDescription>
						</CardHeader>
					</Card>

					<Card>
						<CardHeader>
							<div className="size-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center mb-2">
								<Camera className="size-5" />
							</div>
							<CardTitle className="text-base">
								Use o Seu Próprio Celular
							</CardTitle>
							<CardDescription>
								Não precisa comprar scanners caros ou aparelhos especiais. O
								aplicativo funciona direto na câmera do seu smartphone.
							</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</div>
		</section>
	)
}
