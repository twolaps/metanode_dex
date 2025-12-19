import { useEffect, useState } from "react";
import { SwapButton } from "./SwapButton";
import { SwapTokenInput } from "./SwapTokenInput";
import { SwitchTokenButton } from "./SwitchTokenButton";
import { PairInfo, RawPoolInfo, TokenInfo } from "@/app/tools/types";
import { getPairs, getPools, getQuote, getSwapTokenMap } from "@/app/tools/swapMath";
import { Address, formatUnits } from "viem";

export default function SwapView() {

	const [selectableTokensMap, setSelectableTokensMap] = 
	useState<Map<Address, TokenInfo>>(new Map<Address, TokenInfo>());

	const [allPools, setAllPools] = useState<RawPoolInfo[]>([]);

	const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
	const [toToken, setToToken] = useState<TokenInfo | null>(null);
	const [pairs, setPairs] = useState<PairInfo[]>([]);

	const [amountIn, setAmountIn] = useState<string>("");
	const [amountOut, setAmountOut] = useState<string>("");

	const [poolIndex, setPoolIndex] = useState<number | null>(null);

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

	const checkAndGetQuote = async (pools: RawPoolInfo[]) => {
		if (fromToken?.address && toToken?.address) {
			const result: {amountOut: bigint, poolIndex: number} = await getQuote(fromToken, toToken, amountIn, pools);

			if (result.amountOut !== null) {
				const amountOutFormatted: string = Number(formatUnits(result.amountOut, toToken.decimals)).toFixed(6);
				setAmountOut(amountOutFormatted);
			}
			
			if (result.poolIndex >= 0){
				setPoolIndex(result.poolIndex);
			}
			
			console.log("Estimated amount out:", result.amountOut.toString(), "from pool index:", result.poolIndex);
		}
	}

	const onAmountInChange = (value: string) => {
		console.log("Amount In changed:", value);
		setAmountIn(value);
	}

	const onAmountOutChange = async (amountOut: string) => {
	}

	useEffect(() => {
		const timerId = setTimeout(() => {
			checkAndGetQuote(allPools);
		}, 500); // 500ms debounce
		
		return () => clearTimeout(timerId);
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [amountIn]);


	useEffect(() => {
		const fetchSelectableTokens = async () => {
			const pools: RawPoolInfo[] = await getPools();
			setAllPools(pools);
			const map: Map<Address, TokenInfo> = await getSwapTokenMap(pools);
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
				<SwapTokenInput
					fromOrTo="from"
					mt={6}
					mb={4}
					selectableTokensMap={selectableTokensMap}
					selectedToken={fromToken}
					setToken={setFromToken}
					onAmountChange={onAmountInChange}
					amount={amountIn}
				/>
				<SwitchTokenButton />
				<SwapTokenInput
					fromOrTo="to"
					mt={0}
					mb={0}
					selectableTokensMap={selectableTokensMap}
					selectedToken={toToken}
					setToken={setToToken}
					onAmountChange={onAmountOutChange}
					amount={amountOut}
				/>
				<SwapButton />
				<h1 className={`text-red-400 mt-3 ${pairsAvailable || !fromToken || !toToken ? 'hidden' : ''}`}>流动性不足</h1>
			</div>
		</div>
	);
}