import { useEffect, useState } from "react";
import { SwapButton } from "./SwapButton";
import { SwapTokenInput } from "./SwapTokenInput";
import { SwitchTokenButton } from "./SwitchTokenButton";
import { PairInfo, TokenInfo } from "@/app/tools/types";
import { getPairs, getSwapTokenMap } from "@/app/tools/swapMath";
import { Address } from "viem";

export default function SwapView() {

	const [selectableTokensMap, setSelectableTokensMap] = 
	useState<Map<Address, TokenInfo>>(new Map<Address, TokenInfo>());

	const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
	const [toToken, setToToken] = useState<TokenInfo | null>(null);
	const [pairs, setPairs] = useState<PairInfo[]>([]);

	const titleClass: string = [
		'w-fit',
		'text-5xl',
		'font-bold',
		'bg-gradient-to-r',
		'from-[#6E63F2]',
		'to-[#F166BB]',
		'bg-clip-text',
		'text-transparent',
		'text-[36px]',
	].join(' ');

	const descriptionClass: string = [
		'w-fit',
		'text-base',
		'mt-2',
		'text-[#99A1AF]',
	].join(' ');

	const radiusRectClass: string = [
		'w-[545px]',
		'h-[430px]',
		'bg-[#1E1B27]',
		'rounded-[16px]',
		'flex',
		'items-center',
		'px-4',
		'mb-4',
		'border',
		'border-[#2F2C38]',
		'mt-2',
		'flex-col',
		'relative',
	].join(' ');

	useEffect(() => {
		const fetchSelectableTokens = async () => {
			const map: Map<Address, TokenInfo> = await getSwapTokenMap();
			setSelectableTokensMap(map);
		};

		const fetchPairs = async () => {
			const pairs: PairInfo[] = await getPairs();
			console.log("Fetched pairs:", pairs);
			setPairs(pairs);
		};

		fetchSelectableTokens();
		fetchPairs();
	}, []);

	let pairsAvailable: boolean = false;
	if (!pairs || pairs.length === 0) {
		pairsAvailable = false;
	}
	else {
		pairsAvailable = pairs.some((pairInfo: PairInfo) => {
			if (fromToken?.address === pairInfo.token0 && toToken?.address === pairInfo.token1) {
				return true;
			}
			else if (fromToken?.address === pairInfo.token1 && toToken?.address === pairInfo.token0) {
				return true;
			}
			else {
				return false;
			}
		});	
	}

	return (
		<div className="
			w-[550px]
			h-[409px]
			mx-auto
			my-[35px]">
			<h1 className={titleClass}>
				交易
			</h1>
			<h3 className={descriptionClass}>
				选择代币进行兑换
			</h3>

			<div className={radiusRectClass}>
				<SwapTokenInput fromOrTo="from" mt={6} mb={4} selectableTokensMap={selectableTokensMap} selectedToken={fromToken} setToken={setFromToken} />
				<SwitchTokenButton />
				<SwapTokenInput fromOrTo="to" mt={0} mb={0} selectableTokensMap={selectableTokensMap} selectedToken={toToken} setToken={setToToken} />
				<SwapButton />
				<h1 className={`text-red-400 mt-3 ${pairsAvailable || !fromToken || !toToken ? 'hidden' : ''}`}>流动性不足</h1>
			</div>
		</div>
	);
}