import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group"
import { Separator } from "../../ui/separator";
import { JSX } from "react";

interface DepositFeeGroupProps {
	feeTier: number;
}

export const DepositFeeGroup = ({ feeTier }: DepositFeeGroupProps) => {

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
				<h1 className="mb-1">费用等级（已锁定）</h1>
			</div>

			<ToggleGroup type="single" defaultValue="500" className="flex gap-2 mt-2 mb-4" value={`${feeTier}`}>
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