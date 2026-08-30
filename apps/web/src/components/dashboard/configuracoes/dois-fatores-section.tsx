'use client'

import {
	Alert,
	AlertDescription,
	AlertTitle,
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	toast,
} from '@app/ui'
import { Check, Copy, KeyRound, ShieldAlert, ShieldCheck } from 'lucide-react'
import QRCode from 'qrcode'
import * as React from 'react'
import { apiClient } from '@/lib/api-client'
import { toastApiError } from '@/lib/api-error-handler'
import { extractSecret } from './dois-fatores-section.utils'

interface EnableTwoFactorResponse {
	method: 'totp' | 'otp'
	totpURI?: string
	backupCodes?: string[]
}

type Step = 'idle' | 'password' | 'verify'

interface DoisFatoresSectionProps {
	initialEnabled: boolean
	highlightAdminRequirement?: boolean
	hasPassword?: boolean
}

export function DoisFatoresSection({
	initialEnabled,
	highlightAdminRequirement = false,
	hasPassword = true,
}: DoisFatoresSectionProps) {
	const [enabled, setEnabled] = React.useState(initialEnabled)
	const [step, setStep] = React.useState<Step>('idle')
	const [password, setPassword] = React.useState('')
	const [code, setCode] = React.useState('')
	const [totpURI, setTotpURI] = React.useState('')
	const [backupCodes, setBackupCodes] = React.useState<string[]>([])
	const [isLoading, setIsLoading] = React.useState(false)
	const [copied, setCopied] = React.useState(false)
	const [qrCodeDataUrl, setQrCodeDataUrl] = React.useState('')
	const [showManualKey, setShowManualKey] = React.useState(false)

	const secret = totpURI ? extractSecret(totpURI) : null

	React.useEffect(() => {
		if (!totpURI) {
			setQrCodeDataUrl('')
			return
		}

		let cancelled = false

		QRCode.toDataURL(totpURI, { width: 200, margin: 1 })
			.then((dataUrl) => {
				if (!cancelled) setQrCodeDataUrl(dataUrl)
			})
			.catch(() => {
				if (!cancelled) setQrCodeDataUrl('')
			})

		return () => {
			cancelled = true
		}
	}, [totpURI])

	function resetFlow() {
		setStep('idle')
		setPassword('')
		setCode('')
		setTotpURI('')
		setBackupCodes([])
		setShowManualKey(false)
	}

	async function handleStartEnable(event: React.FormEvent) {
		event.preventDefault()
		setIsLoading(true)

		try {
			const data = await apiClient<EnableTwoFactorResponse>(
				'/auth/two-factor/enable',
				{
					method: 'POST',
					body: JSON.stringify({
						...(hasPassword ? { password } : {}),
						method: 'totp',
					}),
				},
			)

			setTotpURI(data.totpURI ?? '')
			setBackupCodes(data.backupCodes ?? [])
			setStep('verify')
		} catch (error) {
			toastApiError(error, 'Não foi possível iniciar a ativação do 2FA.')
		} finally {
			setIsLoading(false)
		}
	}

	async function handleVerify(event: React.FormEvent) {
		event.preventDefault()
		setIsLoading(true)

		try {
			await apiClient('/auth/two-factor/verify-totp', {
				method: 'POST',
				body: JSON.stringify({ code }),
			})

			setEnabled(true)
			resetFlow()
			toast.success('Verificação em duas etapas ativada com sucesso!')
		} catch (error) {
			toastApiError(error, 'Código inválido. Tente novamente.')
		} finally {
			setIsLoading(false)
		}
	}

	async function handleDisable(event: React.FormEvent) {
		event.preventDefault()
		setIsLoading(true)

		try {
			await apiClient('/auth/two-factor/disable', {
				method: 'POST',
				body: JSON.stringify(hasPassword ? { password } : {}),
			})

			setEnabled(false)
			resetFlow()
			toast.success('Verificação em duas etapas desativada.')
		} catch (error) {
			toastApiError(error, 'Não foi possível desativar o 2FA.')
		} finally {
			setIsLoading(false)
		}
	}

	async function copySecret() {
		if (!secret) return
		await navigator.clipboard.writeText(secret)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<Card>
			<CardHeader className="flex-row items-center gap-3 space-y-0">
				<div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
					<ShieldCheck className="size-4.5" />
				</div>
				<div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
					<div>
						<CardTitle className="text-base">
							Verificação em Duas Etapas
						</CardTitle>
						<p className="text-xs text-muted-foreground mt-0.5">
							Proteja sua conta com um código adicional a cada login.
						</p>
					</div>
					<Badge
						variant={enabled ? 'success-outline' : 'subtle'}
						size="sm"
						className="ml-auto"
					>
						{enabled ? 'Ativo' : 'Inativo'}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				{highlightAdminRequirement && !enabled && (
					<Alert variant="warning">
						<AlertTitle>2FA obrigatório para acessar o Admin</AlertTitle>
						<AlertDescription>
							Contas administrativas exigem verificação em duas etapas. Ative
							abaixo para acessar o painel administrativo.
						</AlertDescription>
					</Alert>
				)}

				{enabled && step === 'idle' && (
					<div className="flex flex-col gap-3">
						<p className="text-sm text-muted-foreground">
							Sua conta está protegida por um aplicativo autenticador.
						</p>
						<Button
							variant="destructive-outline"
							size="sm"
							className="self-start"
							onClick={() => setStep('password')}
						>
							Desativar verificação em duas etapas
						</Button>
					</div>
				)}

				{enabled && step === 'password' && (
					<form onSubmit={handleDisable} className="space-y-3">
						{hasPassword ? (
							<>
								<label
									htmlFor="disable-2fa-password"
									className="text-xs font-medium text-foreground"
								>
									Confirme sua senha para desativar
								</label>
								<Input
									id="disable-2fa-password"
									type="password"
									autoComplete="current-password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isLoading}
								/>
							</>
						) : (
							<p className="text-sm text-muted-foreground">
								Confirme que deseja desativar a verificação em duas etapas.
							</p>
						)}
						<div className="flex gap-2">
							<Button
								type="submit"
								variant="destructive"
								size="sm"
								isLoading={isLoading}
							>
								Confirmar Desativação
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={isLoading}
								onClick={resetFlow}
							>
								Cancelar
							</Button>
						</div>
					</form>
				)}

				{!enabled && step === 'idle' && (
					<Button
						variant="default"
						size="sm"
						leftIcon={<KeyRound className="size-4" />}
						onClick={() => setStep('password')}
					>
						Ativar verificação em duas etapas
					</Button>
				)}

				{!enabled && step === 'password' && (
					<form onSubmit={handleStartEnable} className="space-y-3">
						{hasPassword ? (
							<>
								<label
									htmlFor="enable-2fa-password"
									className="text-xs font-medium text-foreground"
								>
									Confirme sua senha para continuar
								</label>
								<Input
									id="enable-2fa-password"
									type="password"
									autoComplete="current-password"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isLoading}
								/>
							</>
						) : (
							<p className="text-sm text-muted-foreground">
								Sua conta usa login com Google, então nenhuma senha é
								necessária. Clique em continuar para configurar o aplicativo
								autenticador.
							</p>
						)}
						<div className="flex gap-2">
							<Button type="submit" size="sm" isLoading={isLoading}>
								Continuar
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								disabled={isLoading}
								onClick={resetFlow}
							>
								Cancelar
							</Button>
						</div>
					</form>
				)}

				{!enabled && step === 'verify' && (
					<div className="space-y-4">
						<Alert variant="info">
							<AlertTitle>Configure seu aplicativo autenticador</AlertTitle>
							<AlertDescription>
								Escaneie o QR code abaixo com o Google Authenticator, Authy ou
								app similar.
							</AlertDescription>
						</Alert>

						{qrCodeDataUrl && (
							<div className="flex justify-center rounded-lg border border-border bg-white p-4">
								{/* biome-ignore lint/performance/noImgElement: data URL gerada localmente, next/image não se aplica */}
								<img
									src={qrCodeDataUrl}
									alt="QR code para configurar o aplicativo autenticador"
									width={200}
									height={200}
								/>
							</div>
						)}

						{secret && (
							<div className="space-y-2">
								<button
									type="button"
									onClick={() => setShowManualKey((prev) => !prev)}
									className="text-xs font-medium text-primary hover:underline"
								>
									{showManualKey
										? 'Ocultar chave manual'
										: 'Não consegue escanear? Use a chave manual'}
								</button>

								{showManualKey && (
									<div className="flex items-center gap-2">
										<code className="flex-1 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs font-mono text-foreground break-all">
											{secret}
										</code>
										<Button
											type="button"
											variant="outline"
											size="icon-sm"
											aria-label="Copiar chave"
											onClick={copySecret}
										>
											{copied ? (
												<Check className="size-4" />
											) : (
												<Copy className="size-4" />
											)}
										</Button>
									</div>
								)}
							</div>
						)}

						{backupCodes.length > 0 && (
							<div>
								<p className="text-xs font-medium text-foreground mb-1.5">
									Códigos de backup (guarde em local seguro)
								</p>
								<div className="grid grid-cols-2 gap-1.5 rounded-lg border border-border bg-muted/50 p-3">
									{backupCodes.map((backupCode) => (
										<code
											key={backupCode}
											className="text-xs font-mono text-muted-foreground"
										>
											{backupCode}
										</code>
									))}
								</div>
							</div>
						)}

						<form onSubmit={handleVerify} className="space-y-3">
							<label
								htmlFor="verify-2fa-code"
								className="text-xs font-medium text-foreground"
							>
								Digite o código de 6 dígitos do aplicativo
							</label>
							<Input
								id="verify-2fa-code"
								inputMode="numeric"
								placeholder="000000"
								maxLength={6}
								value={code}
								onChange={(e) => setCode(e.target.value)}
								disabled={isLoading}
							/>
							<div className="flex gap-2">
								<Button type="submit" size="sm" isLoading={isLoading}>
									Confirmar e Ativar
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									disabled={isLoading}
									onClick={resetFlow}
								>
									Cancelar
								</Button>
							</div>
						</form>
					</div>
				)}

				{!enabled && step === 'idle' && (
					<div className="flex items-start gap-2 text-xs text-muted-foreground">
						<ShieldAlert className="size-3.5 shrink-0 mt-0.5" />
						<span>
							Recomendado para todas as contas, obrigatório para contas
							administrativas.
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
