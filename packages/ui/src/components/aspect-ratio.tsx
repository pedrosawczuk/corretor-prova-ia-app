import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio'
import * as React from 'react'
import { cn } from '../lib/utils'

export type AspectRatioPreset =
	| '16/9'
	| '4/3'
	| '1/1'
	| '3/4'
	| '9/16'
	| '21/9'
	| 'a4'
	| 'a4-portrait'
	| 'a4-landscape'

const RATIO_PRESETS: Record<AspectRatioPreset, number> = {
	'16/9': 16 / 9,
	'4/3': 4 / 3,
	'1/1': 1,
	'3/4': 3 / 4,
	'9/16': 9 / 16,
	'21/9': 21 / 9,
	a4: 210 / 297,
	'a4-portrait': 210 / 297,
	'a4-landscape': 297 / 210,
}

export interface AspectRatioProps
	extends Omit<
		React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>,
		'ratio'
	> {

	ratio?: number | AspectRatioPreset
}

const AspectRatio = React.forwardRef<
	React.ElementRef<typeof AspectRatioPrimitive.Root>,
	AspectRatioProps
>(({ className, ratio = '16/9', ...props }, ref) => {
	const numericRatio =
		typeof ratio === 'string' ? (RATIO_PRESETS[ratio] ?? 16 / 9) : ratio

	return (
		<AspectRatioPrimitive.Root
			ref={ref}
			ratio={numericRatio}
			className={cn('relative w-full overflow-hidden', className)}
			{...props}
		/>
	)
})

AspectRatio.displayName = 'AspectRatio'

export { AspectRatio, RATIO_PRESETS }

