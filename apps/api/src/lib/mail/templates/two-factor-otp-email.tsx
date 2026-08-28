import {
	Body,
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

interface TwoFactorOtpEmailProps {
	name: string
	otp: string
}

export function TwoFactorOtpEmail({ name, otp }: TwoFactorOtpEmailProps) {
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
				<Preview>Seu código de verificação em duas etapas: {otp}</Preview>
				<Body className="bg-[#eef1f6] font-sans py-10">
					<Container className="mx-auto max-w-[480px] bg-white rounded-xl border border-solid border-border overflow-hidden">
						<Section className="bg-primary h-1" />

						<Section className="px-10 py-8">
							<table
								role="presentation"
								cellPadding={0}
								cellSpacing={0}
								align="center"
							>
								<tbody>
									<tr>
										<td className="size-8 rounded-xl bg-primary text-center align-middle">
											<Text className="text-primary-foreground text-sm font-bold m-0 leading-8">
												G
											</Text>
										</td>
										<td className="pl-2.5 align-middle">
											<Text className="text-base font-bold text-foreground m-0">
												gabarita<span className="text-primary">.app</span>
											</Text>
										</td>
									</tr>
								</tbody>
							</table>

							<Text className="text-xl font-bold text-foreground text-center m-0 mt-8">
								Seu código de verificação
							</Text>

							<Text className="text-sm text-muted-foreground text-center leading-relaxed mt-3 mb-0">
								Olá, {name}. Use o código abaixo para concluir a verificação em
								duas etapas na gabarita.app.
							</Text>

							<Section className="text-center mt-8">
								<Text className="text-3xl font-bold text-foreground tracking-[0.3em] m-0">
									{otp}
								</Text>
							</Section>

							<Text className="text-xs text-muted-foreground text-center mt-4 mb-0">
								Este código expira em poucos minutos por segurança.
							</Text>

							<Hr className="border-border my-8" />

							<Section className="bg-[#fffbeb] border border-solid border-[#fde68a] rounded-lg px-4 py-3">
								<Text className="text-xs text-[#92400e] leading-relaxed m-0">
									Se você não tentou fazer login, ignore este e-mail e considere
									alterar sua senha.
								</Text>
							</Section>
						</Section>
					</Container>

					<Text className="text-xs text-muted-foreground text-center mt-6 mb-0">
						© {new Date().getFullYear()} gabarita.app — Todos os direitos
						reservados.
					</Text>
					<Text className="text-xs text-muted-foreground text-center mt-1 mb-0">
						<Link
							href="mailto:contato@gabarita.app"
							className="text-muted-foreground"
						>
							contato@gabarita.app
						</Link>
					</Text>
				</Body>
			</Tailwind>
		</Html>
	)
}
