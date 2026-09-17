'use client'

import { Badge, Button } from '@app/ui'
import {
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	RotateCcw,
} from 'lucide-react'

export interface CorrigirProvaReviewPage {
	id: string
	previewUrl: string
}

interface CorrigirProvaReviewProps {
	pages: CorrigirProvaReviewPage[]
	isProcessing: boolean
	isRetaking: boolean
	onMovePage: (index: number, direction: -1 | 1) => void
	onRetakeLast: () => void
	onProcess: () => void
}

export function CorrigirProvaReview({
	pages,
	isProcessing,
	isRetaking,
	onMovePage,
	onRetakeLast,
	onProcess,
}: CorrigirProvaReviewProps) {
	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div>
				<h1 className="text-lg font-bold text-foreground">
					Confira as fotos antes de corrigir
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Use as setas para reordenar caso alguma foto esteja fora do lugar.
				</p>
			</div>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{pages.map((page, index) => (
					<div
						key={page.id}
						className="relative aspect-3/4 overflow-hidden rounded-xl border border-border"
					>
						<img
							src={page.previewUrl}
							alt={`Página ${index + 1}`}
							className="h-full w-full object-cover"
						/>
						<Badge
							size="xs"
							variant="secondary"
							className="absolute left-1.5 top-1.5"
						>
							Pág. {index + 1}
						</Badge>

						<div className="absolute inset-x-1.5 bottom-1.5 flex items-center justify-between gap-1">
							<Button
								type="button"
								size="icon-xs"
								variant="secondary"
								disabled={index === 0}
								onClick={() => onMovePage(index, -1)}
								aria-label={`Mover página ${index + 1} para trás`}
							>
								<ChevronLeft />
							</Button>
							<Button
								type="button"
								size="icon-xs"
								variant="secondary"
								disabled={index === pages.length - 1}
								onClick={() => onMovePage(index, 1)}
								aria-label={`Mover página ${index + 1} para frente`}
							>
								<ChevronRight />
							</Button>
						</div>
					</div>
				))}
			</div>

			<div className="flex flex-col gap-2 sm:flex-row">
				<Button
					variant="outline"
					leftIcon={<RotateCcw />}
					isLoading={isRetaking}
					onClick={onRetakeLast}
				>
					Refazer última foto
				</Button>
				<Button
					leftIcon={<CheckCircle2 />}
					fullWidth
					isLoading={isProcessing}
					onClick={onProcess}
				>
					Corrigir
				</Button>
			</div>
		</div>
	)
}
