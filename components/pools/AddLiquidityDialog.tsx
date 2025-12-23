import { TokenInfo } from "@/app/tools/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { AddLiquidityToken } from "./AddLiquidityToken";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { cn } from "@/lib/utils";
import { FeeGroup } from "./FeeGroup";
import { SetPriceRange } from "./SetPriceRange";
import { PriceRangePlaceholder } from "./PriceRangePlaceholder";

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

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="bg-card p-4 rounded-lg">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">创建新的流动性池</DialogTitle>
					<Separator />
				</DialogHeader>

				<AddLiquidityToken index={0} onSelectToken={onSelectToken0} />
				<AddLiquidityToken index={1} onSelectToken={onSelectToken1} />

				<Separator />
				<FeeGroup feeTier={feeTier} setFeeTier={setFeeTier} />
				{!!token0 && !!token1 ? 
				<SetPriceRange token0={token0} token1={token1} /> : 
				<PriceRangePlaceholder />}
			</DialogContent>
		</Dialog>
	);
}