'use client'

import type { Exam, Question } from '@app/shared'
import { Button } from '@app/ui'
import { FileText, Sparkles } from 'lucide-react'
import * as React from 'react'
import { GerarProvaDialog } from './gerar-prova-dialog'
import { ProvaResultado } from './prova-resultado'

export function ProvasDashboard() {
	const [dialogOpen, setDialogOpen] = React.useState(false)
	const [exam, setExam] = React.useState<Exam | null>(null)

	function handleQuestionUpdated(question: Question) {
		setExam(
			(prev) =>
				prev && {
					...prev,
					questions: prev.questions.map((q) =>
						q.id === question.id ? question : q,
					),
				},
		)
	}

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h1 className="text-xl font-bold tracking-tight text-foreground">
						Provas
					</h1>
					<p className="text-sm text-muted-foreground">
						Gere e organize as provas das suas turmas.
					</p>
				</div>
				<Button
					size="sm"
					leftIcon={<Sparkles />}
					onClick={() => setDialogOpen(true)}
				>
					Gerar Prova
				</Button>
			</div>

			{exam ? (
				<ProvaResultado exam={exam} onQuestionUpdated={handleQuestionUpdated} />
			) : (
				<div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
					<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
						<FileText className="size-6" />
					</div>
					<h2 className="text-base font-semibold text-foreground">
						Nenhuma prova criada ainda
					</h2>
					<p className="max-w-sm text-sm text-muted-foreground">
						Em breve você poderá gerar e corrigir provas com a IA do
						Gabarita.app por aqui.
					</p>
				</div>
			)}

			<GerarProvaDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				onGenerated={setExam}
			/>
		</div>
	)
}
