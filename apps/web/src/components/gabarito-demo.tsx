'use client'

import { Badge, Button } from '@app/ui'
import { Camera, Check, CheckCircle2, RotateCcw } from 'lucide-react'
import * as React from 'react'

const initialQuestions = [
	{ id: 1, label: '1', selected: 'B', correct: 'B', status: 'correct' },
	{ id: 2, label: '2', selected: 'D', correct: 'D', status: 'correct' },
	{ id: 3, label: '3', selected: 'A', correct: 'A', status: 'correct' },
	{ id: 4, label: '4', selected: 'C', correct: 'C', status: 'correct' },
	{ id: 5, label: '5', selected: 'E', correct: 'E', status: 'correct' },
]

export function GabaritoDemo() {
	const [questions, setQuestions] = React.useState(initialQuestions)
	const [isScanning, setIsScanning] = React.useState(false)
	const [scanned, setScanned] = React.useState(false)

	const options = ['A', 'B', 'C', 'D', 'E']

	const handleScan = () => {
		setIsScanning(true)
		setScanned(false)
		setTimeout(() => {
			setIsScanning(false)
			setScanned(true)
		}, 1200)
	}

	const handleSelect = (qId: number, opt: string) => {
		setQuestions((prev) =>
			prev.map((q) => {
				if (q.id === qId) {
					return {
						...q,
						selected: opt,
						status: opt === q.correct ? 'correct' : 'incorrect',
					}
				}
				return q
			}),
		)
		setScanned(true)
	}

	const reset = () => {
		setQuestions(initialQuestions)
		setScanned(false)
		setIsScanning(false)
	}

	const correctCount = questions.filter((q) => q.status === 'correct').length
	const score = ((correctCount / questions.length) * 10).toFixed(1)

	return (
		<div className="relative w-full max-w-md rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xl text-card-foreground select-none">
			<div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
				<div className="flex items-center gap-2">
					<span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
					<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
						Simulador de Correção
					</span>
				</div>
				<Badge size="xs" variant="primary">
					Ao Vivo
				</Badge>
			</div>

			<div className="relative rounded-xl border border-border/50 bg-background/50 p-4 mb-4 overflow-hidden">
				{isScanning && (
					<div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
				)}

				<div className="space-y-2.5">
					{questions.map((q) => (
						<div
							key={q.id}
							className="flex items-center justify-between text-xs"
						>
							<span className="font-bold text-foreground w-5">{q.label}.</span>
							<div className="flex items-center gap-1.5 sm:gap-2">
								{options.map((opt) => {
									const isSelected = q.selected === opt
									const isCorrect = q.correct === opt

									let btnStyle =
										'border-border/70 text-muted-foreground hover:border-primary/50'

									if (isSelected) {
										btnStyle =
											scanned && isCorrect
												? 'bg-emerald-500 text-white border-emerald-500 font-bold shadow-xs'
												: scanned && !isCorrect
													? 'bg-destructive text-white border-destructive font-bold'
													: 'bg-primary text-primary-foreground border-primary font-bold'
									}

									return (
										<button
											key={opt}
											type="button"
											onClick={() => handleSelect(q.id, opt)}
											className={`size-7 sm:size-8 rounded-full border text-xs flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
										>
											{opt}
										</button>
									)
								})}
							</div>

							<div className="w-6 flex justify-end">
								{scanned && q.status === 'correct' && (
									<Check className="size-4 text-emerald-500" />
								)}
								{scanned && q.status === 'incorrect' && (
									<span className="text-xs font-bold text-destructive">✕</span>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="flex items-center justify-between bg-muted/40 p-3 rounded-xl border border-border/40 mb-4">
				<div>
					<span className="text-[11px] text-muted-foreground block">
						Nota Calculada
					</span>
					<div className="flex items-baseline gap-1">
						<strong className="text-xl sm:text-2xl font-black text-foreground">
							{score}
						</strong>
						<span className="text-xs text-muted-foreground">/ 10.0</span>
					</div>
				</div>

				<div className="text-right">
					<span className="text-[11px] text-muted-foreground block">
						Precisão
					</span>
					<span className="text-xs font-semibold text-emerald-500 flex items-center gap-1 justify-end">
						<CheckCircle2 className="size-3.5" />
						{correctCount}/{questions.length} acertos
					</span>
				</div>
			</div>

			<div className="flex gap-2">
				<Button
					size="sm"
					variant="default"
					fullWidth
					isLoading={isScanning}
					leftIcon={<Camera />}
					onClick={handleScan}
				>
					Simular Foto da Prova
				</Button>
				{scanned && (
					<Button
						size="icon-sm"
						variant="outline"
						onClick={reset}
						aria-label="Reiniciar teste"
					>
						<RotateCcw className="size-4" />
					</Button>
				)}
			</div>
		</div>
	)
}
