import { useEffect, useState } from "react";
import { SwapButton } from "./SwapButton";
import { SwapTokenInput } from "./SwapTokenInput";
import { SwitchTokenButton } from "./SwitchTokenButton";
import { InQuoteInfo, OutQuoteInfo, PairInfo, SwapError, RawPoolInfo, TokenInfo, TradeDirection } from "@/app/tools/types";
import { getPairs, getPools, getOutQuote, getSwapTokenMap, getInQuote } from "@/app/tools/swapMath";
import { Address, formatEther, formatUnits, maxUint256, parseEther } from "viem";
import { showQuoteToaster } from "@/app/tools/toaster";

export default function SwapView() {

	const [selectableTokensMap, setSelectableTokensMap] = useState<Map<Address, TokenInfo>>(new Map<Address, TokenInfo>());

	const [allPools, setAllPools] = useState<RawPoolInfo[]>([]);

	const [fromToken, setFromToken] = useState<TokenInfo | null>(null);
	const [toToken, setToToken] = useState<TokenInfo | null>(null);
	const [pairs, setPairs] = useState<PairInfo[]>([]);

	const [amountIn, setAmountIn] = useState<string>("");
	const [amountOut, setAmountOut] = useState<string>("");

	const [poolIndex, setPoolIndex] = useState<number | null>(null);

	const [tradeDirection, setTradeDirection] = useState<TradeDirection>(TradeDirection.TO);

	const [swapError, setSwapError] = useState<SwapError>(SwapError.NONE);

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

	

	// let pairsAvailable: boolean = false;
	// if (!pairs || pairs.length === 0) {
	// 	pairsAvailable = false;
	// }
	// else {
	// 	pairsAvailable = pairs.some((pairInfo: PairInfo) => {
	// 		if (fromToken?.address === pairInfo.token0 && toToken?.address === pairInfo.token1) {
	// 			return true;
	// 		}
	// 		else if (fromToken?.address === pairInfo.token1 && toToken?.address === pairInfo.token0) {
	// 			return true;
	// 		}
	// 		else {
	// 			return false;
	// 		}
	// 	});	
	// }

	const checkAndGetOutQuote = async (pools: RawPoolInfo[]) => {
		if (fromToken?.address && toToken?.address) {
			if (fromToken.address === toToken.address) {
				setSwapError(SwapError.SAME_TOKEN);
				showQuoteToaster(SwapError.SAME_TOKEN);
				setAmountOut("")
				return;
			}

			const result: OutQuoteInfo = await getOutQuote(fromToken, toToken, amountIn, pools);
			setSwapError(result.error)

			if (result.error !== SwapError.NONE) {
				showQuoteToaster(result.error);
			}

			if (result.amountOut !== null && result.amountOut > 0n && result.amountOut < maxUint256) {
				const amountOutFormatted: string = Number(formatUnits(result.amountOut, toToken.decimals)).toFixed(6);
				setAmountOut(amountOutFormatted);
			}
			else {
				setAmountOut("");
			}
			
			if (result.poolIndex >= 0){
				setPoolIndex(result.poolIndex);
			}
			
			console.log("Estimated amount out:", result.amountOut.toString(), "from pool index:", result.poolIndex);
		}
	}

	const checkAndGetInQuote = async (pools: RawPoolInfo[]) => {
		if (fromToken?.address && toToken?.address) {
			if (fromToken.address === toToken.address) {
				setSwapError(SwapError.SAME_TOKEN);
				showQuoteToaster(SwapError.SAME_TOKEN);
				setAmountIn("")
				return;
			}

			const result: InQuoteInfo = await getInQuote(fromToken, toToken, amountOut, pools);
			setSwapError(result.error)

			if (result.amountIn !== null && result.amountIn > 0n && result.amountIn < maxUint256) {
				const amountInFormatted: string = Number(formatUnits(result.amountIn, fromToken.decimals)).toFixed(6);
				setAmountIn(amountInFormatted);
			}
			else {
				setAmountIn("");
			}
			
			if (result.poolIndex >= 0){
				setPoolIndex(result.poolIndex);
			}
			
			console.log("Estimated amount in:", result.amountIn.toString(), "from pool index:", result.poolIndex);
		}
	}

	const onAmountInChange = (value: string) => {
		console.log("Amount In changed:", value);
		setAmountIn(value);
		setTradeDirection(TradeDirection.TO);
	}

	const onAmountOutChange = async (value: string) => {
		console.log("Amount Out changed:", value);
		setAmountOut(value);
		setTradeDirection(TradeDirection.FROM);
	}

	useEffect(() => {
		const timerId = setTimeout(() => {
			if (tradeDirection === TradeDirection.TO)
				checkAndGetOutQuote(allPools);
		}, 500); // 500ms debounce
		
		return () => clearTimeout(timerId);
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [amountIn, fromToken, toToken]);

	useEffect(() => {
		const timerId = setTimeout(() => {
			if (tradeDirection === TradeDirection.FROM)
				checkAndGetInQuote(allPools);
		}, 500); // 500ms debounce
		
		return () => clearTimeout(timerId);
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [amountOut, fromToken, toToken]);


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


	const getButtonText = () => {
    if (swapError === SwapError.SAME_TOKEN) return "代币相同";
    if (swapError === SwapError.NO_POOL) return "暂无交易路径";
    if (swapError === SwapError.INSUFFICIENT_LIQUIDITY) return "流动性不足";
    if (!amountIn) return "输入金额";
    return "立即兑换";
};

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
				<SwapButton getButtonText={getButtonText} disabled={!(swapError == SwapError.NONE && Number(amountIn) > 0 && Number(amountOut) > 0)} />
			</div>
		</div>
	);
}