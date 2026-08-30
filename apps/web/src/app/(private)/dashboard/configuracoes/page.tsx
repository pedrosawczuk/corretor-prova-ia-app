import { MonitorSmartphone, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DeletarContaSection } from '@/components/dashboard/configuracoes/deletar-conta-section'
import { DoisFatoresSection } from '@/components/dashboard/configuracoes/dois-fatores-section'
import { PerfilSection } from '@/components/dashboard/configuracoes/perfil-section'
import { SegurancaSection } from '@/components/dashboard/configuracoes/seguranca-section'
import { SessoesSection } from '@/components/dashboard/configuracoes/sessoes-section'
import {
	getAuthAccountsList,
	getAuthSession,
	getAuthSessionsList,
} from '@/lib/auth-server'

export const metadata: Metadata = {
	title: 'Configurações — Gabarita.app',
	description: 'Gerencie seu perfil, segurança e sessões ativas.',
}

const NAV_ITEMS = [
	{ id: 'perfil', label: 'Perfil', icon: UserRound },
	{ id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
	{ id: 'sessoes', label: 'Sessões', icon: MonitorSmartphone },
	{ id: 'deletar-conta', label: 'Deletar Conta', icon: Trash2 },
]

interface ConfiguracoesPageProps {
	searchParams: Promise<{ 'ativar-2fa'?: string }>
}

export default async function ConfiguracoesPage({
	searchParams,
}: ConfiguracoesPageProps) {
	const authSession = await getAuthSession()

	if (!authSession) {
		redirect('/entrar')
	}

	const { 'ativar-2fa': ativar2fa } = await searchParams
	const sessions = await getAuthSessionsList()
	const accounts = await getAuthAccountsList()
	const hasPassword =
		accounts?.some((account) => account.providerId === 'credential') ?? true

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

					<section id="seguranca" className="scroll-mt-6 flex flex-col gap-4">
						<SegurancaSection />
						<DoisFatoresSection
							initialEnabled={Boolean(authSession.user.twoFactorEnabled)}
							highlightAdminRequirement={ativar2fa === 'admin'}
							hasPassword={hasPassword}
						/>
					</section>

					<section id="sessoes" className="scroll-mt-6">
						<SessoesSection
							initialSessions={sessions ?? []}
							currentToken={authSession.session.token}
							unavailable={sessions === null}
						/>
					</section>

					<section id="deletar-conta" className="scroll-mt-6">
						<DeletarContaSection user={authSession.user} />
					</section>
				</div>
			</div>
		</div>
	)
}
