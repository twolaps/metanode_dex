import { Button } from "../ui/button";

export const SwapButton = () => {
	return (
		<Button className={`
			w-[478px]
			h-[60px]
			bg-[#6E63F2]
			text-white
			rounded-[16px]
			hover:bg-[#5a52d1]
			text-2xl
			mt-6
		`}>
			交  换
		</Button>
	);
}