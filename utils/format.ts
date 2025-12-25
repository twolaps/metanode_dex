import { Address, formatUnits } from "viem";

export function shortenAddress(address: Address, chars = 4): string {
	return `${address.substring(0, chars + 2)}...${address.substring(
		address.length - chars,
		address.length,
	)}`;
}

export function formatBigIntAmount(amountBigInt: bigint, decimals: number = 18, precision: number = 6): string {

	const format: Intl.NumberFormat = new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: precision,
		useGrouping: false,
	});
	return format.format(Number(formatUnits(amountBigInt, decimals)));
}