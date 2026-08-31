interface CorrigirProvaScanAnimationProps {
	previewUrl?: string
}

export function CorrigirProvaScanAnimation({
	previewUrl,
}: CorrigirProvaScanAnimationProps) {
	return (
		<div className="relative mx-auto aspect-3/4 w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-muted shadow-lg">
			{previewUrl ? (
				<img
					src={previewUrl}
					alt="Página escaneada"
					className="h-full w-full object-cover"
				/>
			) : (
				<div className="h-full w-full bg-gradient-to-b from-muted to-muted/60" />
			)}

			<div className="absolute inset-0 bg-background/10" />

			<div className="animate-scan-line absolute inset-x-0 h-1 -translate-y-1/2 bg-primary shadow-[0_0_16px_4px_var(--color-primary)]" />
		</div>
	)
}
