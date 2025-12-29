import { encodePriceToSqrtX96, priceToTick } from "@/app/pools/tools/poolMath"
import { TokenInfo } from "@/app/tools/types"
import { poolManagerConfig } from "@/config/contracts"
import { TICK_SPACINGS, TickMath } from "@uniswap/v3-sdk"
import { toast } from "sonner"
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi"

export const useCreatePool = () => {

	const {writeContract, data: hash, isPending: isWritePending, isSuccess: isWriteSuccess, isError} = useWriteContract();
	const {isLoading: isConfirming, isSuccess: isConfirmSuccess} = useWaitForTransactionReceipt({
		hash,
		confirmations: 2,
	});

	const createPool = (param: {
			token0: TokenInfo | null,
			token1: TokenInfo | null,
			feeTier: string,
			initialPrice: string,
			lower: string,
			upper: string,
			rangeMode: "full" | "concentrated"
	}) => {
		if (!param.token0 || !param.token1) {
			toast.error("请选择代币对。");
			return;
		}

		if (!param.initialPrice || isNaN(Number(param.initialPrice)) || Number(param.initialPrice) <= 0) {
			toast.error("请输入有效的初始价格。");
			return;
		}

		if (param.rangeMode === "concentrated") {
			if (!param.lower || isNaN(Number(param.lower)) || Number(param.lower) <= 0) {
				toast.error("请输入有效的最低价格。");
				return;
			}
			if (!param.upper || isNaN(Number(param.upper)) || Number(param.upper) <= 0) {
				toast.error("请输入有效的最高价格。");
				return;
			}
			if (Number(param.lower) >= Number(param.upper)) {
				toast.error("最低价格必须小于最高价格。");
				return;
			}
		}

		const [t0, t1] = param.token0.address.toLowerCase() < param.token1.address.toLowerCase() ? [param.token0, param.token1] : [param.token1, param.token0];
		const sqrtPriceX96: bigint = encodePriceToSqrtX96(param.initialPrice, t0.decimals, t1.decimals);

		let tickLower: number;
		let tickUpper: number;

		const feeNumber = Number(param.feeTier);
		// 检查该费率是否在 SDK 支持的范围内
		const spacing: number = TICK_SPACINGS[feeNumber as keyof typeof TICK_SPACINGS];

		if (!spacing) {
			throw new Error("无效的费率等级");
		}

		if (param.rangeMode === "full") {
			tickLower = TickMath.MIN_TICK;
			tickUpper = TickMath.MAX_TICK;
		} else {
			// 1. 确保输入的价格数值本身是正确的顺序
			const [lowPrice, highPrice] = Number(param.lower) <= Number(param.upper)? [param.lower, param.upper]:[param.upper, param.lower];
			// 2. 计算 Tick
			tickLower = priceToTick(lowPrice, t0.decimals, t1.decimals, spacing);
			tickUpper = priceToTick(highPrice, t0.decimals, t1.decimals, spacing);

			// 3. 兜底逻辑：如果区间太窄导致对齐后重合，强制拉开一个刻度
			if (tickUpper <= tickLower) {
					tickUpper = tickLower + spacing;
			}
		}

		try {
			writeContract({
				...poolManagerConfig,
				functionName: 'createAndInitializePoolIfNecessary',
				args: [{
						token0: t0.address,
						token1: t1.address,
						fee: feeNumber,
						tickLower,
						tickUpper,
						sqrtPriceX96,
					}],
			});
			toast.success("池子创建交易已发送！等待上链确认。");
		}
		catch (error) {
			console.error("创建池子时出错：", error);
			toast.error("创建池子时出错，请重试。");
		}
	}

	return {
			createPool, 
			isWritePending,
			isWriteSuccess,
			isConfirming,
			isConfirmSuccess,
			isError,
			hash,
		}
}