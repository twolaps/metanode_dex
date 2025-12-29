import { TokenInfo } from "@/app/tools/types"
import { Input } from "@/components/ui/input";
import { JSX } from "react";
import { NoTokensPlaceholder } from "./NoTokensPlaceholder";
import { Separator } from "@/components/ui/separator";
import { sortTokens } from "@/app/pools/tools/poolMath";

interface CreateInitialPriceProps {
	token0: TokenInfo | null;
	token1: TokenInfo | null;
	initialPrice: string;
	onInitialPriceChange: (price: string) => void;
}

export const CreateInitialPrice = ({ token0, token1, initialPrice, onInitialPriceChange }: CreateInitialPriceProps) => {
	console.log("CreateInitialPrice token0:", token0, "token1:", token1);
	let pair: TokenInfo[] = [];
	

	if (token0 && token1) {
		pair = sortTokens(token0, token1);
	}



	let initialPriceJE: JSX.Element;
	if (!token0 || !token1) {
		initialPriceJE = (
			<NoTokensPlaceholder />
		);
	}
	else {
		initialPriceJE = (
			<div className="mt-3 flex items-center gap-2">
				<h1 className="w-28">1 {pair[0].symbol} =</h1>
				<div className="w-full relative">
					<Input value={initialPrice} type="number" className="pr-15" onChange={(e) => onInitialPriceChange(e.target.value)}></Input>
					<span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">{pair[1].symbol}</span>
				</div>
			</div>
		);
	}
	
	return (
		<div>
			<h1 className="mb-2">初始价格设置</h1>
			{initialPriceJE}
			<Separator className="mt-4" />
		</div>
	)
}