import { poolABI } from "./PoolABI";
import { poolContract, positionContract, swapContract } from "./contract_address";
import { positionABI } from "./positionABI";
import { swapABI } from "./swapABI";

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