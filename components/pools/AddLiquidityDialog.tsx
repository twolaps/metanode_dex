import { TokenInfo } from "@/app/tools/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { AddLiquidityToken } from "./AddLiquidityToken";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { cn } from "@/lib/utils";

interface AddLiquidityDialogProps {
	open: boolean;
	onClose: () => void;
}

export const AddLiquidityDialog = ({ open, onClose }: AddLiquidityDialogProps) => {

	const [token0, setToken0] = useState<TokenInfo | null>(null);
	const [token1, setToken1] = useState<TokenInfo | null>(null);
	const [feeTier, setFeeTier] = useState<string>("500");

	const onSelectToken0 = (token: TokenInfo) => {
		console.log("Selected token 0:", token);
		setToken0(token);
	}

	const onSelectToken1 = (token: TokenInfo) => {
		console.log("Selected token 1:", token);
		setToken1(token);
	}

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
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">创建新的流动性池</DialogTitle>
					<Separator />
				</DialogHeader>

				<AddLiquidityToken index={0} onSelectToken={onSelectToken0} />
				<AddLiquidityToken index={1} onSelectToken={onSelectToken1} />

				<div>
					<h1 className="mb-1">费用等级</h1>
					<h1 className="text-sm text-gray-400">
						通过提供流动性赚取的金额。选择适合你风险承受能力和投资策略的金额。
					</h1>
				</div>
				
			<ToggleGroup type="single" defaultValue="0.5" className="flex gap-2 mt-2 mb-2" onValueChange={onValueChange} value={feeTier}>
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
			</DialogContent>
		</Dialog>
	);
}