import type { Preview } from '@storybook/react'
import '../src/styles/globals.css'

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		backgrounds: {
			default: 'light',
			values: [
				{
					name: 'light',
					value: '#F8FAFC',
				},
				{
					name: 'dark',
					value: '#0C0D0E',
				},
			],
		},
	},
}

export default preview
