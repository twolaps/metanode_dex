import { poolABI } from "./PoolABI";
import { positionABI } from "./PositionABI";
import { swapABI } from "./SwapABI1";
import { poolContract, positionContract, swapContract } from "./contract_address";

export const poolManagerConfig = {
  address: poolContract,
  abi: poolABI,
} as const;

export const swapConfig = {
	address: swapContract,
	abi: swapABI,
} as const;

export const positionConfig = {
	address: positionContract,
	abi: positionABI,
} as const;