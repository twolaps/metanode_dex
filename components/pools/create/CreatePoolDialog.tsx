import { TokenInfo } from "@/app/tools/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Separator } from "../../ui/separator";
import { useEffect, useRef, useState } from "react";
import { CreateFeeGroup } from "./CreateFeeGroup";
import { CreateSelectToken } from "./CreateSelectToken";
import { CreateInitialPrice } from "./CreateInitialPrice";
import { toast } from "sonner";
import { CreatePriceRange } from "./CreatePriceRange";
import { getRange } from "@/app/pools/tools/poolMath";
import { formatNumber } from "@/utils/format";

interface CreatePoolDialogProps {
	open: boolean;
	onClose: () => void;
}

export const CreatePoolDialog = ({ open, onClose }: CreatePoolDialogProps) => {
	const [token0, setToken0] = useState<TokenInfo | null>(null);
	const [token1, setToken1] = useState<TokenInfo | null>(null);
	const [feeTier, setFeeTier] = useState<string>("500");
	const [initialPrice, setInitialPrice] = useState<string>("");
	const [rangeMode, setRangeMode] = useState<string>("full"); // "full" or "concentrated"
	const debounceRef = useRef<NodeJS.Timeout | null>(null);
	const [lower, setLower] = useState<string>("");
	const [upper, setUpper] = useState<string>("");

	const onSelectToken0 = (token: TokenInfo) => {
		console.log("Selected token 0:", token);

		if (token1 && token.address === token1.address) {
			// 如果选择的 token0 和当前的 token1 相同，交换它们
			toast.error("请选择不同的代币。");
		}
		else {
			setToken0(token);
		}
	}

	const onSelectToken1 = (token: TokenInfo) => {
		console.log("Selected token 1:", token);
		if (token0 && token.address === token0.address) {
			// 如果选择的 token0 和当前的 token1 相同，交换它们
			toast.error("请选择不同的代币。");
		}
		else {
			setToken1(token);
		}
	}

	useEffect(() => {
		return () => {
			// Reset state when dialog is closed
			console.log("Resetting CreatePoolDialog state");
			setFeeTier("500");
			setToken0(null);
			setToken1(null);
			setRangeMode("full");
			setInitialPrice("");
		};
	}, [open]);

	useEffect(() => {
		if (initialPrice === "" || isNaN(Number(initialPrice)) || Number(initialPrice) <= 0) {
			return;
		}

		debounceRef.current = setTimeout(() => {
			const range: number[] = getRange(initialPrice, feeTier);
			setLower(formatNumber(range[0]));
			setUpper(formatNumber(range[1]));
		}, 500);

		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		}
	}, [initialPrice, feeTier]);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="bg-card p-4 rounded-lg">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">创建新的流动性池</DialogTitle>
					<DialogDescription className="sr-only"></DialogDescription>
					<Separator />
				</DialogHeader>

				<CreateSelectToken token0={token0} token1={token1} onSelectToken0={onSelectToken0} onSelectToken1={onSelectToken1} />
				<CreateFeeGroup feeTier={feeTier} setFeeTier={setFeeTier} />
				<CreateInitialPrice token0={token0} token1={token1} initialPrice={initialPrice} onInitialPriceChange={setInitialPrice} />
				<CreatePriceRange token0={token0} token1={token1} rangeMode={rangeMode} setRangeMode={setRangeMode} lower={lower} upper={upper} onSetLower={setLower} onSetUpper={setUpper} />
			</DialogContent>
		</Dialog>
	);
}