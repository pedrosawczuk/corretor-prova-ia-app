import type { Meta, StoryObj } from '@storybook/react'
import { Camera, FileText, QrCode, Sparkles } from 'lucide-react'
import { AspectRatio } from './aspect-ratio'
import { Badge } from './badge'
import { Button } from './button'

const meta: Meta<typeof AspectRatio> = {
	title: 'Components/AspectRatio',
	component: AspectRatio,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente para manter proporções dimensionais precisas em elementos responsivos (ex: visor da câmera do scanner, visualizador de folhas de respostas A4, thumbnails). Baseado em `@radix-ui/react-aspect-ratio`.',
			},
		},
	},
	argTypes: {
		ratio: {
			control: 'select',
			options: [
				'16/9',
				'4/3',
				'1/1',
				'3/4',
				'9/16',
				'21/9',
				'a4',
				'a4-landscape',
			],
			description: 'Preset de proporção de tela ou documento',
		},
	},
}

export default meta
type Story = StoryObj<typeof AspectRatio>

export const ScannerCameraFeed: Story = {
	render: () => (
		<div className="w-[360px] rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
			<div className="p-3 border-b flex items-center justify-between">
				<span className="text-xs font-semibold flex items-center gap-1.5">
					<Camera className="size-4 text-primary" />
					Scanner de Prova
				</span>
				<Badge variant="warning-outline" size="xs" shape="pill" dot pulse>
					Aguardando folha...
				</Badge>
			</div>

			<AspectRatio
				ratio="3/4"
				className="bg-slate-950 flex flex-col items-center justify-center p-4"
			>
				<div className="w-full h-full border-2 border-dashed border-primary/50 rounded-xl flex flex-col items-center justify-center text-center p-4">
					<QrCode className="size-12 text-primary/70 mb-3 animate-pulse" />
					<p className="text-xs font-medium text-slate-200">
						Alinhe a folha de respostas
					</p>
					<span className="text-[11px] text-slate-400 mt-1">
						Posicione o QR Code no topo
					</span>
				</div>
			</AspectRatio>

			<div className="p-3 bg-muted/40 flex justify-center">
				<Button size="sm" variant="default" leftIcon={<Sparkles />}>
					Capturar & Corrigir com IA
				</Button>
			</div>
		</div>
	),
}

export const A4DocumentPreview: Story = {
	render: () => (
		<div className="w-72 shadow-md rounded-lg overflow-hidden border bg-white text-slate-900">
			<AspectRatio ratio="a4" className="p-6 flex flex-col justify-between">
				<div className="border-b pb-3 flex justify-between items-start">
					<div>
						<h4 className="font-bold text-xs uppercase tracking-wide">
							Escola Estadual Modelo
						</h4>
						<p className="text-[10px] text-slate-500">História - 8º Ano A</p>
					</div>
					<div className="size-8 bg-slate-100 border border-dashed rounded flex items-center justify-center">
						<QrCode className="size-5 text-slate-700" />
					</div>
				</div>

				<div className="space-y-3 py-4 text-[10px]">
					<div>
						<p className="font-semibold">1. Qual foi o principal motivo...</p>
						<p className="text-slate-500 mt-0.5">
							(A) Alternativa 1 (B) Alternativa 2
						</p>
					</div>
					<div>
						<p className="font-semibold">2. A respeito da Declaração...</p>
						<p className="text-slate-500 mt-0.5">(V) Verdadeiro (F) Falso</p>
					</div>
				</div>

				<div className="border-t pt-2 text-[9px] text-slate-400 flex justify-between">
					<span>Página 1 de 1</span>
					<span className="font-mono">ID: PROVA-8A-HIST</span>
				</div>
			</AspectRatio>
		</div>
	),
}

export const StandardWidescreen: Story = {
	render: () => (
		<div className="w-96 rounded-xl overflow-hidden border shadow-sm">
			<AspectRatio
				ratio="16/9"
				className="bg-muted flex items-center justify-center"
			>
				<div className="flex flex-col items-center gap-2 text-muted-foreground">
					<FileText className="size-8 text-primary" />
					<span className="text-xs font-medium">Proporção Widescreen 16:9</span>
				</div>
			</AspectRatio>
		</div>
	),
}

