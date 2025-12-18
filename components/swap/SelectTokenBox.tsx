import { ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Command, CommandEmpty, CommandGroup } from "../ui/command";
import { useEffect } from "react";
import { getSwapTokenMap } from "@/app/tools/swapMath";

export const SelectTokenBox = () => {
	const btnClass: string = [
		'mt-4',
		'w-[120px]',
		'h-10',
		'bg-[#6E63F2]',
		'text-white',
		'rounded-[8px]',
		'hover:bg-[#5a52d1]',
		'absolute',
		'right-2',
	].join(' ');

	return (
		<Popover open={true}>
			<PopoverTrigger asChild>
				<Button className={btnClass}>
					选择代币
					<ChevronsUpDown />
				</Button>
			</PopoverTrigger>

			<PopoverContent>
				<Command>
					<CommandEmpty>
						暂无可选代币
					</CommandEmpty>

					<CommandGroup>
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>);
}