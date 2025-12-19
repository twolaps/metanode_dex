import { client } from "@/config/client";
import { poolManagerConfig, swapConfig } from "@/config/contracts";
import { MAX_SQRT_PRICE, MIN_SQRT_PRICE, PairInfo, RawPoolInfo, TokenInfo } from "./types";
import { Address, erc20Abi, isAddress, parseUnits } from "viem";

export async function getPools(): Promise<RawPoolInfo[]> {
	let rawPools: RawPoolInfo[] = [];
	try {
		const result = await client.readContract({
			...poolManagerConfig,
			functionName: "getAllPools",
		});
		rawPools = result as RawPoolInfo[];

		console.log("poolData:", result.length);
	}
	catch (error) {
		console.error("Error fetching pools:", error);
	}

	return rawPools;
}

export async function getSwapTokenMap(rawPools: RawPoolInfo[]): Promise<Map<Address, TokenInfo>> {

	const tokenMap: Map<Address, TokenInfo> = new Map<Address, TokenInfo>();

	if(!rawPools || rawPools.length === 0) {
		return tokenMap;
	}

	rawPools.forEach((rawPoolInfo: RawPoolInfo) => {
		const token0Address = rawPoolInfo.token0;
		const token1Address = rawPoolInfo.token1;

		// 只有合法的地址才放入 Map 准备查询
		if (!tokenMap.has(token0Address) && isAddress(token0Address)) {
			tokenMap.set(token0Address, {address: token0Address, symbol: "UNKNOWN", decimals: 18});
		}

		if (!tokenMap.has(token1Address) && isAddress(token1Address)) {
			tokenMap.set(token1Address, {address: token1Address, symbol: "UNKNOWN", decimals: 18});
		}
	});

	// 3. 批量查询 (Multicall)
	if (tokenMap.size > 0) {
		const contracts = Array.from(tokenMap.keys()).flatMap((address: Address) => ([{
			address: address,
			abi: erc20Abi,
			functionName: "symbol",
		},
		{
			address: address,
			abi: erc20Abi,
			functionName: "decimals",
		}]));

		try {
			const result = await client.multicall({
				contracts,
				allowFailure: true,
			});

			// 回填结果
			result.forEach((res, index) => {
				const address = contracts[Math.floor(index / 2)].address;
				const info = tokenMap.get(address);
				if (info && res.status === 'success') {
					if (index % 2 === 0) {
						info.symbol = res.result as string;
					} 
					else {
						info.decimals = res.result as number;
					}
				}
			});
		}
		catch (error) {
			console.error("Multicall error:", error);
		}
	}

	return tokenMap;
}

export async function getPairs(): Promise<PairInfo[]> {

	let pairInfos: PairInfo[] = [];
	try {
		pairInfos = await client.readContract({
			...poolManagerConfig,
			functionName: "getPairs",
		}) as PairInfo[];
	}
	catch (error) {
		console.error("Error fetching pairs:", error);
	}

	return pairInfos;
}

export async function getQuote(
	fromToken: TokenInfo, 
	toToken: TokenInfo,
	amountIn: string): Promise<string> {
		if (!amountIn || Number(amountIn) <= 0) return "0.0000";

		const amountInBigint: bigint = parseUnits(amountIn, fromToken.decimals);

		const isLower: boolean = fromToken.address.toLowerCase() < toToken.address.toLowerCase();

		const limit: bigint = isLower ? MIN_SQRT_PRICE + 1n : MAX_SQRT_PRICE - 1n;

		const { result: amountOut } = await client.simulateContract({
			...swapConfig,
			functionName: "quoteExactInput",
			args: [
				{
					tokenIn: fromToken.address,
					tokenOut: toToken.address,
					indexPath: [0], // 默认路径索引数组
					amountIn: amountInBigint,
					sqrtPriceLimitX96: limit
				}
			],
		});

		console.log("Quoted amountOut:", amountOut);
		return amountOut.toString();
	}