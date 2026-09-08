'use client'

import {
	Button,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	RadioGroup,
	RadioGroupItem,
	toast,
} from '@app/ui'
import { ArrowLeftRight } from 'lucide-react'
import * as React from 'react'
import type { RecurringPlanSlug } from '@/hooks/use-billing'
import { useChangePlan } from '@/hooks/use-billing'
import { toastApiError } from '@/lib/api-error-handler'

const RECURRING_PLANS: {
	slug: RecurringPlanSlug
	name: string
	description: string
}[] = [
	{
		slug: 'essencial',
		name: 'Essencial — R$ 39,90/mês',
		description: 'Até 100 correções por foto com IA por mês.',
	},
	{
		slug: 'pro',
		name: 'Pro — R$ 99,90/mês',
		description:
			'Até 500 correções por foto com IA por mês, com exportação em DOCX.',
	},
]

interface TrocarPlanoDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	currentPlanSlug: RecurringPlanSlug
}

export function TrocarPlanoDialog({
	open,
	onOpenChange,
	currentPlanSlug,
}: TrocarPlanoDialogProps) {
	const changePlan = useChangePlan()
	const availablePlans = RECURRING_PLANS.filter(
		(plan) => plan.slug !== currentPlanSlug,
	)
	const [selectedSlug, setSelectedSlug] = React.useState<RecurringPlanSlug>(
		availablePlans[0]?.slug ?? currentPlanSlug,
	)

	function handleConfirm() {
		changePlan.mutate(
			{ planSlug: selectedSlug, immediate: false },
			{
				onSuccess: (data) => {
					toast.success(
						data.effectiveAt
							? `Troca de plano agendada para ${new Date(data.effectiveAt).toLocaleDateString('pt-BR')}, quando sua assinatura renovar.`
							: 'Troca de plano agendada para a próxima renovação.',
					)
					onOpenChange(false)
				},
				onError: (error) => {
					toastApiError(
						error,
						'Não foi possível agendar a troca de plano. Tente novamente.',
					)
				},
			},
		)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="default">
				<DialogHeader>
					<DialogTitle>Trocar de plano</DialogTitle>
					<DialogDescription>
						A troca vale a partir da sua próxima renovação, sem cobrança
						proporcional do ciclo atual.
					</DialogDescription>
				</DialogHeader>

				<RadioGroup
					value={selectedSlug}
					onValueChange={(value) => setSelectedSlug(value as RecurringPlanSlug)}
					className="py-2"
				>
					{availablePlans.map((plan) => (
						<RadioGroupItem
							key={plan.slug}
							value={plan.slug}
							asCard
							label={plan.name}
							description={plan.description}
						/>
					))}
				</RadioGroup>

				<DialogFooter className="gap-2">
					<DialogClose asChild>
						<Button
							type="button"
							variant="outline"
							disabled={changePlan.isPending}
						>
							Cancelar
						</Button>
					</DialogClose>
					<Button
						type="button"
						isLoading={changePlan.isPending}
						leftIcon={<ArrowLeftRight className="size-4" />}
						onClick={handleConfirm}
					>
						Confirmar troca
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
