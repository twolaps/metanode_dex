import { swapConfig } from "@/config/contracts";
import { Address, erc20Abi, maxUint256 } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const useApprove = (tokenAddress?: Address) => {
	// Your hook logic here
	const {writeContractAsync, isPending, data: approveHash} = useWriteContract();
	const {isLoading: isConfirming, isSuccess} = useWaitForTransactionReceipt({
		hash: approveHash,
	});

	const approve = async () => {
		if(!tokenAddress) return;

		const txHash = await writeContractAsync({
			address: tokenAddress,
			abi: erc20Abi,
			functionName: 'approve',
			args: [swapConfig.address as Address, maxUint256],
		});

		return txHash;	
	};

	return {
		approve,
		isLoading: isPending || isConfirming,
		isSuccess,
	};
};