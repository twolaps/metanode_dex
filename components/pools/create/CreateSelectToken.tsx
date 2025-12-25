import { TokenInfo } from "@/app/tools/types";
import { AddLiquidityToken } from "../AddLiquidityToken"
import { Separator } from "@/components/ui/separator";

interface CreateSelectTokenProps {
	token0: TokenInfo | null;
	token1: TokenInfo | null;
	onSelectToken0: (token: TokenInfo) => void;
	onSelectToken1: (token: TokenInfo) => void;
}
export const CreateSelectToken = ({token0, token1, onSelectToken0, onSelectToken1 }: CreateSelectTokenProps) => {
	return (
		<div>
			<h1 className="mb-0">选择代币</h1>
			<div className="w-full flex justify-between gap-4 mt-3 mb-2">
				<AddLiquidityToken index={0} anotherToken={token1} onSelectToken={onSelectToken0} />
				<AddLiquidityToken index={1} anotherToken={token0} onSelectToken={onSelectToken1} />
			</div>
			<Separator className="mt-4"/>
		</div>
	)
}