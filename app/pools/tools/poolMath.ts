import { Address, createPublicClient, http, HttpTransport, isAddress } from "viem";
import { sepolia } from "viem/chains";

export interface RawPoolInfo {
  pool: Address;         // 池子合约地址
  token0: Address;       // Token0 地址
  token1: Address;       // Token1 地址
  index: number;         // uint32 (JS number 足够容纳)
  fee: number;           // int24 (JS number 足够容纳)
  feeProtocol: number;   // uint24 (JS number 足够容纳)
  tickLower: number;     // int24
  tickUpper: number;     // int24
  tick: number;          // int24
  sqrtPriceX96: bigint;  // uint160 (超出 number 范围，必须用 bigint)
  liquidity: bigint;     // uint128 (超出 number 范围，必须用 bigint)
}

export interface FormattedPoolInfo {
  pool: Address;         // 池子合约地址
  token0: string;        // Token0 符号 (注意：目前的逻辑返回的是地址字符串)
  token1: string;        // Token1 符号
}

// const client: HttpTransport = createPublicClient({
// 	// 配置你的公共客户端，例如使用以太坊主网
// 	chain: sepolia,
// 	transport: http(),
// });

/**
 * 批量格式化池子列表
 * 接收原始数据数组，使用 map 遍历转换为前端展示所需的格式数组
 * * @param rawPools 从链上获取的原始池子信息列表
 * @returns 格式化后的池子信息列表
 */
export function formatPoolInfos(rawPools: RawPoolInfo[]): FormattedPoolInfo[] {
  return rawPools.map(formatPoolInfo);
}

/**
 * 格式化单个池子信息
 * 将链上的 RawPoolInfo 原始数据结构转换为 UI 组件所需的 FormattedPoolInfo
 * * @param rawPool 单个原始池子数据对象
 * @returns 格式化后的数据对象
 */
export function formatPoolInfo(rawPool: RawPoolInfo): FormattedPoolInfo {
  // 注意：目前的 getTokenSymbols 实现逻辑是返回排序后的地址，而非真正的 Symbol (如 "USDC")
  // 如果需要显示 Symbol，后续需要在这里接入异步获取 Symbol 的逻辑
  const [token0Symbol, token1Symbol] = getTokenSymbols(rawPool);

  return {
    pool: rawPool.pool,
    token0: token0Symbol,
    token1: token1Symbol,
  };
}

/**
 * 获得交易对的代币符号
 * (注：当前实现逻辑为返回排序后的代币地址)
 * @param pool 
 * @returns [token0, token1]
 */
export function getTokenSymbols(pool: RawPoolInfo): [string, string] {
    if (!pool) {
      return ["UNKNOWN", "UNKNOWN"];
    }

    if (isAddress(pool.token0) && isAddress(pool.token1)) {
      // 简单的地址排序逻辑，确保小的地址在前 (Uniswap 标准)
      if (pool.token0 > pool.token1) {
        return [pool.token1, pool.token0];
      }
      else {
        return [pool.token0, pool.token1];
      }
    }
    else {
      return ["INVALID_ADDRESS", "INVALID_ADDRESS"];
    }
}