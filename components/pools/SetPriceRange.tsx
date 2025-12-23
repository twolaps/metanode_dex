import { TokenInfo } from "@/app/tools/types"

interface SetPriceRangeProps {
	token0: TokenInfo;
	token1: TokenInfo;
}

export const SetPriceRange = ({ token0, token1 }: SetPriceRangeProps) => {
	return (
		<div>
			<h1 className="mb-1">设置价格范围</h1>
			<h1>
				当前价格: 
			</h1>
		</div>
	)
}