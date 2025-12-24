import { formatPrice } from "@/app/pools/tools/poolMath";
import { FormattedPoolInfo } from "@/app/tools/types";

interface DepositPriceRangeProps {
	formattedPoolInfo: FormattedPoolInfo;
}

export const DepositPriceRange = ({ formattedPoolInfo }: DepositPriceRangeProps) => {

	const decimals0: number = formattedPoolInfo.tokenInfo0?.decimals || 18;
	const decimals1: number = formattedPoolInfo.tokenInfo1?.decimals || 18;
	const decimalAdjustment: number = 10 ** (decimals0 - decimals1);

	const priceLower: string = formatPrice(1.0001 ** formattedPoolInfo?.rawPoolInfo.tickLower * decimalAdjustment);
	const priceUpper: string = formatPrice(1.0001 ** formattedPoolInfo?.rawPoolInfo.tickUpper * decimalAdjustment);

	let rangeStr: string = '';

	if (formattedPoolInfo.rawPoolInfo.tickLower === -887220 && formattedPoolInfo.rawPoolInfo.tickUpper === 887220) {
		rangeStr = '当前价格区间：Full Range';
	}
	else {
		rangeStr = `当前价格区间：${priceLower}  -  ${priceUpper} ${formattedPoolInfo.tokenInfo0.symbol}/${formattedPoolInfo.tokenInfo1.symbol}`
	}

	

	
	return (
		<div>
			<div>
				<h1 className="mb-1">价格范围（已锁定）</h1>
			</div>

			<div className="w-full h-12 flex justify-center items-center border rounded-border rounded-[8px] text-gray-400">
				<h1>{rangeStr}</h1>
			</div>
		</div>
	)
}