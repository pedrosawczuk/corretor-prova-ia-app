import { env } from '@app/env'
import { Img, Text } from '@react-email/components'

export function EmailBrandHeader() {
	const logoUrl = `${env.WEB_URL.replace(/\/$/, '')}/corrigego-symbol-violet.png`

	return (
		<table role="presentation" cellPadding={0} cellSpacing={0} align="center">
			<tbody>
				<tr>
					<td className="align-middle">
						<Img
							src={logoUrl}
							width={32}
							height={32}
							alt="CorrigeGo"
							className="block"
						/>
					</td>
					<td className="pl-2.5 align-middle">
						<Text className="text-base font-bold text-foreground m-0">
							Corrige<span className="text-primary">Go</span>
						</Text>
					</td>
				</tr>
			</tbody>
		</table>
	)
}
