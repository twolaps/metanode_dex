import { positionConfig } from "@/config/contracts";
import { Address } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const useCollect = () => {
	const {data:hash, writeContract, isPending, error} = useWriteContract();
	const {isLoading: isCollecting, isSuccess} = useWaitForTransactionReceipt({
		hash
	});

	const collect = async (tokenId: bigint, recipient: Address) => {
		if (!recipient) {
			throw new Error("Recipient address is required for collecting fees.");
			return;
		}

		return await writeContract({
			...positionConfig,
			functionName: 'collect',
			args: [tokenId, recipient]
		});
	};

	return {
		collect,
		isPending,
		isCollecting,
		isSuccess,
		error
	}
}