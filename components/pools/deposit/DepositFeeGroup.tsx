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

	let extraFeeItems: JSX.Element | null = null;
	if (feeTier > 0 && [500, 3000, 10000].indexOf(feeTier) === -1) {
		extraFeeItems = (
			<ToggleGroupItem value={`${feeTier}`} className={toggleItemClass}>
				{(feeTier / 10000).toFixed(2)}%
			</ToggleGroupItem>
		);
	}

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
				{extraFeeItems}
			</ToggleGroup>
			<Separator />
		</div>
	)
}