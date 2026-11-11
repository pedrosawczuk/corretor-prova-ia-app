'use client'

import { Button, Skeleton } from '@app/ui'
import { ArrowRight, CheckCircle2, Gift, MailWarning } from 'lucide-react'
import Link from 'next/link'
import { useInviteLookup } from '@/hooks/use-invite-lookup'
import { formatDate } from '@/lib/date'
import {
	buildInviteAuthHref,
	resolveUnavailableInviteStatus,
	UNAVAILABLE_INVITE_COPY,
} from './convite-content.utils'

const PRO_BENEFITS = [
	'Correção de provas por foto com IA',
	'500 correções por mês',
	'Exportação de provas em DOCX',
	'Sem cartão de crédito e sem cobrança automática',
]

interface ConviteContentProps {
	token: string
}

export function ConviteContent({ token }: ConviteContentProps) {
	const { data: invite, isLoading, isError } = useInviteLookup(token)

	if (isLoading) {
		return (
			<div className="w-full space-y-4">
				<Skeleton className="size-12 rounded-2xl" />
				<Skeleton className="h-9 w-3/4" />
				<Skeleton className="h-16 w-full" />
				<Skeleton className="h-11 w-full" />
			</div>
		)
	}

	if (isError || !invite || invite.status !== 'pending') {
		const copy = UNAVAILABLE_INVITE_COPY[resolveUnavailableInviteStatus(invite)]

		return (
			<div className="w-full space-y-6 text-left">
				<div className="size-12 rounded-2xl bg-warning/10 text-warning flex items-center justify-center">
					<MailWarning className="size-6" />
				</div>

				<div className="space-y-2">
					<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
						{copy.title}
					</h1>
					<p className="text-sm text-muted-foreground leading-relaxed">
						{isError
							? 'Não foi possível carregar o convite agora. Tente novamente em instantes.'
							: copy.description}
					</p>
				</div>

				<Button variant="outline" fullWidth size="lg" asChild>
					<Link href="/entrar">Ir para o login</Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="w-full space-y-6 text-left">
			<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
				<Gift className="size-6" />
			</div>

			<div className="space-y-2">
				<h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
					Você ganhou {invite.grantDurationMonths} meses do plano Pro
				</h1>
				<p className="text-sm text-muted-foreground leading-relaxed">
					Este convite é para{' '}
					<strong className="text-foreground">{invite.email}</strong>.{' '}
					{invite.hasAccount
						? 'Entre com este e-mail para ativar a cortesia.'
						: 'Crie sua conta com este e-mail para ativar a cortesia.'}
				</p>
			</div>

			<ul className="space-y-2.5">
				{PRO_BENEFITS.map((benefit) => (
					<li
						key={benefit}
						className="flex items-center gap-2.5 text-sm text-foreground"
					>
						<CheckCircle2 className="size-4 text-success shrink-0" />
						{benefit}
					</li>
				))}
			</ul>

			<Button
				fullWidth
				size="lg"
				rightIcon={<ArrowRight className="size-4" />}
				asChild
			>
				<Link href={buildInviteAuthHref(invite)}>
					{invite.hasAccount ? 'Entrar e ativar' : 'Criar conta grátis'}
				</Link>
			</Button>

			<p className="text-xs text-muted-foreground">
				Aceite até {formatDate(invite.expiresAt)}. Os{' '}
				{invite.grantDurationMonths} meses começam a contar no seu primeiro
				acesso.
			</p>
		</div>
	)
}
