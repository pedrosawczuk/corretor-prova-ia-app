import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from '@react-email/components'

interface WelcomeEmailProps {
	name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Bem-vindo ao Corretor de Prova IA!</Preview>
			<Tailwind>
				<Body className="bg-slate-50 font-sans py-8">
					<Container className="bg-white rounded-xl border border-slate-200 p-8 max-w-[560px] mx-auto shadow-sm">
						<Section className="mb-6">
							<Heading className="text-2xl font-bold text-slate-900 m-0">
								Olá, {name}! 👋
							</Heading>
						</Section>

						<Section className="space-y-4">
							<Text className="text-slate-700 text-base leading-relaxed m-0">
								Sua conta no <strong className="font-semibold text-slate-900">Corretor de Prova IA</strong> foi criada com sucesso.
							</Text>

							<Text className="text-slate-700 text-base leading-relaxed m-0">
								Agora você tem acesso à nossa plataforma inteligente para criar avaliações com IA, formatar gabaritos e digitalizar provas escaneadas para correção automatizada.
							</Text>
						</Section>

						<Hr className="border-slate-200 my-6" />

						<Section>
							<Text className="text-sm text-slate-500 m-0">
								Bons trabalhos,<br />
								<strong className="text-slate-700">Equipe Corretor de Prova IA</strong>
							</Text>
						</Section>
					</Container>
				</Body>
			</Tailwind>
		</Html>
	)
}
