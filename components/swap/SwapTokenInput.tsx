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
	onAmountChange: (amount: string) => void;
	amount: string;
	balance: string
}

export const SwapTokenInput = ({
	fromOrTo,
	mt,
	mb,
	selectableTokensMap,
	selectedToken,
	setToken,
	onAmountChange,
	amount,
	balance
}: SwapTokenInputProps) => {

	let canInput: boolean = false;
	if (selectedToken) {
		canInput = true;
	}

	const inputClass: string = [
		'w-full',
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
		<div className={`w-full flex items-start flex-col mt-${mt} mb-${mb}`}>
			<div className={`w-[100%] flex justify-between`}>
				<h1 className="text-[#99A1AF] text-base">{fromOrTo === 'from' ? '从' : '到'}</h1>
				<h1 className="text-[#99A1AF] text-base">余额：{balance}</h1>
			</div>
			
			<div className="flex relative w-full">
				<Input value={amount} onChange={(e) => onAmountChange(e.target.value)} type="number" disabled={!canInput} placeholder="0.000000" className={inputClass} />
				<SelectTokenBox selectableTokensMap={selectableTokensMap} onTokenSelect={onTokenSelect} selectedToken={selectedToken} setToken={setToken} />
			</div>
		</div>
	);
}