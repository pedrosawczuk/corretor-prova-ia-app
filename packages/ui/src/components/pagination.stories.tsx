import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { Pagination, type PaginationProps } from './pagination'

const meta: Meta<typeof Pagination> = {
	title: 'Components/Pagination',
	component: Pagination,
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'Navegação de páginas controlada, com reticências automáticas para listas longas. Some sozinha quando há apenas uma página.',
			},
		},
	},
	argTypes: {
		page: { control: 'number', description: 'Página atual (1-indexed)' },
		totalPages: { control: 'number', description: 'Total de páginas' },
		siblingCount: {
			control: 'number',
			description: 'Páginas vizinhas exibidas de cada lado da página atual',
		},
	},
}

export default meta
type Story = StoryObj<typeof Pagination>

function InteractivePagination(props: Omit<PaginationProps, 'onPageChange'>) {
	const [page, setPage] = React.useState(props.page)

	return <Pagination {...props} page={page} onPageChange={setPage} />
}

export const Default: Story = {
	render: () => <InteractivePagination page={1} totalPages={5} />,
}

export const ManyPages: Story = {
	render: () => <InteractivePagination page={8} totalPages={20} />,
}

export const FirstPage: Story = {
	render: () => <InteractivePagination page={1} totalPages={10} />,
}

export const LastPage: Story = {
	render: () => <InteractivePagination page={10} totalPages={10} />,
}

export const WiderSiblingRange: Story = {
	render: () => (
		<InteractivePagination page={10} totalPages={20} siblingCount={2} />
	),
}
