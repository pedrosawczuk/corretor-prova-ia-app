import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './skeleton'

const meta: Meta<typeof Skeleton> = {
	title: 'Components/Skeleton',
	component: Skeleton,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Componente de esqueleto de carregamento (`Skeleton`) para Suspense fallbacks e estados assíncronos conforme definido no documento de padrões do frontend (`loading.tsx`). Suporta animações de pulso e shimmer.',
			},
		},
	},
	argTypes: {
		animation: {
			control: 'select',
			options: ['pulse', 'shimmer', 'none'],
			description: 'Efeito de animação durante o carregamento',
		},
		shape: {
			control: 'select',
			options: ['default', 'sm', 'circle', 'square'],
			description: 'Formato do canto do elemento',
		},
		variant: {
			control: 'select',
			options: ['default', 'subtle', 'card', 'primary'],
			description: 'Tonalidade de contraste do esqueleto',
		},
	},
}

export default meta
type Story = StoryObj<typeof Skeleton>

export const Default: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<Skeleton shape="circle" className="size-12" />
			<div className="space-y-2">
				<Skeleton className="h-4 w-48" />
				<Skeleton className="h-3 w-32" />
			</div>
		</div>
	),
}

export const ExamCardLoading: Story = {
	render: () => (
		<div className="w-80 p-5 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
			<div className="flex items-center justify-between">
				<Skeleton className="h-5 w-36" />
				<Skeleton shape="circle" className="h-5 w-16" />
			</div>

			<div className="space-y-2">
				<Skeleton className="h-3.5 w-full" />
				<Skeleton className="h-3.5 w-4/5" />
			</div>

			<Skeleton className="h-px w-full" />

			<div className="flex justify-between items-center pt-1">
				<Skeleton className="h-4 w-20" />
				<Skeleton className="h-8 w-24 rounded-lg" />
			</div>
		</div>
	),
}

export const QuestionGeneratingAI: Story = {
	render: () => (
		<div className="w-96 p-5 rounded-2xl border border-primary/20 bg-card space-y-4 shadow-sm">
			<div className="flex items-center gap-2">
				<Skeleton variant="primary" shape="circle" className="size-6" />
				<Skeleton variant="primary" className="h-4 w-44" />
			</div>

			<div className="space-y-2 pl-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-11/12" />
				<Skeleton className="h-4 w-3/4" />
			</div>

			<div className="space-y-2.5 pt-2">
				<Skeleton className="h-9 w-full rounded-xl" />
				<Skeleton className="h-9 w-full rounded-xl" />
				<Skeleton className="h-9 w-full rounded-xl" />
				<Skeleton className="h-9 w-full rounded-xl" />
			</div>
		</div>
	),
}

export const TableRowsLoading: Story = {
	render: () => (
		<div className="w-96 rounded-xl border p-4 space-y-3 bg-card">
			<div className="flex justify-between pb-2 border-b">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-16" />
				<Skeleton className="h-4 w-12" />
			</div>
			<div className="flex justify-between items-center py-1.5">
				<Skeleton className="h-3.5 w-32" />
				<Skeleton className="h-3.5 w-20" />
				<Skeleton shape="circle" className="h-4 w-10" />
			</div>
			<div className="flex justify-between items-center py-1.5">
				<Skeleton className="h-3.5 w-28" />
				<Skeleton className="h-3.5 w-20" />
				<Skeleton shape="circle" className="h-4 w-10" />
			</div>
			<div className="flex justify-between items-center py-1.5">
				<Skeleton className="h-3.5 w-36" />
				<Skeleton className="h-3.5 w-20" />
				<Skeleton shape="circle" className="h-4 w-10" />
			</div>
		</div>
	),
}

