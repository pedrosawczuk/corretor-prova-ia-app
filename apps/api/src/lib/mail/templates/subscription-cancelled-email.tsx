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

interface SubscriptionCancelledEmailProps {
	name: string
	manageUrl: string
}

export function SubscriptionCancelledEmail({
	name,
	manageUrl,
}: SubscriptionCancelledEmailProps) {
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
				<Preview>Sua assinatura na gabarita.app foi cancelada</Preview>
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
								Sua assinatura foi cancelada
							</Text>

							<Text className="text-sm text-muted-foreground text-center leading-relaxed mt-3 mb-0">
								Olá, {name}. Sua assinatura na gabarita.app foi cancelada. Suas
								turmas, provas e correções continuam salvas na sua conta — você
								pode assinar novamente a qualquer momento.
							</Text>

							<Section className="text-center mt-8">
								<Button
									href={manageUrl}
									className="bg-primary text-primary-foreground text-sm font-bold rounded-md px-8 py-3.5 no-underline box-border"
								>
									Ver planos
								</Button>
							</Section>

							<Hr className="border-border my-8" />

							<Text className="text-xs text-muted-foreground leading-relaxed m-0">
								Se você não reconhece este cancelamento, entre em contato com
								nosso suporte.
							</Text>
						</Section>
					</Container>

					<Text className="text-xs text-muted-foreground text-center mt-6 mb-0">
						© {new Date().getFullYear()} gabarita.app — Todos os direitos
						reservados.
					</Text>
				</Body>
			</Tailwind>
		</Html>
	)
}
