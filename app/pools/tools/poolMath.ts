import { FormattedPoolInfo, RawPoolInfo, TokenInfo } from "@/app/tools/types";
import { client } from "@/config/client";
import { poolManagerConfig } from "@/config/contracts";
import { Address, erc20Abi, isAddress, stringify } from "viem";

export async function formatPoolInfos(): Promise<FormattedPoolInfo[]> {

	let rawPools: RawPoolInfo[] = [];
	try {
		const result = await client.readContract({
			...poolManagerConfig,
			functionName: "getAllPools",
		});
		rawPools = result as RawPoolInfo[];

		console.log("poolData:", stringify(rawPools));
	}
	catch (error) {
		console.error("Error fetching pools:", error);
	}


	// 1. 边界检查
	if(!rawPools || rawPools.length === 0) {
		return [];
	}

	// 2. 收集与去重
	const tokenMap: Map<Address, TokenInfo> = new Map<Address, TokenInfo>();
	
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

	// 4. 组装数据
	const formattedPoolInfos: FormattedPoolInfo[] = rawPools.map((rawPool: RawPoolInfo) => {
		const info0 = tokenMap.get(rawPool.token0);
		const info1 = tokenMap.get(rawPool.token1);
		const token0Symbol = info0?.symbol || "UNKNOWN";
		const token1Symbol = info1?.symbol || "UNKNOWN";
		const decimals0: number = info0?.decimals || 18;
		const decimals1: number = info1?.decimals || 18;

		const decimalAdjustment: number = 10 ** (decimals0 - decimals1);

		let range: string = '1';
		if (rawPool.tickLower === -887220 && rawPool.tickUpper === 887220) {
			range = 'Full Range';
		}
		else if (rawPool.tickLower < rawPool.tickUpper) {
			range = `${formatPrice(1.0001 ** rawPool.tickLower * decimalAdjustment)} to ${formatPrice(1.0001 ** rawPool.tickUpper * decimalAdjustment)}`;
		}
		else {
			range = `${formatPrice(1.0001 ** rawPool.tickUpper * decimalAdjustment)} to ${formatPrice(1.0001 ** rawPool.tickLower * decimalAdjustment)}`;
		}

		const price: string = formatPrice((Number(rawPool.sqrtPriceX96) / (2 ** 96)) ** 2 * decimalAdjustment);

		const formatter: Intl.NumberFormat = new Intl.NumberFormat('en-US', { notation: 'compact' });

		const formattedPool: FormattedPoolInfo = {
			pool: rawPool.pool,
			token0: token0Symbol,
			token1: token1Symbol,
			decimals0,
			decimals1,
			fee: `${parseFloat((rawPool.fee / 10000).toFixed(2))}%`,
			range,
			price,
			liquidity: formatter.format(Number(rawPool.liquidity)),
		};

		return formattedPool;
	});

	return formattedPoolInfos;
}

function formatPrice(p: number): string {
	if (p === 0) return "0";
	return (p < 0.001 || p > 1e6) ? p.toExponential(2) : p.toFixed(4);
}