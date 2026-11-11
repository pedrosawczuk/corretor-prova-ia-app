'use client'

import { Button } from '@app/ui'
import { Gift } from 'lucide-react'
import Link from 'next/link'
import { useBillingStatus } from '@/hooks/use-billing'
import { formatDate } from '@/lib/date'
import {
	CORTESIA_BANNER_TONE,
	countDaysUntil,
	formatRemainingDays,
	URGENT_ACCESS_GRANT_DAYS,
} from './cortesia-banner.utils'

export function CortesiaBanner() {
	const { data } = useBillingStatus()

	if (!data?.accessGrant || data.subscriptionStatus) {
		return null
	}

	const remainingDays = countDaysUntil(data.accessGrant.expiresAt)
	const isUrgent = remainingDays <= URGENT_ACCESS_GRANT_DAYS
	const tone = CORTESIA_BANNER_TONE[isUrgent ? 'urgent' : 'calm']

	return (
		<div
			className={`flex flex-col gap-2 border-b px-4 py-2.5 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between ${tone.container}`}
		>
			<div className="flex items-center gap-2">
				<Gift className={`size-4 shrink-0 ${tone.icon}`} />
				<span>
					Você está no <strong>{data.plan?.name ?? 'Pro'}</strong> por cortesia
					até <strong>{formatDate(data.accessGrant.expiresAt)}</strong> —{' '}
					{formatRemainingDays(remainingDays)}.
				</span>
			</div>
			{isUrgent && (
				<Button size="sm" variant="outline" asChild>
					<Link href="/dashboard/configuracoes">Assinar para continuar</Link>
				</Button>
			)}
		</div>
	)
}
