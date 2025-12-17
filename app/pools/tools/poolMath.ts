import { Address, createPublicClient, erc20Abi, http, isAddress, PublicClient } from "viem";
import { sepolia } from "viem/chains";

export interface RawPoolInfo {
  pool: Address;         
  token0: Address;       
  token1: Address;       
  index: number;         
  fee: number;           
  feeProtocol: number;   
  tickLower: number;     
  tickUpper: number;     
  tick: number;          
  sqrtPriceX96: bigint;  
  liquidity: bigint;     
}

export interface FormattedPoolInfo {
  pool: Address;         
  token0: string;        
  token1: string;        
}

// 建议：在真实项目中，client 最好提取到单独的配置文件中
const client: PublicClient = createPublicClient({
	chain: sepolia,
	transport: http(),
});

export async function formatPoolInfos(rawPools: RawPoolInfo[]): Promise<FormattedPoolInfo[]> {
	// 1. 边界检查
	if(!rawPools || rawPools.length === 0) {
		return [];
	}

	// 2. 收集与去重
	const tokenMap: Map<Address, string> = new Map<Address, string>();
	
	rawPools.forEach((rawPoolInfo: RawPoolInfo) => {
		const token0Address = rawPoolInfo.token0;
		const token1Address = rawPoolInfo.token1;

		// 只有合法的地址才放入 Map 准备查询
		if (!tokenMap.has(token0Address) && isAddress(token0Address)) {
			tokenMap.set(token0Address, "UNKNOWN");
		}

		if (!tokenMap.has(token1Address) && isAddress(token1Address)) {
			tokenMap.set(token1Address, "UNKNOWN");
		}
	});

	// 3. 批量查询 (Multicall)
	if (tokenMap.size > 0) {
		const contracts = Array.from(tokenMap.keys()).map((address: Address) => ({
			address: address,
			abi: erc20Abi,
			functionName: "symbol",
		}));

		try {
			const result = await client.multicall({
				contracts,
				allowFailure: true,
			});

			// 回填结果
			result.forEach((res, index) => {
				const address = contracts[index].address;
				if (res.status === 'success') {
					tokenMap.set(address, res.result as string);
				} else {
					tokenMap.set(address, "UNKNOWN");
				}
			});
		}
		catch (error) {
			console.error("Multicall error:", error);
		}
	}

	// 4. 组装数据
	const formattedPoolInfos: FormattedPoolInfo[] = rawPools.map((rawPool: RawPoolInfo) => {
		// 使用 || 运算符处理默认值
		const token0Symbol = tokenMap.get(rawPool.token0) || "UNKNOWN";
		const token1Symbol = tokenMap.get(rawPool.token1) || "UNKNOWN";

		const formattedPool: FormattedPoolInfo = {
			pool: rawPool.pool,
			token0: token0Symbol,
			token1: token1Symbol,
		};

		return formattedPool;
	});

	return formattedPoolInfos;
}