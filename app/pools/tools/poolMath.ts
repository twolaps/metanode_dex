import { FormattedPoolInfo, RawPoolInfo, RawPositionInfo, TokenInfo } from "@/app/tools/types";
import { client } from "@/config/client";
import { poolManagerConfig } from "@/config/contracts";
import { Token } from "@uniswap/sdk-core";
import { TICK_SPACINGS, Pool, Position, encodeSqrtRatioX96, TickMath, nearestUsableTick } from "@uniswap/v3-sdk";
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

		console.log("poolData:", rawPools);
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

		const spacing: number = TICK_SPACINGS[rawPool.fee as keyof typeof TICK_SPACINGS];
		let range: string = '1';
		const minTick: number = nearestUsableTick(TickMath.MIN_TICK, spacing);
		const maxTick: number = nearestUsableTick(TickMath.MAX_TICK, spacing);
		if (rawPool.tickLower === minTick && rawPool.tickUpper === maxTick) {
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

  const calcAmount0 = BigInt(position.amount0.quotient.toString());
  const calcAmount1 = BigInt(position.amount1.quotient.toString());

  // 4. 逻辑处理：如果返回的 amount0 被修正为 0，说明当前价格不接受 Token0
  if (calcAmount0 === 0n && amount0 > 0n) {
      return [0n, calcAmount1, "当前价格高于区间，请通过输入代币B来添加"];
  }

  return [calcAmount0, calcAmount1, ""];
};


/**
 * 利用 SDK 的 Position 类计算配对量
 */
export const calculateAmountsFrom1 = (
  amount1: bigint,
  poolInfo: FormattedPoolInfo, // 包含 tokenInfo0, tokenInfo1, rawPoolInfo 等
	chainID: number,
): [bigint, bigint, string] => {
  if (amount1 <= 0n) return [0n, 0n, "请输入大于 0 的金额"];

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
    amount0: maxUint256.toString(),
    amount1: amount1.toString(), // 给一个无限大的 amount1 允许它自由配对
    useFullPrecision: true,
  });

  const calcAmount0 = BigInt(position.amount0.quotient.toString());
  const calcAmount1 = BigInt(position.amount1.quotient.toString());

  // 4. 逻辑处理：如果返回的 amount1 被修正为 0，说明当前价格不接受 Token1
  if (calcAmount1 === 0n && amount1 > 0n) {
      return [0n, calcAmount1, "当前价格低于区间，请通过输入代币A来添加"];
  }

  return [calcAmount0, calcAmount1, ""];
};

export const getRange = (initialPrice: string, feeTier: string): [number, number] => {
	let lower: number;
	let upper: number;
	if (feeTier == "500") {
		lower = Number(initialPrice) * 0.995;
		upper = Number(initialPrice) * 1.005;
	}
	else if (feeTier == "3000") {
		lower = Number(initialPrice) * 0.8;
		upper = Number(initialPrice) * 1.2;
	}
	else if (feeTier == "10000") {
		lower = Number(initialPrice) * 0.5;
		upper = Number(initialPrice) * 2;
	}
	else {
		lower = Number(initialPrice) * 0.9;
		upper = Number(initialPrice) * 1.1;
	}
	return [lower, upper];
};


/**
 * 将 initialPrice 转换为 sqrtPriceX96
 * @param price 用户输入的初始价格 (number 或 string)
 * @param token0Decimals token0 的精度
 * @param token1Decimals token1 的精度
 */
export function encodePriceToSqrtX96(
	price: string, token0Decimals: number, token1Decimals: number): bigint {

  // 2. 为了保留精度，我们将价格放大一个很大的倍数（比如 10^10）
  // 这样可以将小数价格转为整数处理
  const scalar = 10 ** 10;
  const priceScaled = BigInt(Math.floor(parseFloat(price) * scalar));

  // 3. 计算 raw amounts
  // 公式逻辑：amount1 / amount0 = price * (10^d1 / 10^d0)
  // 代入放大倍数：amount1 / amount0 = (priceScaled / scalar) * (10^d1 / 10^d0)
  // 整理得：amount1 = priceScaled * 10^d1, amount0 = scalar * 10^d0
  
  const amount1 = priceScaled * (10n ** BigInt(token1Decimals));
  const amount0 = BigInt(scalar) * (10n ** BigInt(token0Decimals));

  // 4. 使用 SDK 转换（SDK 内部会处理平方根和 Q64.96 逻辑）
  const sqrtPriceX96 = encodeSqrtRatioX96(amount1.toString(), amount0.toString());
  
  return BigInt(sqrtPriceX96.toString());
}

/**
 * 将价格转换为 Tick
 * @param price 价格字符串 (Token1 / Token0)
 * @param t0Decimals Token0 精度
 * @param t1Decimals Token1 精度
 * @param tickSpacing 费率对应的间隔 (如 0.3% 对应 60)
 */
export function priceToTick(
  price: string, 
  t0Decimals: number, 
  t1Decimals: number, 
  tickSpacing: number
): number {
  // 1. 先利用你现有的逻辑算出 sqrtPriceX96
  // (或者直接在这里复用 encodePriceToSqrtX96 的逻辑)
  const sqrtX96 = encodePriceToSqrtX96(price, t0Decimals, t1Decimals);

  // 2. 使用 SDK 将 sqrtPriceX96 转换为原始 Tick
  // 注意：需要转为 JSBI 类型供 SDK 使用
  const tick = TickMath.getTickAtSqrtRatio(JSBI.BigInt(sqrtX96.toString()));

  // 3. 重要：必须“对齐”到 tickSpacing，否则合约会报错
  // tickLower 应该向下取整到 spacing 的倍数
  return Math.floor(tick / tickSpacing) * tickSpacing;
}

export const sortTokens = (a: TokenInfo, b: TokenInfo): TokenInfo[] => {
	return a.address.toLowerCase() < b.address.toLowerCase() ? [a, b] : [b, a];
}

/**
 * 计算仓位当前的资产构成 (Token0 和 Token1 的数量)
 */
export function getPositionAmounts(
  position: RawPositionInfo, 
  poolInfo: FormattedPoolInfo, 
  chainId: number = 1 // 根据您的链ID调整，或者从配置读取
) {
  // 1. 构建 Token 实例
  const token0 = new Token(chainId, poolInfo.tokenInfo0.address, poolInfo.tokenInfo0.decimals, poolInfo.tokenInfo0.symbol);
  const token1 = new Token(chainId, poolInfo.tokenInfo1.address, poolInfo.tokenInfo1.decimals, poolInfo.tokenInfo1.symbol);

  // 2. 构建 Pool 实例 (SDK 需要知道当前池子的状态)
  const pool = new Pool(
    token0,
    token1,
    poolInfo.rawPoolInfo.fee,
    poolInfo.rawPoolInfo.sqrtPriceX96.toString(),
    poolInfo.rawPoolInfo.liquidity.toString(),
    poolInfo.rawPoolInfo.tick
  );

  // 3. 构建 Position 实例
  // 这一步最关键：SDK 会根据 liquidity + currentTick 自动算出 amount0 和 amount1
  const sdkPosition = new Position({
    pool,
    liquidity: position.liquidity.toString(),
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
  });

  // 4. 获取结果 (返回的是字符串形式的可读数字，或者您需要的 BigInt)
  return {
    amount0: sdkPosition.amount0, // CurrencyAmount 对象
    amount1: sdkPosition.amount1, // CurrencyAmount 对象
    // 如果您直接想要格式化好的字符串：
    amount0Str: sdkPosition.amount0.toSignificant(6),
    amount1Str: sdkPosition.amount1.toSignificant(6),
  };
}
