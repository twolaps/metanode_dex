import { poolManagerABI } from "./PoolManagerABI";
import { poolContract, swapContract } from "./contract_address";
import { swapABI } from "./swapABI";

export const poolManagerConfig = {
  address: poolContract,
  abi: poolManagerABI,
} as const;

export const swapConfig = {
	address: swapContract,
	abi: swapABI,
} as const;
