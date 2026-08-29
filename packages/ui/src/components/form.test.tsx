import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './form'
import { Input } from './input'

const schema = z.object({
	email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
})

type Values = z.infer<typeof schema>

function LoginForm({ onSubmit }: { onSubmit: (values: Values) => void }) {
	const form = useForm<Values>({
		resolver: zodResolver(schema),
		defaultValues: { email: '' },
	})

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel required>E-mail</FormLabel>
							<FormControl>
								<Input type="email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<button type="submit">Entrar</button>
			</form>
		</Form>
	)
}

describe('Form', () => {
	it('shows the validation error and blocks submit for an empty field', async () => {
		const user = userEvent.setup()
		const onSubmit = vi.fn()

		render(<LoginForm onSubmit={onSubmit} />)

		await user.click(screen.getByRole('button', { name: 'Entrar' }))

		expect(await screen.findByText('E-mail é obrigatório')).toBeInTheDocument()
		expect(onSubmit).not.toHaveBeenCalled()
		expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveAttribute(
			'aria-invalid',
			'true',
		)
	})

	it('submits the parsed values once the field is valid', async () => {
		const user = userEvent.setup()
		const onSubmit = vi.fn()

		render(<LoginForm onSubmit={onSubmit} />)

		await user.type(
			screen.getByRole('textbox', { name: 'E-mail' }),
			'maria@example.com',
		)
		await user.click(screen.getByRole('button', { name: 'Entrar' }))

		expect(onSubmit).toHaveBeenCalledWith(
			{ email: 'maria@example.com' },
			expect.anything(),
		)
	})
})
