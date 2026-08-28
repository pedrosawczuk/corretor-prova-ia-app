import type { Meta, StoryObj } from '@storybook/react'
import { Globe, Mail, MessageSquare, Share2, Sparkles } from 'lucide-react'
import { Badge } from './badge'
import {
	Footer,
	FooterBottom,
	FooterBrand,
	FooterContent,
	FooterGroup,
	FooterGroupTitle,
	FooterLink,
	FooterLinkList,
	FooterSocial,
} from './footer'

const meta: Meta<typeof Footer> = {
	title: 'Components/Footer',
	component: Footer,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Componente de rodapé estruturado e modular para o **Gabarita.app**, com colunas de links, branding institucional, links de termos e redes sociais.',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'muted', 'bordered', 'glass', 'minimal'],
			description: 'Variante de acabamento do rodapé',
		},
	},
}

export default meta
type Story = StoryObj<typeof Footer>

export const CompleteLandingPageFooter: Story = {
	render: () => (
		<Footer variant="default">
			<FooterContent>
				<FooterBrand>
					<div className="flex items-center gap-2.5">
						<div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-xs">
							G
						</div>
						<span className="text-base font-bold text-foreground tracking-tight">
							Gabarita<span className="text-primary">.app</span>
						</span>
						<Badge size="xs" variant="secondary" leftIcon={<Sparkles />}>
							IA Vision
						</Badge>
					</div>

					<p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
						Plataforma completa para elaboração de avaliações escolares com IA,
						impressão padronizada e correção instantânea por câmera de
						smartphone.
					</p>

					<div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
						<span className="size-2 rounded-full bg-success animate-pulse" />
						<span>Todos os sistemas operacionais</span>
					</div>
				</FooterBrand>

				<FooterGroup>
					<FooterGroupTitle>Produto</FooterGroupTitle>
					<FooterLinkList>
						<li>
							<FooterLink href="#gerador">Gerador de Questões IA</FooterLink>
						</li>
						<li>
							<FooterLink href="#scanner">Scanner por Câmera</FooterLink>
						</li>
						<li>
							<FooterLink href="#gabarito">Gabarito Automático</FooterLink>
						</li>
						<li>
							<FooterLink href="#impressao">Cadernos de Impressão</FooterLink>
						</li>
						<li>
							<FooterLink href="#precos">Preços & Planos</FooterLink>
						</li>
					</FooterLinkList>
				</FooterGroup>

				<FooterGroup>
					<FooterGroupTitle>Institucional</FooterGroupTitle>
					<FooterLinkList>
						<li>
							<FooterLink href="#escolas">Para Colégios & Redes</FooterLink>
						</li>
						<li>
							<FooterLink href="#seguranca">Segurança & LGPD</FooterLink>
						</li>
						<li>
							<FooterLink href="#metodologia">Precisão do OCR</FooterLink>
						</li>
						<li>
							<FooterLink href="#sobre">Sobre o Projeto</FooterLink>
						</li>
					</FooterLinkList>
				</FooterGroup>

				<FooterGroup>
					<FooterGroupTitle>Suporte</FooterGroupTitle>
					<FooterLinkList>
						<li>
							<FooterLink href="#ajuda">Central de Ajuda</FooterLink>
						</li>
						<li>
							<FooterLink href="#contato">Fale com Suporte</FooterLink>
						</li>
						<li>
							<FooterLink href="#termos">Termos de Uso</FooterLink>
						</li>
						<li>
							<FooterLink href="#privacidade">Privacidade</FooterLink>
						</li>
					</FooterLinkList>
				</FooterGroup>
			</FooterContent>

			<FooterBottom>
				<span>
					© {new Date().getFullYear()} Gabarita.app — Todos os direitos
					reservados.
				</span>

				<FooterSocial>
					<FooterLink href="mailto:contato@gabarita.app" aria-label="E-mail">
						<Mail className="size-4" />
					</FooterLink>
					<FooterLink href="#chat" aria-label="Comunidade">
						<MessageSquare className="size-4" />
					</FooterLink>
					<FooterLink href="#share" aria-label="Compartilhar">
						<Share2 className="size-4" />
					</FooterLink>
					<FooterLink href="https://gabarita.app" aria-label="Website">
						<Globe className="size-4" />
					</FooterLink>
				</FooterSocial>
			</FooterBottom>
		</Footer>
	),
}

export const MinimalAuthFooter: Story = {
	render: () => (
		<Footer variant="minimal">
			<div className="mx-auto max-w-4xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
				<div className="flex items-center gap-2">
					<Globe className="size-3.5" />
					<span>Gabarita.app • Brasil (PT-BR)</span>
				</div>

				<div className="flex items-center gap-4">
					<FooterLink href="/termos">Termos</FooterLink>
					<FooterLink href="/privacidade">Privacidade</FooterLink>
					<FooterLink href="/ajuda">Ajuda</FooterLink>
				</div>
			</div>
		</Footer>
	),
}

