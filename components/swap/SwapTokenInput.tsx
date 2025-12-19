import { Input } from "@/components/ui/input"
import { SelectTokenBox } from "./SelectTokenBox";
import { TokenInfo } from "@/app/tools/types";
import { Address } from "viem";

interface SwapTokenInputProps {
	fromOrTo: 'from' | 'to';
	mt: number;
	mb: number;
	selectableTokensMap: Map<Address, TokenInfo>;
	selectedToken: TokenInfo | null;
	setToken: (token: TokenInfo | null) => void;
}

export const SwapTokenInput = ({ fromOrTo, mt, mb, selectableTokensMap, selectedToken, setToken }: SwapTokenInputProps) => {<Input type="text" placeholder="Enter text..." />

	let canInput: boolean = false;
	if (selectedToken) {
		canInput = true;
	}

	const inputClass: string = [
		'w-[478px]',
		'h-[75px]',
		'bg-white',
		'rounded-[8px]',
		'border',
		'border-[#2F2C38]',
		'px-4',
		'text-black',
		'!text-3xl',
		'placeholder:text-[#555555]',
		'focus:outline-none',
		'focus:ring-0',
		
	].join(' ');

	const onTokenSelect = (token: TokenInfo) => {
		console.log("Selected token in SwapTokenInput:", token);
	}

	return (
		<div className={`w-full flex items-center flex-col mt-${mt} mb-${mb}`}>
			<h1 className="text-[#99A1AF] text-base mr-auto ml-5 mb-2">{fromOrTo === 'from' ? '从' : '到'}</h1>
			<div className="flex relative">
				<Input type="number" disabled={!canInput} placeholder="0.0000" className={inputClass} />
				<SelectTokenBox selectableTokensMap={selectableTokensMap} onTokenSelect={onTokenSelect} selectedToken={selectedToken} setToken={setToken} />
			</div>
		</div>
	);
}