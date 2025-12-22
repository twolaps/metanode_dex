import { on } from "events";
import { Button } from "../ui/button";

interface SwapButtonProps {
	buttonConfig: {
		text: string;
		disabled: boolean;
	};
	onClick: () => void;
}
export const SwapButton = ({ buttonConfig, onClick }: SwapButtonProps) => {
	console.log("SwapButton - buttonConfig:", buttonConfig);

	const onClickButton = () => {
		console.log("Swap button clicked");
		onClick();
	}
	
	return (
		<Button disabled={buttonConfig.disabled} className={`
			w-[478px]
			h-[60px]
			bg-[#6E63F2]
			text-white
			rounded-[16px]
			hover:bg-[#5a52d1]
			text-2xl
			mt-6
			
			${buttonConfig.disabled ? 'opacity-50 cursor-not-allowed' : ''} // 增加视觉反馈
		`}
			onClick={onClickButton}
			>
			{buttonConfig.text}
		</Button>
	);
}