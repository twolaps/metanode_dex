import { Address, formatUnits } from "viem";

export function shortenAddress(address: Address, chars = 4): string {
	return `${address.substring(0, chars + 2)}...${address.substring(
		address.length - chars,
		address.length,
	)}`;
}

export function formatBigIntAmount(amountBigInt: bigint, decimals: number = 18, precision: number = 6): string {
	return Number(formatUnits(amountBigInt, decimals)).toFixed(precision);
}