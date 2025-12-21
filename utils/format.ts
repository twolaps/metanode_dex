import { Address } from "viem";

export function shortenAddress(address: Address, chars = 4): string {
	return `${address.substring(0, chars + 2)}...${address.substring(
		address.length - chars,
		address.length,
	)}`;
}