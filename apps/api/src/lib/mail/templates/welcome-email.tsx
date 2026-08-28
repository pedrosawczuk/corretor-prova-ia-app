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

interface WelcomeEmailProps {
	name: string
	dashboardUrl: string
}

const steps = [
	{
		title: 'Crie o gabarito',
		description:
			'Defina as respostas corretas em segundos ou gere a prova completa diagramada para impressão.',
	},
	{
		title: 'Escaneie as folhas',
		description:
			'Aponte a câmera do seu celular para as folhas de resposta dos alunos, sem scanner.',
	},
	{
		title: 'Receba a nota na hora',
		description:
			'A nota total e o acerto de cada questão são calculados automaticamente para você.',
	},
]

export function WelcomeEmail({ name, dashboardUrl }: WelcomeEmailProps) {
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
				<Preview>
					Sua conta está pronta — vamos economizar suas horas de correção.
				</Preview>
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
								Bem-vindo(a), {name}!
							</Text>

							<Text className="text-sm text-muted-foreground text-center leading-relaxed mt-3 mb-0">
								Sua conta na gabarita.app foi criada com sucesso. Agora você
								pode elaborar provas, diagramar para impressão e corrigir
								automaticamente com a câmera do celular — tudo em um só lugar.
							</Text>

							<Section className="text-center mt-8">
								<Button
									href={dashboardUrl}
									className="bg-primary text-primary-foreground text-sm font-bold rounded-md px-8 py-3.5 no-underline box-border"
								>
									Acessar o painel
								</Button>
							</Section>

							<Hr className="border-border my-8" />

							<Text className="text-xs font-bold text-foreground uppercase tracking-wide m-0 mb-4">
								Como funciona na prática
							</Text>

							<table
								role="presentation"
								width="100%"
								cellPadding={0}
								cellSpacing={0}
							>
								<tbody>
									{steps.map((step, index) => (
										<tr key={step.title}>
											<td className="w-8 align-top pb-5">
												<table
													role="presentation"
													cellPadding={0}
													cellSpacing={0}
												>
													<tbody>
														<tr>
															<td className="size-6 rounded-lg bg-[#e9e7f4] text-center align-middle">
																<Text className="text-primary text-xs font-bold m-0 leading-6">
																	{index + 1}
																</Text>
															</td>
														</tr>
													</tbody>
												</table>
											</td>
											<td className="pl-3 pb-5 align-top">
												<Text className="text-sm font-bold text-foreground m-0">
													{step.title}
												</Text>
												<Text className="text-xs text-muted-foreground leading-relaxed m-0 mt-1">
													{step.description}
												</Text>
											</td>
										</tr>
									))}
								</tbody>
							</table>

							<Section className="bg-muted rounded-lg px-4 py-3 mt-2">
								<Text className="text-xs text-muted-foreground leading-relaxed m-0">
									Dúvidas? Responda este e-mail ou fale com a gente em{' '}
									<Link
										href="mailto:contato@gabarita.app"
										className="text-primary font-semibold"
									>
										contato@gabarita.app
									</Link>
									.
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
