'use client'

import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	toast,
} from '@app/ui'
import { CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { apiClient } from '@/lib/api-client'

export default function SairPage() {
	const [isLoggingOut, setIsLoggingOut] = React.useState(true)
	const hasSignedOutRef = React.useRef(false)

	React.useEffect(() => {
		if (hasSignedOutRef.current) return
		hasSignedOutRef.current = true

		async function handleSignOut() {
			try {
				await apiClient('/auth/sign-out', { method: 'POST' })

				setIsLoggingOut(false)
				toast.info('Sessão finalizada com sucesso.')
			} catch {
				setIsLoggingOut(false)
				toast.error('Erro ao finalizar sessão.')
			}
		}

		handleSignOut()
	}, [])

	return (
		<div className="min-h-screen w-full flex items-center justify-center p-6 bg-background">
			<Card className="w-full max-w-md text-center p-6 space-y-6">
				<CardHeader className="space-y-3 items-center">
					<div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
						{isLoggingOut ? (
							<Loader2 className="size-6 animate-spin text-primary" />
						) : (
							<CheckCircle2 className="size-6 text-emerald-500" />
						)}
					</div>
					<CardTitle className="text-xl font-bold">
						{isLoggingOut ? 'Finalizando sessão...' : 'Você saiu da sua conta'}
					</CardTitle>
				</CardHeader>

				<CardContent className="space-y-4">
					<p className="text-sm text-muted-foreground">
						{isLoggingOut
							? 'Aguarde um instante enquanto encerramos seu acesso com segurança.'
							: 'Sua sessão foi encerrada com segurança. O que você gostaria de fazer agora?'}
					</p>

					{!isLoggingOut && (
						<div className="flex flex-col sm:flex-row gap-3 pt-2">
							<Button variant="default" fullWidth asChild>
								<Link href="/entrar">Entrar Novamente</Link>
							</Button>
							<Button variant="outline" fullWidth asChild>
								<Link href="/">Ir para o Início</Link>
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	)
}
