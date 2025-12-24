import { calculateAmountsFrom0 } from "@/app/pools/tools/poolMath";
import { FormattedPoolInfo } from "@/app/tools/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatBigIntAmount } from "@/utils/format";
import { useState } from "react";
import { toast } from "sonner";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useBalance, useChainId } from "wagmi";

interface DepositAmountViewProps {
	formattedPoolInfo?: FormattedPoolInfo;
}
export const DepositAmountView = ({ formattedPoolInfo }: DepositAmountViewProps) => {

	const [amount0, setAmount0] = useState<string>('');
	const [amount1, setAmount1] = useState<string>('');

	const {address: userAddress} = useAccount();
	const chainId: number = useChainId();

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

	const handleAmount0Change = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setAmount0(val);
		
		if (!val || !formattedPoolInfo) {
				setAmount1("");
				return;
		}

		try {
				const raw0: bigint = parseUnits(val, formattedPoolInfo.tokenInfo0.decimals);
				// ✅ 调用 SDK 计算函数
				const [fixed0, calc1, msg] = calculateAmountsFrom0(raw0, formattedPoolInfo, chainId);
				
				if (msg) {
						toast.error(msg);
				}
				
				// 如果输入被修正为 0 (单边区间情况)，强制重置输入框
				if (fixed0 === 0n) setAmount0("0");
				
				setAmount1(formatUnits(calc1, formattedPoolInfo.tokenInfo1.decimals));
		} catch (err) {
				console.error(err);
		}
	};

	const handleAmount1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
	}
	
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
					<Input value={amount0} type="number" placeholder="0.0" className="border-0 outline-0 focus:ring-0 w-52 mb-4" onChange={handleAmount0Change}/>
					<h1 className="mb-4">
						余额：{formatBigIntAmount(balance0?.value || BigInt(0), formattedPoolInfo?.tokenInfo0.decimals || 18)}
					</h1>
				</div>

				<div className={rectClass}>
					<h1 className="mt-2 mb-2">{formattedPoolInfo?.tokenInfo1.symbol}</h1>
					<Input value={amount1} type="number" placeholder="0.0" className="border-0 outline-0 focus:ring-0 w-52 mb-4" onChange={handleAmount1Change}/>
					<h1 className="mb-4">
						余额：{formatBigIntAmount(balance1?.value || BigInt(0), formattedPoolInfo?.tokenInfo1.decimals || 18)}
					</h1>
				</div>

			</div>


		</div>
	)
}