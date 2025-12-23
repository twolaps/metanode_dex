import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
import { ChevronDown } from "lucide-react";
import { JSX, useState } from "react";
import { SUPPORTED_TOKENS, TokenInfo } from "@/app/tools/types";

interface AddLiquidityTokenProps {
	index: number;
	onSelectToken: (token: TokenInfo) => void;
}

export const AddLiquidityToken = ({ index, onSelectToken }: AddLiquidityTokenProps) => {

	const [open, setOpen] = useState(false);
	const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);

	const commandItems: JSX.Element[] = [];
	for (let i = 0; i < SUPPORTED_TOKENS.length; i++) {

		const onSelect = (index: string) => {
			console.log("Selected token:", SUPPORTED_TOKENS[parseInt(index)]);
			setOpen(false);
			setSelectedToken(SUPPORTED_TOKENS[parseInt(index)]);
			onSelectToken(SUPPORTED_TOKENS[parseInt(index)]);
		}
		const token: TokenInfo = SUPPORTED_TOKENS[i];
		commandItems.push(
			<CommandItem key={i} className="aria-selected:bg-primary!" value={`${i}`} onSelect={onSelect}>
					<h1>{token.symbol}</h1>
			</CommandItem>
		);
	}

	return (
		<div className="flex flex-col">
			<h1 className="mb-2">第{index == 0 ? "一" : "二"}个代币</h1>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger className="w-full rounded h-8 border border-gray-300 flex items-center justify-between px-3 bg-gray-800">
					<h1>{selectedToken ? selectedToken.symbol : "选择代币"}</h1>
					<ChevronDown className="ml-2"/>
				</PopoverTrigger>

				<PopoverContent className="p-0 w-[--radix-popover-trigger-width]" style={{ width: 'var(--radix-popover-trigger-width)' }} align="start">
					<Command>
						<CommandEmpty>
							暂无可选代币
						</CommandEmpty>
						<CommandGroup>
							{commandItems}
						</CommandGroup>
					</Command>
				</PopoverContent>
			</Popover>
		</div>
	);
}