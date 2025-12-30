import { Token } from "@uniswap/sdk-core";
import { Pool, Position } from "@uniswap/v3-sdk";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPositionAmounts(
  poolTick: number,
  poolSqrtPriceX96: string | bigint,
  poolLiquidity: string | bigint,
  token0Addr: string,
  token1Addr: string,
  token0Decimals: number, // 注意：为了显示正确的单位，最好传入真实的 decimals
  token1Decimals: number,
  positionLiquidity: string | bigint,
  tickLower: number,
  tickUpper: number,
	chainId: number,
) {
  // 1. 构建 Token 实例
  // SDK 需要 Token 实例来构建 Pool。如果这里没有 Symbol 也没关系，核心计算只依赖 Decimals 和地址
  const token0 = new Token(chainId, token0Addr, token0Decimals, 'T0', 'Token0');
  const token1 = new Token(chainId, token1Addr, token1Decimals, 'T1', 'Token1');

  // 2. 构建 Pool 实例
  // 这里的 liquidity 指的是当前池子的总流动性 (L)，而不是您的仓位流动性
  const pool = new Pool(
    token0,
    token1,
    3000, // fee: 这里填 3000 (0.3%) 还是其他数字不影响 amount 计算结果，只影响 Pool 唯一性
    poolSqrtPriceX96.toString(),
    poolLiquidity.toString(),
    poolTick
  );

  // 3. 构建 Position 实例
  // SDK 会自动根据当前 pool 的价格和 tick，计算出这个 position 包含多少 amount0 和 amount1
  const position = new Position({
    pool,
    liquidity: positionLiquidity.toString(),
    tickLower,
    tickUpper,
  });

  // 4. 获取结果 (SDK 返回的是 CurrencyAmount)
  // .quotient 拿到的是大整数 (BigInt 形式的 JSBI)，我们需要转成 string 或原生 bigint
  const amount0 = BigInt(position.amount0.quotient.toString());
  const amount1 = BigInt(position.amount1.quotient.toString());

  return { amount0, amount1 };
}