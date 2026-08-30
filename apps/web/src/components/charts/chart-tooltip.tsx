import type { TooltipContentProps } from 'recharts'
import type {
	NameType,
	ValueType,
} from 'recharts/types/component/DefaultTooltipContent'

interface ChartTooltipProps extends TooltipContentProps<ValueType, NameType> {
	suffix?: string
}

export function ChartTooltip({
	active,
	payload,
	label,
	suffix = '',
}: ChartTooltipProps) {
	if (!active || !payload?.length) return null

	return (
		<div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
			<p className="text-xs font-medium text-foreground">{label}</p>
			<p className="text-xs text-muted-foreground">
				{payload[0]?.value} {suffix}
			</p>
		</div>
	)
}
