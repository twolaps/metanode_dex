import { client } from "@/config/client";
import { poolManagerConfig, swapConfig } from "@/config/contracts";
import { MAX_SQRT_PRICE, MIN_SQRT_PRICE, PairInfo, RawPoolInfo, TokenInfo } from "./types";
import { Address, erc20Abi, isAddress, maxUint256, parseUnits } from "viem";

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



export async function getSwapTokenMap(
	rawPools: RawPoolInfo[]): Promise<Map<Address, TokenInfo>> {

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




function getCandidatePools(
	pools: RawPoolInfo[],
	fromToken: TokenInfo,
	toToken: TokenInfo): RawPoolInfo[] {

	const candidatePools: RawPoolInfo[] = pools.filter((pool: RawPoolInfo) => {
		return ((pool.token0 === fromToken.address && pool.token1 === toToken.address) ||
					(pool.token0 === toToken.address && pool.token1 === fromToken.address)) && 
					pool.liquidity > 0n;
	});

	return candidatePools
}


export async function getOutQuote(
	fromToken: TokenInfo, 
	toToken: TokenInfo,
	amountIn: string,
	pools: RawPoolInfo[]
): Promise<{amountOut: bigint, poolIndex: number}> {

	console.log("Getting quote for:", {fromToken, toToken, amountIn});
	if (!amountIn || Number(amountIn) <= 0) return {amountOut: 0n, poolIndex: -1};
	const amountInBigint: bigint = parseUnits(amountIn, fromToken.decimals);
	const isLower: boolean = fromToken.address.toLowerCase() < toToken.address.toLowerCase();
	const limit: bigint = isLower ? MIN_SQRT_PRICE + 1n : MAX_SQRT_PRICE - 1n;
	const candidatePools: RawPoolInfo[] = getCandidatePools(pools, fromToken, toToken);

	if (candidatePools.length === 0) {
		console.warn("No available pools for the given token pair.");
		return {amountOut: 0n, poolIndex: -1};
	}

	console.log(candidatePools);

	const quotePromises = candidatePools.map(async (pool: RawPoolInfo) => {
		try {
			console.log(amountInBigint);
			const {result} = await client.simulateContract({
				...swapConfig,
				functionName: "quoteExactInput",
				args: [
					{
						tokenIn: fromToken.address,
						tokenOut: toToken.address,
						indexPath: [pool.index], // 默认路径索引数组
						amountIn: amountInBigint,
						sqrtPriceLimitX96: limit
					}
				],
			});
			console.log(`Quote from pool ${pool.index}:`, result);
			return {amountOut: result as bigint, poolIndex: pool.index};
		}
		catch (error) {
			console.error(`Error quoting on pool ${pool.index}:`, error);
			return {amountOut: 0n, poolIndex: pool.index};
		}
	});

	const quotes = await Promise.all(quotePromises);

	// 找到最大的 amountOut
	let maxAmountOut: bigint = 0n;
	let maxIndex: number = -1;
	quotes.forEach(({amountOut, poolIndex}) => {
		if (amountOut > maxAmountOut) {
			maxAmountOut = amountOut;
			maxIndex = poolIndex;
		}
	});

	if (maxAmountOut === 0n) {
		return {amountOut: 0n, poolIndex: -1};
	}
	return {amountOut: maxAmountOut, poolIndex: maxIndex};
}


export async function getInQuote(
	fromToken: TokenInfo, 
	toToken: TokenInfo,
	amountOut: string,
	pools: RawPoolInfo[]
): Promise<{amountIn: bigint, poolIndex: number}> {

	console.log("Getting quote for:", {fromToken, toToken, amountOut});
	if (!amountOut || Number(amountOut) <= 0) return {amountIn: 0n, poolIndex: -1};
	const amountOutBigint: bigint = parseUnits(amountOut, toToken.decimals);
	const isLower: boolean = fromToken.address.toLowerCase() < toToken.address.toLowerCase();
	const limit: bigint = isLower ? MIN_SQRT_PRICE + 1n : MAX_SQRT_PRICE - 1n;
	const candidatePools: RawPoolInfo[] = getCandidatePools(pools, fromToken, toToken);

	if (candidatePools.length === 0) {
		console.warn("No available pools for the given token pair.");
		return {amountIn: 0n, poolIndex: -1};
	}

	console.log(candidatePools);

	const quotePromises = candidatePools.map(async (pool: RawPoolInfo) => {
		try {
			console.log(amountOutBigint);
			const {result} = await client.simulateContract({
				...swapConfig,
				functionName: "quoteExactOutput",
				args: [
					{
						tokenIn: fromToken.address,
						tokenOut: toToken.address,
						indexPath: [pool.index], // 默认路径索引数组
						amountOut: amountOutBigint,
						sqrtPriceLimitX96: limit
					}
				],
			});
			console.log(`Quote from pool ${pool.index}:`, result);
			return {amountIn: result as bigint, poolIndex: pool.index};
		}
		catch (error) {
			console.error(`Error quoting on pool ${pool.index}:`, error);
			return {amountIn: 0n, poolIndex: pool.index};
		}
	});

	const quotes = await Promise.all(quotePromises);

	// 找到最小的 amountIn
	let minAmountIn: bigint = maxUint256;
	let minIndex: number = -1;
	quotes.forEach(({amountIn, poolIndex}) => {
		if (amountIn < minAmountIn) {
			minAmountIn = amountIn;
			minIndex = poolIndex;
		}
	});

	if (minAmountIn === maxUint256) {
		return {amountIn: 0n, poolIndex: -1};
	}
	
	return {amountIn: minAmountIn, poolIndex: minIndex};
}