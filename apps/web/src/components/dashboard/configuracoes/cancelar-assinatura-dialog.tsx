'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	toast,
} from '@app/ui'
import { CalendarClock } from 'lucide-react'
import { useCancelSubscription } from '@/hooks/use-billing'
import { toastApiError } from '@/lib/api-error-handler'
import { formatDate } from '@/lib/date'

interface CancelarAssinaturaDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	currentPeriodEnd: string
}

export function CancelarAssinaturaDialog({
	open,
	onOpenChange,
	currentPeriodEnd,
}: CancelarAssinaturaDialogProps) {
	const cancelSubscription = useCancelSubscription()

	function handleCancel() {
		cancelSubscription.mutate(undefined, {
			onSuccess: () => {
				toast.success(
					'Assinatura cancelada. Seu acesso continua até o fim do ciclo já pago.',
				)
				onOpenChange(false)
			},
			onError: (error) => {
				toastApiError(
					error,
					'Não foi possível cancelar sua assinatura. Tente novamente.',
				)
			},
		})
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogMedia variant="warning">
					<CalendarClock />
				</AlertDialogMedia>
				<AlertDialogHeader>
					<AlertDialogTitle>Cancelar sua assinatura?</AlertDialogTitle>
					<AlertDialogDescription>
						Você não será cobrado novamente. Seu plano atual continua ativo e
						todas as suas turmas, provas e correções permanecem salvas até{' '}
						<strong className="text-foreground">
							{formatDate(currentPeriodEnd)}
						</strong>
						, quando o acesso à cota do plano se encerra.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={cancelSubscription.isPending}>
						Manter assinatura
					</AlertDialogCancel>
					<AlertDialogAction
						variant="destructive"
						disabled={cancelSubscription.isPending}
						onClick={(event) => {
							event.preventDefault()
							handleCancel()
						}}
					>
						{cancelSubscription.isPending
							? 'Cancelando...'
							: 'Cancelar assinatura'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
