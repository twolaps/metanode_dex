import { ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
import { TokenInfo } from "@/app/tools/types";
import { Address } from "viem";
import { JSX, useState } from "react";
import { shortenAddress } from "@/utils/format";

interface SelectTokenBoxProps {
	selectableTokensMap: Map<Address, TokenInfo>;
	onTokenSelect?: (token: TokenInfo) => void;
	selectedToken?: TokenInfo | null;
	setToken?: (token: TokenInfo | null) => void;
}

export const SelectTokenBox = ({ selectableTokensMap, onTokenSelect, selectedToken, setToken }: SelectTokenBoxProps) => {
	const [open, setOpen] = useState(false);

	const btnClass: string = [
		'mt-4',
		'w-[120px]',
		'h-10',
		'rounded-[8px]',
		'absolute',
		'right-2',
	].join(' ');

	const tokensArray: TokenInfo[] = Array.from(selectableTokensMap.values());
	tokensArray.sort((a, b) => a.symbol.localeCompare(b.symbol));

	const onSelect = (token: TokenInfo) => {
		if (onTokenSelect) {
			onTokenSelect(token);
		}

		if (setToken) {
			setToken(token);
		}
		
		setOpen(false);
	}


	const commandItems: JSX.Element[] = [];

	tokensArray.forEach((token) => {

		if (token.symbol === "UNKNOWN") {
			return;
		}
		
		const commandItem: JSX.Element = (
			<CommandItem 
				key={token.address}
				onSelect={() => onSelect(token)}>

				<div className="flex justify-between w-full">
					<h1>{token.symbol}</h1>
					<h1 className="text-gray-500">({shortenAddress(token.address)})</h1>
				</div>
			</CommandItem>);

		commandItems.push(commandItem);
	});

	const selectTokenSymbol: string = selectedToken ? selectedToken.symbol : "选择代币";
		
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button className={btnClass}>
					{selectTokenSymbol}
					<ChevronsUpDown />
				</Button>
			</PopoverTrigger>

			<PopoverContent>
				<Command>
					<CommandEmpty>
						暂无可选代币
					</CommandEmpty>

					<CommandGroup>
						{commandItems}
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>);
}