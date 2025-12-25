import { positionConfig } from "@/config/contracts";
import { useEffect, useState } from "react";
import { Address, parseUnits } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

interface DepositParams {
    token0: Address;
    token1: Address;
    index: number; // 对应 ABI 中的 uint32
    amount0: string;
    amount1: string;
    decimals0: number;
    decimals1: number;
}

export const useDeposit = () => {
	const {address: userAddress} = useAccount();
	const {writeContractAsync, isPending, data: depositHash, reset: resetDeposit} = useWriteContract();
	const {isLoading: isConfirming, isSuccess: wagamiSuccess} = useWaitForTransactionReceipt({
		hash: depositHash,
		confirmations: 2
	});

	const deposit = async ({
		token0,
		token1,
		index, // 对应 ABI 中的 uint32
		amount0,
		amount1,
		decimals0,
		decimals1,
	}: DepositParams) => {
		if(!userAddress) return;
		resetDeposit();
		const amount0Desired: bigint = parseUnits(amount0, decimals0);
		const amount1Desired: bigint = parseUnits(amount1, decimals1);

		const deadline: bigint = BigInt(Math.floor((Date.now() + 20 * 60 * 1000) / 1000));

		const mintParams = {
			token0,
			token1,
			index,                // 必须包含此参数
			amount0Desired,
			amount1Desired,
			recipient: userAddress,
			deadline,
		};

		return await writeContractAsync({
			...positionConfig,
			functionName: 'mint',
			args: [mintParams],
		});	
	}

		return {
		deposit,
		isLoading: isPending || isConfirming,
		isSuccess: wagamiSuccess,
		resetDeposit,
	};
};