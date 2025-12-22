import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group"

interface SlippageSettingProps {
	slippage: string;
	setSlippage: (value: string) => void;
}

export const SlippageSetting = ({ slippage, setSlippage }: SlippageSettingProps) => {
	const onValueChange = (value: string) => {
		console.log("Selected slippage tolerance:", value);
		if (value?.length > 0) {
			setSlippage(value);
		}
	}	

	const toggleItemClass: string = [
		'rounded-[8px]',
		'w-20',
		'h-8',
		'text-white',
		'data-[state=on]:bg-primary',
		'border'
	].join(' ');

	return (
		<div className="self-start bg-input/30 border-input border rounded-md px-3 py-1 mt-4 w-full flex items-start justify-center flex-col">
			<h1 className="text-[#99A1AF]">滑点容忍度</h1>
			<ToggleGroup type="single" defaultValue="0.5" className="flex gap-2 mt-2 mb-2" onValueChange={onValueChange} value={slippage}>
				<ToggleGroupItem value="0.1" className={toggleItemClass}>
					0.1%
				</ToggleGroupItem>
				<ToggleGroupItem value="0.5" className={toggleItemClass}>
					0.5%
				</ToggleGroupItem>
				<ToggleGroupItem value="1" className={toggleItemClass}>
					1%
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	)
}