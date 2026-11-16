import {
	Body,
	Button,
	Container,
	Head,
	Hr,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from '@react-email/components'
import { EmailBrandHeader } from './email-brand-header'

interface InviteEmailProps {
	inviteUrl: string
	grantDurationMonths: number
	inviteExpiresInDays: number
}

export function InviteEmail({
	inviteUrl,
	grantDurationMonths,
	inviteExpiresInDays,
}: InviteEmailProps) {
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
				<Preview>{`Você ganhou ${grantDurationMonths} meses do plano Pro no Corrige Go`}</Preview>
				<Body className="bg-[#eef1f6] font-sans py-10">
					<Container className="mx-auto max-w-[480px] bg-white rounded-xl border border-solid border-border overflow-hidden">
						<Section className="bg-primary h-1" />

						<Section className="px-10 py-8">
							<EmailBrandHeader />

							<Text className="text-xl font-bold text-foreground text-center m-0 mt-8">
								Você foi convidado para o Corrige Go
							</Text>

							<Text className="text-sm text-muted-foreground text-center leading-relaxed mt-3 mb-0">
								Corrija provas em minutos com inteligência artificial. Com este
								convite, você usa o plano Pro de graça por {grantDurationMonths}{' '}
								meses, sem cadastrar cartão.
							</Text>

							<Section className="text-center mt-8">
								<Button
									href={inviteUrl}
									className="bg-primary text-primary-foreground text-sm font-bold rounded-md px-8 py-3.5 no-underline box-border"
								>
									Aceitar convite
								</Button>
							</Section>

							<Hr className="border-border my-8" />

							<Text className="text-xs text-muted-foreground leading-relaxed m-0">
								O convite vale por {inviteExpiresInDays} dias e só pode ser
								usado com este e-mail. Se você não esperava este convite, pode
								ignorar esta mensagem.
							</Text>
						</Section>
					</Container>

					<Text className="text-xs text-muted-foreground text-center mt-6 mb-0">
						© {new Date().getFullYear()} Corrige Go — Todos os direitos
						reservados.
					</Text>
				</Body>
			</Tailwind>
		</Html>
	)
}
