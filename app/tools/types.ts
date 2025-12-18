import { Address } from "viem";

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
	decimals0: number;
	decimals1: number;
	fee: string;
	range: string;
	price: string;
	liquidity: string;
}

export interface TokenInfo {
	address: Address;
	symbol: string;
	decimals: number;
}