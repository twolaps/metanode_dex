import { FormattedPoolInfo } from "@/app/tools/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatBigIntAmount } from "@/utils/format";
import { useAccount, useBalance } from "wagmi";

interface DepositAmountViewProps {
	formattedPoolInfo?: FormattedPoolInfo;
}
export const DepositAmountView = ({ formattedPoolInfo }: DepositAmountViewProps) => {

	const {address: userAddress} = useAccount();

	const {data: balance0} = useBalance({
		address: userAddress,
		token: formattedPoolInfo?.tokenInfo0.address,
		query: {enabled: !!formattedPoolInfo} }
	);

	const {data: balance1} = useBalance({
		address: userAddress,
		token: formattedPoolInfo?.tokenInfo1.address,
		query: {enabled: !!formattedPoolInfo} }
	);
	
	const rectClass: string = cn(
		'border',
		'border-rounded',
		'rounded-[12px]',
		'w-full',
		'flex',
		'flex-col',
		'justify-center',
		'items-start',
		'pl-2'
	);

	return (
		<div>
			<h1>存入金额</h1>

			<div className="flex w-full gap-4 mt-2 mb-2">

				<div className={rectClass}>
					<h1 className="mt-2 mb-2">{formattedPoolInfo?.tokenInfo0.symbol}</h1>
					<Input type="number" placeholder="0.0" className="border-0 outline-0 focus:ring-0 w-52 mb-4" />
					<h1 className="mb-4">
						余额：{formatBigIntAmount(balance0?.value || BigInt(0), formattedPoolInfo?.tokenInfo0.decimals || 18)}
					</h1>
				</div>

				<div className={rectClass}>
					<h1 className="mt-2 mb-2">{formattedPoolInfo?.tokenInfo1.symbol}</h1>
					<Input type="number" placeholder="0.0" className="border-0 outline-0 focus:ring-0 w-52 mb-4" />
					<h1 className="mb-4">
						余额：{formatBigIntAmount(balance1?.value || BigInt(0), formattedPoolInfo?.tokenInfo1.decimals || 18)}
					</h1>
				</div>

			</div>


		</div>
	)
}