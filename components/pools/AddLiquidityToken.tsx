import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "../ui/command";
import { ChevronDown } from "lucide-react";
import { JSX, useState } from "react";
import { SUPPORTED_TOKENS, TokenInfo } from "@/app/tools/types";
import { shortenAddress } from "@/utils/format";
import { toast } from "sonner";

interface AddLiquidityTokenProps {
	index: number;
	anotherToken: TokenInfo | null;
	onSelectToken: (token: TokenInfo) => void;
}

export const AddLiquidityToken = ({ index, anotherToken, onSelectToken }: AddLiquidityTokenProps) => {
	const [open, setOpen] = useState(false);
	const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);

	const	commandItems: JSX.Element[] = SUPPORTED_TOKENS.map((tokenInfo: TokenInfo)=>{
		return (<CommandItem 
			key={tokenInfo.symbol}
			className="aria-selected:bg-primary!"
			value={tokenInfo.symbol}
			onSelect={()=>{
				console.log("Selected token:", tokenInfo);
				setOpen(false);
				if (anotherToken && tokenInfo.address === anotherToken.address) {
					toast.error("请选择不同的代币。");
					return;
				}
				setSelectedToken(tokenInfo);
				onSelectToken(tokenInfo);
			}}>
				<div className="flex justify-between w-full">
					<h1>{tokenInfo.symbol}</h1>
					<h1>({shortenAddress(tokenInfo.address)})</h1>
				</div>
				
		</CommandItem>);
	});

	return (
		<div className="flex flex-col w-full">
			<h1 className="mb-2">代币{index == 0 ? "A" : "B"}</h1>
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