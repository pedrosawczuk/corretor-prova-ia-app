import { MonitorSmartphone, ShieldCheck, UserRound } from 'lucide-react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PerfilSection } from '@/components/dashboard/configuracoes/perfil-section'
import { SegurancaSection } from '@/components/dashboard/configuracoes/seguranca-section'
import { SessoesSection } from '@/components/dashboard/configuracoes/sessoes-section'
import { getAuthSession, getAuthSessionsList } from '@/lib/auth-server'

export const metadata: Metadata = {
	title: 'Configurações — Gabarita.app',
	description: 'Gerencie seu perfil, segurança e sessões ativas.',
}

const NAV_ITEMS = [
	{ id: 'perfil', label: 'Perfil', icon: UserRound },
	{ id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
	{ id: 'sessoes', label: 'Sessões', icon: MonitorSmartphone },
]

export default async function ConfiguracoesPage() {
	const authSession = await getAuthSession()

	if (!authSession) {
		redirect('/entrar')
	}

	const sessions = await getAuthSessionsList()

	return (
		<div className="flex flex-1 flex-col gap-6 p-6 bg-muted/20">
			<div>
				<h1 className="text-xl font-bold tracking-tight text-foreground">
					Configurações
				</h1>
				<p className="text-sm text-muted-foreground">
					Gerencie seu perfil, segurança e sessões ativas.
				</p>
			</div>

			<div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
				{NAV_ITEMS.map((item) => (
					<a
						key={item.id}
						href={`#${item.id}`}
						className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap hover:text-foreground hover:border-primary/40 transition-colors"
					>
						<item.icon className="size-3.5" />
						{item.label}
					</a>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">
				<nav className="hidden lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-1">
					{NAV_ITEMS.map((item) => (
						<a
							key={item.id}
							href={`#${item.id}`}
							className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
						>
							<item.icon className="size-4" />
							{item.label}
						</a>
					))}
				</nav>

				<div className="flex flex-col gap-6 min-w-0">
					<section id="perfil" className="scroll-mt-6">
						<PerfilSection user={authSession.user} />
					</section>

					<section id="seguranca" className="scroll-mt-6">
						<SegurancaSection />
					</section>

					<section id="sessoes" className="scroll-mt-6">
						<SessoesSection
							initialSessions={sessions ?? []}
							currentToken={authSession.session.token}
							unavailable={sessions === null}
						/>
					</section>
				</div>
			</div>
		</div>
	)
}
