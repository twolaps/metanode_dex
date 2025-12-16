import { Button } from "../ui/button";

export const SwitchTokenButton = () => {
	const btnClass: string = [
		'w-10',
		'h-10',
		'bg-[#2F2C38]',
		'rounded-full',
		'flex',
		'items-center',
		'justify-center',
		'top-[160px]',
		'left-[215px]',
		'cursor-pointer',
		'hover:bg-[#3a3745]',
	].join(' ');

	return (
		<Button className={btnClass}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				className="!w-7 !h-7 text-white"
			>
				<path d="M11.9498 7.94975L10.5356 9.36396L8.00079 6.828L8.00004 20H6.00004L6.00079 6.828L3.46451 9.36396L2.05029 7.94975L7.00004 3L11.9498 7.94975ZM21.9498 16.0503L17 21L12.0503 16.0503L13.4645 14.636L16.0008 17.172L16 4H18L18.0008 17.172L20.5356 14.636L21.9498 16.0503Z" />
			</svg>
		</Button>
	);
}	