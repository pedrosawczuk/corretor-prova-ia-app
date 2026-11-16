import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Link,
	Preview,
	Section,
	Tailwind,
	Text,
} from '@react-email/components'
import { EmailBrandHeader } from './email-brand-header'

interface DeleteAccountVerificationEmailProps {
	name: string
	verificationUrl: string
}

export function DeleteAccountVerificationEmail({
	name,
	verificationUrl,
}: DeleteAccountVerificationEmailProps) {
	return (
		<Html>
			<Tailwind
				config={{
					theme: {
						extend: {
							colors: {
								primary: '#6e56cf',
								'primary-foreground': '#ffffff',
								foreground: '#0c0d0e',
								muted: '#eaebec',
								'muted-foreground': '#5c636a',
								border: '#d4d6d8',
							},
							fontFamily: {
								sans: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
							},
						},
					},
				}}
			>
				<Head />
				<Preview>Confirme a exclusão da sua conta — Corrige Go</Preview>
				<Body className="bg-[#eef1f6] font-sans py-10">
					<Container className="mx-auto max-w-[480px] bg-white rounded-xl border border-solid border-border overflow-hidden">
						<Section className="bg-primary h-1" />

						<Section className="px-10 py-8">
							<EmailBrandHeader />

							<Text className="text-xl font-bold text-foreground text-center m-0 mt-8">
								Confirme a exclusão da sua conta
							</Text>

							<Text className="text-sm text-muted-foreground text-center leading-relaxed mt-3 mb-0">
								Olá, {name}. Recebemos uma solicitação para excluir
								permanentemente sua conta no Corrige Go. Se você deseja
								confirmar esta ação, clique no botão abaixo:
							</Text>

							<Section className="text-center mt-8">
								<Button
									href={verificationUrl}
									className="bg-primary text-primary-foreground text-sm font-bold rounded-md px-8 py-3.5 no-underline box-border"
								>
									Confirmar exclusão da conta
								</Button>
							</Section>

							<Hr className="border-border my-8" />

							<Text className="text-xs text-muted-foreground leading-relaxed m-0">
								Se o botão acima não funcionar, copie e cole o link abaixo no
								seu navegador:
							</Text>
							<Link
								href={verificationUrl}
								className="text-xs text-primary break-all"
							>
								{verificationUrl}
							</Link>

							<Text className="text-xs text-muted-foreground leading-relaxed mt-6 mb-0">
								Se você não solicitou a exclusão, ignore este e-mail.
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
