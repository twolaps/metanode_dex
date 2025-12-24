import { FormattedPoolInfo, RawPoolInfo, TokenInfo } from "@/app/tools/types";
import { client } from "@/config/client";
import { poolManagerConfig } from "@/config/contracts";
import { Token } from "@uniswap/sdk-core";
import { TICK_SPACINGS, Pool, Position } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { Address, erc20Abi, isAddress, maxUint256 } from "viem";

export async function formatPoolInfos(): Promise<FormattedPoolInfo[]> {

	let rawPools: RawPoolInfo[] = [];
	try {
		const result = await client.readContract({
			...poolManagerConfig,
			functionName: "getAllPools",
		});
		rawPools = result as RawPoolInfo[];

		// console.log("poolData:", stringify(rawPools));
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
				const address = contracts[index].address;
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

	const supportFees: number[] = Object.keys(TICK_SPACINGS).map(Number);
	const formattedPoolInfos: FormattedPoolInfo[] = rawPools.filter((rawPool)=> {
		return supportFees.includes(rawPool.fee);
	}).map((rawPool: RawPoolInfo) => {
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
			tokenInfo0: {address: rawPool.token0, symbol: token0Symbol, decimals: decimals0},
			tokenInfo1: {address: rawPool.token1, symbol: token1Symbol, decimals: decimals1},
			fee: `${parseFloat((rawPool.fee / 10000).toFixed(2))}%`,
			range,
			price,
			liquidity: formatter.format(Number(rawPool.liquidity)),
			rawPoolInfo: rawPool,
		};

		return formattedPool;
	});

	return formattedPoolInfos;
}

export function formatPrice(p: number): string {
	if (p === 0) return "0";
	return (p < 0.001 || p > 1e6) ? p.toExponential(2) : p.toFixed(4);
}

/**
 * 利用 SDK 的 Position 类计算配对量
 */
export const calculateAmountsFrom0 = (
  amount0: bigint,
  poolInfo: FormattedPoolInfo, // 包含 tokenInfo0, tokenInfo1, rawPoolInfo 等
	chainID: number,
): [bigint, bigint, string] => {
  if (amount0 <= 0n) return [0n, 0n, "请输入大于 0 的金额"];

  // 1. 构建 SDK 所需的 Token 对象
  const token0 = new Token(chainID, poolInfo.tokenInfo0.address, poolInfo.tokenInfo0.decimals);
  const token1 = new Token(chainID, poolInfo.tokenInfo1.address, poolInfo.tokenInfo1.decimals);

  // 2. 构建虚拟 Pool 对象
  const pool = new Pool(
    token0,
    token1,
    poolInfo.rawPoolInfo.fee,
    poolInfo.rawPoolInfo.sqrtPriceX96.toString(),
    poolInfo.rawPoolInfo.liquidity.toString(),
    poolInfo.rawPoolInfo.tick
  );

  // 3. 使用 Position.fromAmounts 自动计算
  // 这个方法会根据当前价格、区间和输入的 amount0，自动推导出最大可用的 liquidity 和对应的 amount1
  const position = Position.fromAmounts({
    pool: pool,
    tickLower: poolInfo.rawPoolInfo.tickLower,
    tickUpper: poolInfo.rawPoolInfo.tickUpper,
    amount0: amount0.toString(),
    amount1: maxUint256.toString(), // 给一个无限大的 amount1 允许它自由配对
    useFullPrecision: true,
  });

	const a: JSBI = JSBI.BigInt("0");
	console.log(a);

  const calcAmount0 = BigInt(position.amount0.quotient.toString());
  const calcAmount1 = BigInt(position.amount1.quotient.toString());

  // 4. 逻辑处理：如果返回的 amount0 被修正为 0，说明当前价格不接受 Token0
  if (calcAmount0 === 0n && amount0 > 0n) {
      return [0n, calcAmount1, "当前价格高于区间，请通过输入代币B来添加"];
  }

  return [calcAmount0, calcAmount1, ""];
};