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

interface NewLoginEmailProps {
	name: string
	device: string
	ipAddress: string
	dateTime: string
	securityUrl: string
}

export function NewLoginEmail({
	name,
	device,
	ipAddress,
	dateTime,
	securityUrl,
}: NewLoginEmailProps) {
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
				<Preview>Detectamos um novo login na sua conta gabarita.app</Preview>
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
								Novo login detectado
							</Text>

							<Text className="text-sm text-muted-foreground text-center leading-relaxed mt-3 mb-0">
								Olá, {name}. Identificamos um novo acesso à sua conta na
								gabarita.app. Confira os detalhes abaixo.
							</Text>

							<Section className="bg-muted rounded-lg px-4 py-4 mt-6">
								<table
									role="presentation"
									width="100%"
									cellPadding={0}
									cellSpacing={0}
								>
									<tbody>
										<tr>
											<td className="pb-3">
												<Text className="text-xs text-muted-foreground m-0">
													Dispositivo
												</Text>
												<Text className="text-sm font-semibold text-foreground m-0 mt-0.5">
													{device}
												</Text>
											</td>
										</tr>
										<tr>
											<td className="pb-3">
												<Text className="text-xs text-muted-foreground m-0">
													Endereço IP
												</Text>
												<Text className="text-sm font-semibold text-foreground m-0 mt-0.5">
													{ipAddress}
												</Text>
											</td>
										</tr>
										<tr>
											<td>
												<Text className="text-xs text-muted-foreground m-0">
													Data e hora
												</Text>
												<Text className="text-sm font-semibold text-foreground m-0 mt-0.5">
													{dateTime}
												</Text>
											</td>
										</tr>
									</tbody>
								</table>
							</Section>

							<Section className="text-center mt-8">
								<Button
									href={securityUrl}
									className="bg-primary text-primary-foreground text-sm font-bold rounded-md px-8 py-3.5 no-underline box-border"
								>
									Revisar sessões ativas
								</Button>
							</Section>

							<Hr className="border-border my-8" />

							<Section className="bg-[#fffbeb] border border-solid border-[#fde68a] rounded-lg px-4 py-3">
								<Text className="text-xs text-[#92400e] leading-relaxed m-0">
									Não foi você? Acesse suas configurações de segurança para
									encerrar essa sessão e altere sua senha o quanto antes.
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
