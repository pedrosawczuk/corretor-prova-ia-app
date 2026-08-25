import {
	Body,
	Head,
	Html,
	Preview,
	Tailwind,
	Text,
} from '@react-email/components'

interface WelcomeEmailProps {
	name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
	return (
		<Html>
			<Tailwind>
				<Head />
				<Preview>Bem-vindo ao Corretor de Prova IA!</Preview>
				<Body className="bg-slate-50 font-sans py-8">
					<Text className="text-slate-700 text-base leading-relaxed m-0">
						Seja bem-vindo, {name}
					</Text>
				</Body>
			</Tailwind>
		</Html>
	)
}
