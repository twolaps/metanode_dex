import { TokenInfo, TradeDirection } from "@/app/tools/types";
import { swapConfig } from "@/config/contracts";
import { TickMath } from "@uniswap/v3-sdk";
import { Address, maxUint256, parseUnits } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const useSwap = () => {

	const {writeContractAsync, isPending, data: swapHash} = useWriteContract();

	const {isLoading: isConfirming, isSuccess} = useWaitForTransactionReceipt({
		hash: swapHash,
	});

	/**
     * 执行交换函数
     * @param fromToken 卖出的代币信息
     * @param toToken 买入的代币信息
     * @param amountIn 卖出数量
     * @param amountOut 买入数量
     * @param poolIndex 最佳池子索引
     * @param direction 交易方向
     */
	const swap = async (
		fromToken: TokenInfo,
		toToken: TokenInfo,
		amountIn: string,
		amountOut: string,
		poolIndex: number,
		direction: TradeDirection,
		userAddress: Address,
		slippage: string,
	) => {
		// 判定调用哪个合约函数：ExactInput 还是 ExactOutput
		const isExactInput = direction === TradeDirection.TO;

		// 将字符串转换为 BigInt
		const amountInBI = parseUnits(amountIn, fromToken.decimals);
		const amountOutBI = parseUnits(amountOut, toToken.decimals);

		const sqrtPriceLimitX96: bigint = fromToken.address.toLowerCase() < toToken.address.toLowerCase()
				? BigInt(TickMath.MIN_SQRT_RATIO.toString()) + 1n
				: BigInt(TickMath.MAX_SQRT_RATIO.toString()) - 1n;

		//调用合约
		if (isExactInput) {
			return await writeContractAsync({
				...swapConfig,
				functionName: "exactInput",
				args: [{
					tokenIn: fromToken.address,
					tokenOut: toToken.address,
					indexPath: [poolIndex],
					recipient: userAddress,
					deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 当前时间 + 20 分钟
					amountIn: amountInBI,
					amountOutMinimum: amountOutBI * BigInt(Math.floor(10000 - parseFloat(slippage) * 100)) / 10000n, // 设置滑点
					sqrtPriceLimitX96,
				}],
			});
		}
		else {
			return await writeContractAsync({
				...swapConfig,
				functionName: "exactOutput",
				args: [{
					tokenIn: fromToken.address,
					tokenOut: toToken.address,
					indexPath: [poolIndex],
					recipient: userAddress,
					deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // 当前时间 + 20 分钟
					amountOut: amountOutBI,
					amountInMaximum: maxUint256,
					sqrtPriceLimitX96,
				}],
			});
		}
	};

	return {
		swap,
		isSwapping: isPending || isConfirming,
		isSuccess,
	}
}