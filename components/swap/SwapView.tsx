import { SwapButton } from "./SwapButton";
import { SwapTokenInput } from "./SwapTokenInput";
import { SwitchTokenButton } from "./SwitchTokenButton";

export default function SwapView() {

	const titleClass: string = [
		'w-fit',
		'text-5xl',
		'font-bold',
		'bg-gradient-to-r',
		'from-[#6E63F2]',
		'to-[#F166BB]',
		'bg-clip-text',
		'text-transparent',
		'text-[36px]',
	].join(' ');

	const descriptionClass: string = [
		'w-fit',
		'text-base',
		'mt-2',
		'text-[#99A1AF]',
	].join(' ');

	const radiusRectClass: string = [
		'w-[545px]',
		'h-[400px]',
		'bg-[#1E1B27]',
		'rounded-[16px]',
		'flex',
		'items-center',
		'px-4',
		'mb-4',
		'border',
		'border-[#2F2C38]',
		'mt-2',
		'flex-col',
		'relative',
	].join(' ');

	return (
		<div className="
			w-[550px]
			h-[409px]
			mx-auto
			my-[35px]">
			<h1 className={titleClass}>
				交易
			</h1>
			<h3 className={descriptionClass}>
				选择代币进行兑换
			</h3>

			<div className={radiusRectClass}>
				<SwapTokenInput fromOrTo="from" mt={6} mb={4} />
				<SwitchTokenButton />
				<SwapTokenInput fromOrTo="to" mt={0} mb={0} />
				<SwapButton />
			</div>
			
		</div>
	);
}