import { client } from "@/config/client";
import { poolManagerConfig, swapConfig } from "@/config/contracts";
import { InQuoteInfo, OutQuoteInfo, PairInfo, SwapStatus, RawPoolInfo, TokenInfo } from "./types";
import { Address, erc20Abi, isAddress, maxUint256, parseUnits } from "viem";
import { TickMath } from "@uniswap/v3-sdk";

/**
 * 1. 获取所有流动性池信息
 * 作用：从合约中读取所有已创建的池子列表。这是整个 Swap 的数据基础。
 * 类比：游戏初始化时加载所有地图关卡信息。
 */
export async function getPools(): Promise<RawPoolInfo[]> {
	let rawPools: RawPoolInfo[] = [];
	try {
		// 使用 readContract 直接读取链上数据
		const result = await client.readContract({
			...poolManagerConfig, // 合约地址和 ABI 配置
			functionName: "getAllPools",
		});
		// 强制类型转换为我们要的格式
		rawPools = result as RawPoolInfo[];

		console.log("poolData:", result.length);
	}
	catch (error) {
		console.error("Error fetching pools:", error);
	}

	return rawPools;
}


/**
 * 2. 构建代币映射表 (Token Map)
 * 作用：根据池子里的 token0 和 token1 地址，去链上查它们的“名字(Symbol)”和“精度(Decimals)”。
 * 亮点：使用了 Multicall (批量查询)，一次网络请求查几百个数据，极大优化性能。
 */
export async function getSwapTokenMap(
	rawPools: RawPoolInfo[]): Promise<Map<Address, TokenInfo>> {

	const tokenMap: Map<Address, TokenInfo> = new Map<Address, TokenInfo>();

	// 防御性编程：如果没有池子数据，直接返回空 Map
	if(!rawPools || rawPools.length === 0) {
		return tokenMap;
	}

	// --- 步骤 A: 收集所有不重复的代币地址 ---
	rawPools.forEach((rawPoolInfo: RawPoolInfo) => {
		const token0Address = rawPoolInfo.token0;
		const token1Address = rawPoolInfo.token1;

		// 只有合法的地址，且 Map 里还没存过的，才放进去初始化
		// 初始状态下 Symbol 是 "UNKNOWN", decimals 默认为 18
		if (!tokenMap.has(token0Address) && isAddress(token0Address)) {
			tokenMap.set(token0Address, {address: token0Address, symbol: "UNKNOWN", decimals: 18});
		}

		if (!tokenMap.has(token1Address) && isAddress(token1Address)) {
			tokenMap.set(token1Address, {address: token1Address, symbol: "UNKNOWN", decimals: 18});
		}
	});

	// --- 步骤 B: 批量查询 (Multicall) ---
	if (tokenMap.size > 0) {
		// 构造批量调用的请求数组
		// 对每个代币，我们生成两个请求：查 symbol 和 查 decimals
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
			// 发起批量调用
			// allowFailure: true 表示即使某个币查询失败，不要让整个请求挂掉
			const result = await client.multicall({
				contracts,
				allowFailure: true,
			});

			// --- 步骤 C: 将查询结果回填到 Map 中 ---
			result.forEach((res, index) => {
				// 计算当前结果属于哪个合约地址（因为之前是 flatMap 展开的，每2个对应一个地址）
				const address = contracts[index].address;
				const info = tokenMap.get(address);
				
				// 只有查询成功才更新信息
				if (info && res.status === 'success') {
					if (index % 2 === 0) {
						// 偶数索引是 Symbol
						info.symbol = res.result as string;
					} 
					else {
						// 奇数索引是 Decimals
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



/**
 * 3. 获取交易对信息 (Pairs)
 * 作用：获取所有交易对的列表（可能包含非池子的配对信息，视合约逻辑而定）。
 */
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

/**
 * 辅助函数：筛选候选池
 * 作用：根据用户选择的 Token A 和 Token B，从几百个池子里找出所有包含这两个币的池子。
 * 逻辑：无论是 A-B 还是 B-A 排列，都算作有效池子，且池子必须有流动性 (>0)。
 */
function getCandidatePools(
	pools: RawPoolInfo[],
	fromToken: TokenInfo,
	toToken: TokenInfo): RawPoolInfo[] {

	const candidatePools: RawPoolInfo[] = pools.filter((pool: RawPoolInfo) => {
		return ((pool.token0 === fromToken.address && pool.token1 === toToken.address) ||
					(pool.token0 === toToken.address && pool.token1 === fromToken.address)) && 
					pool.liquidity > 0n; // 过滤掉空池子
	});

	return candidatePools
}


/**
 * 4. 核心功能：获取【精确输入】报价 (Exact Input)
 * 场景：用户输入 "我卖 1 个 ETH"，系统计算 "你能拿到多少 USDT"。
 * 返回：能拿到的最大 amountOut 和对应的最佳池子索引。
 */
export async function getOutQuote(
	fromToken: TokenInfo, 
	toToken: TokenInfo,
	amountIn: string,
	pools: RawPoolInfo[]
): Promise<OutQuoteInfo> {

	console.log("Getting quote for:", {fromToken, toToken, amountIn});
	
	// 校验：输入金额必须大于 0
	if (!amountIn || Number(amountIn) <= 0) return {amountOut: 0n, poolIndex: -1, error: SwapStatus.INVALID_AMOUNT};
	
	// --- 关键步骤 1: 数值转换 ---
	// 用户输入的 "1.0" 需要转成链上的 BigInt，例如 1.0 ETH = 1000000000000000000
	const amountInBigint: bigint = parseUnits(amountIn, fromToken.decimals);
	
	// --- 关键步骤 2: 确定价格方向 ---
	// Uniswap V3 数学逻辑：根据地址排序决定 sqrtPriceLimitX96 是向上还是向下寻找
	const isLower: boolean = fromToken.address.toLowerCase() < toToken.address.toLowerCase();
	const limit: bigint = isLower ? BigInt(TickMath.MIN_SQRT_RATIO.toString()) + 1n : BigInt(TickMath.MAX_SQRT_RATIO.toString()) - 1n;
	
	// --- 关键步骤 3: 找池子 ---
	const candidatePools: RawPoolInfo[] = getCandidatePools(pools, fromToken, toToken);

	if (candidatePools.length === 0) {
		console.warn("No available pools for the given token pair.");
		return {amountOut: 0n, poolIndex: -1, error: SwapStatus.NO_POOL};
	}

	console.log(candidatePools);

	// --- 关键步骤 4: 模拟交易 (Simulate) ---
	// 对每一个候选池，都在本地模拟执行 quoteExactInput 函数，看谁给的钱多
	const quotePromises = candidatePools.map(async (pool: RawPoolInfo) => {
		try {
			console.log(amountInBigint);
			// simulateContract 不会消耗 Gas，只是向节点询问“如果我执行这个交易，结果会是多少？”
			const {result} = await client.simulateContract({
				...swapConfig,
				functionName: "quoteExactInput",
				args: [
					{
						tokenIn: fromToken.address,
						tokenOut: toToken.address,
						indexPath: [pool.index], // 指定特定池子索引
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
			// 如果某个池子报错（比如流动性不够），返回 0
			return {amountOut: 0n, poolIndex: pool.index, error: SwapStatus.INSUFFICIENT_LIQUIDITY};
		}
	});

	// 并行等待所有池子的报价结果
	const quotes = await Promise.all(quotePromises);

	// --- 关键步骤 5: 择优录取 ---
	// 遍历结果，找出 amountOut 最大的那个池子
	let maxAmountOut: bigint = 0n;
	let maxIndex: number = -1;
	quotes.forEach(({amountOut, poolIndex}) => {
		if (amountOut > maxAmountOut) {
			maxAmountOut = amountOut;
			maxIndex = poolIndex;
		}
	});

	if (maxAmountOut === 0n) {
		return {amountOut: 0n, poolIndex: -1, error: SwapStatus.INSUFFICIENT_LIQUIDITY};
	}
	return {amountOut: maxAmountOut, poolIndex: maxIndex, error: SwapStatus.NONE};
}


/**
 * 5. 核心功能：获取【精确输出】报价 (Exact Output)
 * 场景：用户输入 "我想得到 1000 USDT"，系统计算 "你需要支付多少 ETH"。
 * 返回：需要支付的最小 amountIn 和对应的最佳池子索引。
 */
export async function getInQuote(
	fromToken: TokenInfo, 
	toToken: TokenInfo,
	amountOut: string,
	pools: RawPoolInfo[]
): Promise<InQuoteInfo> {

	console.log("Getting quote for:", {fromToken, toToken, amountOut});
	
	// 校验金额
	if (!amountOut || Number(amountOut) <= 0) return {amountIn: 0n, poolIndex: -1, error: SwapStatus.INVALID_AMOUNT};
	
	// 数值转换：注意这里转换的是 amountOut (买入币的精度)
	const amountOutBigint: bigint = parseUnits(amountOut, toToken.decimals);
	
	// 确定价格方向限制
	const isLower: boolean = fromToken.address.toLowerCase() < toToken.address.toLowerCase();
	const limit: bigint = isLower ? BigInt(TickMath.MIN_SQRT_RATIO.toString()) + 1n : BigInt(TickMath.MAX_SQRT_RATIO.toString()) - 1n;
	
	// 找池子
	const candidatePools: RawPoolInfo[] = getCandidatePools(pools, fromToken, toToken);

	if (candidatePools.length === 0) {
		console.warn("No available pools for the given token pair.");
		return {amountIn: 0n, poolIndex: -1, error: SwapStatus.NO_POOL};
	}

	console.log(candidatePools);

	// 模拟交易：这次调用 quoteExactOutput
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
						indexPath: [pool.index],
						amountOut: amountOutBigint,
						sqrtPriceLimitX96: limit
					}
				],
			});
			console.log(`Quote from pool ${pool.index}:`, result);
			return {amountIn: result as bigint, poolIndex: pool.index, error: SwapStatus.NONE};
		}
		catch (error) {
			console.error(`Error quoting on pool ${pool.index}:`, error);
			return {amountIn: 0n, poolIndex: pool.index, error: SwapStatus.INSUFFICIENT_LIQUIDITY};
		}
	});

	const quotes = await Promise.all(quotePromises);

	// --- 关键步骤 5: 择优录取 (逻辑相反) ---
	// 这里的目标是：为了买到目标数量的币，我希望支付的钱越少越好
	// 所以我们要找 minAmountIn
	let minAmountIn: bigint = maxUint256; // 初始化为一个巨大的数
	let minIndex: number = -1;
	
	quotes.forEach(({amountIn, poolIndex}) => {
		// 只有当 amountIn 有效 (>0) 且比当前最小值还小的时候，才更新
		if (amountIn > 0n && amountIn < minAmountIn) {
			minAmountIn = amountIn;
			minIndex = poolIndex;
		}
	});

	// 如果最小值还是那个初始化的巨大数，说明所有池子都失败了
	if (minAmountIn === maxUint256) {
		return {amountIn: 0n, poolIndex: -1, error: SwapStatus.INSUFFICIENT_LIQUIDITY};
	}
	
	return {amountIn: minAmountIn, poolIndex: minIndex, error: SwapStatus.NONE};
}