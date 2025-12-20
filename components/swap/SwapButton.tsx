import { Button } from "../ui/button";

interface SwapButtonProps {
	getButtonText?: () => string;
}
export const SwapButton = ({ getButtonText }: SwapButtonProps) => {

	// 1. 获取当前要显示的文字
  const text = getButtonText ? getButtonText() : '立即兑换';
  
  // 2. 逻辑判断：如果文字不是“立即交换”或“交 换”，则认为处于错误或未就绪状态
  // 注意：这种方式比较脆弱，因为一旦修改了文字字符串，逻辑就会失效
  const isDisabled = text !== '立即兑换' && text !== '兑换';
	return (
		<Button disabled={isDisabled} className={`
			w-[478px]
			h-[60px]
			bg-[#6E63F2]
			text-white
			rounded-[16px]
			hover:bg-[#5a52d1]
			text-2xl
			mt-6
			
			${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} // 增加视觉反馈
		`}>
			{text}
		</Button>
	);
}