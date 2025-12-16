import { Address } from "viem";
import { poolManagerABI } from "./PoolManagerABI";

export const poolManagerAddress: Address = "0xddC12b3F9F7C91C79DA7433D8d212FB78d609f7B";

export const poolManagerConfig = {
  address: poolManagerAddress,
  abi: poolManagerABI,
} as const;
