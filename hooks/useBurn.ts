import { positionConfig } from "@/config/contracts";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export const useBurn = () => {

	const {data:hash, writeContract, isPending} = useWriteContract();
	const {isLoading: isBurning, isSuccess} = useWaitForTransactionReceipt({
		hash
	});

	const burn = async (positionId: bigint) => {
		return writeContract({
			...positionConfig,
			functionName: "burn",
			args: [positionId]
		});
	};

	return {burn, isPending, isBurning, isSuccess};
}