'use client'

import { Button, toast } from '@app/ui'
import { Camera, ImageUp, Loader2 } from 'lucide-react'
import * as React from 'react'
import { useCamera } from '@/hooks/use-camera'
import { validateGalleryFile } from './corrigir-prova-camera.utils'

// A leitura por visão computacional alinha a foto pelos 4 marcadores pretos
// impressos nos cantos da prova — por isso o guia precisa refletir a mesma
// proporção de uma folha A4 e destacar exatamente os 4 cantos.
const GUIDE_CORNER_CLASSES = [
	'top-0 left-0',
	'top-0 right-0',
	'bottom-0 left-0',
	'bottom-0 right-0',
]

interface CorrigirProvaCameraProps {
	pageNumber: number
	totalPages: number
	isUploading: boolean
	onCapture: (blob: Blob) => void
}

export function CorrigirProvaCamera({
	pageNumber,
	totalPages,
	isUploading,
	onCapture,
}: CorrigirProvaCameraProps) {
	const { videoRef, isReady, error, captureFrame } = useCamera()
	const galleryInputRef = React.useRef<HTMLInputElement>(null)

	async function handleCapture() {
		const blob = await captureFrame()
		if (blob) onCapture(blob)
	}

	function handleGallerySelected(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0]
		event.target.value = ''
		if (!file) return

		const validationError = validateGalleryFile(file)
		if (validationError) {
			toast.error(validationError)
			return
		}

		onCapture(file)
	}

	return (
		<div className="relative flex flex-1 flex-col overflow-hidden bg-black">
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				className="absolute inset-0 h-full w-full object-cover"
			/>

			{!isReady && !error && (
				<div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
					Abrindo câmera...
				</div>
			)}

			{error && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-sm text-white">
					{error}
					<Button
						type="button"
						leftIcon={<ImageUp />}
						onClick={() => galleryInputRef.current?.click()}
						disabled={isUploading}
					>
						Escolher da galeria
					</Button>
				</div>
			)}

			{!error && (
				<div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 sm:p-10">
					<div className="relative aspect-[595/842] h-full max-w-full rounded-lg border-2 border-dashed border-white/50">
						{GUIDE_CORNER_CLASSES.map((cls) => (
							<span
								key={cls}
								className={`absolute size-3 bg-primary shadow-[0_0_0_2px_white] ${cls}`}
							/>
						))}
					</div>
				</div>
			)}

			<div className="absolute inset-x-0 top-0 flex items-center justify-center pt-6">
				<span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
					Página {pageNumber} de {totalPages}
				</span>
			</div>

			{!error && (
				<div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 pb-8 pt-4">
					<p className="max-w-xs px-6 text-center text-xs text-white/80">
						Encaixe a folha inteira na moldura — os 4 cantos precisam aparecer —
						com boa iluminação e sem sombras.
					</p>
					<div className="flex items-center gap-4">
						<Button
							type="button"
							size="icon"
							shape="pill"
							variant="outline"
							className="size-12 border-white/60 bg-white/10 text-white hover:bg-white/20"
							onClick={() => galleryInputRef.current?.click()}
							disabled={isUploading}
							aria-label="Escolher foto da galeria"
						>
							<ImageUp className="size-5" />
						</Button>
						<Button
							type="button"
							size="icon"
							shape="pill"
							className="size-16 border-4 border-white bg-white/10 hover:bg-white/20"
							onClick={handleCapture}
							disabled={!isReady || isUploading}
							aria-label="Capturar foto da página"
						>
							{isUploading ? (
								<Loader2 className="size-6 animate-spin text-white" />
							) : (
								<Camera className="size-6 text-white" />
							)}
						</Button>
					</div>
				</div>
			)}

			<input
				ref={galleryInputRef}
				type="file"
				accept="image/*"
				capture="environment"
				onChange={handleGallerySelected}
				disabled={isUploading}
				className="sr-only"
			/>
		</div>
	)
}
