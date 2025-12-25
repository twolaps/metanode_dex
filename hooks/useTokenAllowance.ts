import { TokenInfo } from "@/app/tools/types";
import { useMemo } from "react";
import { Address, erc20Abi, parseUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";

export const useTokenAllowance = (
	tokenInfo: TokenInfo | null | undefined,
	amountIn: string | undefined,
	spenderAddress: Address) => {
		const {address: userAddress} = useAccount();

		// 1. 查数据：跟 amountIn 没关系，只要有币就查
    const { data: allowance, refetch } = useReadContract({
			address: tokenInfo?.address,
        abi: erc20Abi,
        functionName: "allowance",
        args: [userAddress!, spenderAddress!],
        query: {
            // 只要选了币、连了钱包，就开始静默查询
            enabled: !!tokenInfo?.address && !!userAddress, 
        }
    });

		// 2. 算状态：在这里处理“空输入”的情况
    const needsApprove = useMemo(() => {

			if (!tokenInfo || !amountIn || allowance === undefined) {
				return false; // 没币、没输入、没数据，都不需要 approve
			}

			if (Number(amountIn) <= 0 || isNaN(Number(amountIn))) {
				return false; // 输入无效时，不需要 approve
			}

			if (tokenInfo.symbol === "ETH") {
				return false; // ETH 不需要 approve
			}


			// 正常情况：比较 allowance 和 amountIn
			const amountInBigInt = parseUnits(amountIn, tokenInfo.decimals);

			return allowance < amountInBigInt;
		}, [allowance, amountIn, tokenInfo]);

		console.log("useTokenAllowance - token:", tokenInfo?.symbol, "amountIn:", amountIn, "allowance:", allowance?.toString(), "needsApprove:", needsApprove);
		return {allowance, needsApprove, refetch}
};