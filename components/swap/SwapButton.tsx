import { Button } from "../ui/button";

interface SwapButtonProps {
	buttonConfig: {
		text: string;
		disabled: boolean;
	};
}
export const SwapButton = ({ buttonConfig }: SwapButtonProps) => {

	// 1. 获取当前要显示的文字
	
  // 2. 逻辑判断：如果文字不是“立即交换”或“交 换”，则认为处于错误或未就绪状态
  // 注意：这种方式比较脆弱，因为一旦修改了文字字符串，逻辑就会失效
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
		`}>
			{buttonConfig.text}
		</Button>
	);
}