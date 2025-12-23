import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import { Separator } from "../ui/separator";

interface FeeGroupProps {
	feeTier: string;
	setFeeTier: (value: string) => void;
}

export const FeeGroup = ({ feeTier, setFeeTier }: FeeGroupProps) => {
	const onValueChange = (value: string) => {
		console.log("Selected fee tier:", value);
		if (value?.length > 0) {
			setFeeTier(value);
		}
	}

	const toggleItemClass: string = cn(
		'rounded-[8px]',
		'w-20',
		'h-8',
		'text-white',
		'data-[state=on]:bg-primary',
		'border'
	);

	return (
		<div>
			<div>
				<h1 className="mb-1">费用等级</h1>
				<h1 className="text-sm text-gray-400">
					通过提供流动性赚取的金额。选择适合你风险承受能力和投资策略的金额。
				</h1>
			</div>

			<ToggleGroup type="single" defaultValue="500" className="flex gap-2 mt-2 mb-4" onValueChange={onValueChange} value={feeTier}>
				<ToggleGroupItem value="500" className={toggleItemClass}>
					0.05%
				</ToggleGroupItem>
				<ToggleGroupItem value="3000" className={toggleItemClass}>
					0.3%
				</ToggleGroupItem>
				<ToggleGroupItem value="10000" className={toggleItemClass}>
					1%
				</ToggleGroupItem>
			</ToggleGroup>
			<Separator />
		</div>
	)
}