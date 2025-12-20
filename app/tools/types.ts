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

export interface PairInfo {
	token0: Address;
	token1: Address;
}

export const MIN_SQRT_PRICE: bigint = BigInt("4295128739");
export const MAX_SQRT_PRICE: bigint = BigInt("1461446703485210103287273052203988822378723970342");

export enum TradeDirection {
	FROM = 'from',
	TO = 'to',
}

export enum SwapError {
    NONE = 'NONE',                          // 正常状态
    INVALID_AMOUNT = 'INVALID_AMOUNT',      // 输入了 0 或非数字
    SAME_TOKEN = 'SAME_TOKEN',              // 选了两个一样的代币
    NO_POOL = 'NO_POOL',                    // 没池子（报价前或报价后发现）
    INSUFFICIENT_LIQUIDITY = 'INSUFFICIENT_LIQUIDITY', // 池子深度不够
    INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',     // 余额不足（后续可以加）
    FETCH_FAILED = 'FETCH_FAILED'           // 网络/合约调用失败
}

export interface InQuoteInfo{
	amountIn: bigint;
	poolIndex: number;
	error: SwapError
}

export interface OutQuoteInfo{
	amountOut: bigint;
	poolIndex: number;
	error: SwapError;
}