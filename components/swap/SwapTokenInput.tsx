import { Input } from "@/components/ui/input"
import { Button } from "../ui/button";

interface SwapTokenInputProps {
	fromOrTo: 'from' | 'to';
	mt: number;
	mb: number;
}

export const SwapTokenInput = ({ fromOrTo, mt, mb }: SwapTokenInputProps) => {<Input type="text" placeholder="Enter text..." />

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
		<div className={`w-full flex items-center flex-col mt-${mt} mb-${mb}`}>
			<h1 className="text-[#99A1AF] text-base mr-auto ml-5 mb-2">{fromOrTo === 'from' ? '从' : '到'}</h1>
			<div className="flex relative">
				<Input type="number" placeholder="0.0000" className={inputClass} />
				<Button className={btnClass}>选择代币</Button>
			</div>
		</div>
	);
}