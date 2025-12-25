import { calculateAmountsFrom0, calculateAmountsFrom1 } from "@/app/pools/tools/poolMath";
import { FormattedPoolInfo } from "@/app/tools/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { positionConfig } from "@/config/contracts";
import { useApprove } from "@/hooks/useApprove";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { cn } from "@/lib/utils";
import { formatBigIntAmount } from "@/utils/format";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import { useAccount, useBalance, useChainId } from "wagmi";

interface DepositAmountViewProps {
	formattedPoolInfo?: FormattedPoolInfo;
	amount0: string;
	setAmount0: (value: string) => void;
	amount1: string;
	setAmount1: (value: string) => void;
}

export const DepositAmountView = ({ formattedPoolInfo, amount0, setAmount0, amount1, setAmount1 }: DepositAmountViewProps) => {

	const timer0 = useRef<ReturnType<typeof setTimeout> | null>(null);
	const timer1 = useRef<ReturnType<typeof setTimeout> | null>(null);

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

	const onChangeAmount0 = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value: string = e.target.value;
		// 允许空字符串、小数点开头或数字，仅拦截真正的非法输入
    if (value !== "" && value !== "." && (Number.isNaN(Number(value)) || Number(value) < 0)) {
        return;
    }

		setAmount0(value);
		
		if (!value || !formattedPoolInfo) {
				setAmount1("");
				return;
		}

		if (timer0.current) {
			clearTimeout(timer0.current);
		}
		timer0.current = setTimeout(() => {
			handleAmount0Change(value);
		}, 500);
	};

	const onChangeAmount1 = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value: string = e.target.value;

		// 允许空字符串、小数点开头或数字，仅拦截真正的非法输入
    if (value !== "" && value !== "." && (Number.isNaN(Number(value)) || Number(value) < 0)) {
        return;
    }

		setAmount1(value);
		
		if (!value || !formattedPoolInfo) {
				setAmount0("");
				return;
		}

		if (timer1.current) {
			clearTimeout(timer1.current);
		}
		timer1.current = setTimeout(() => {
			handleAmount1Change(value);
		}, 500);
	};

	const handleAmount0Change = (value: string) => {
		if (!formattedPoolInfo || value === ".") return;
		try {
				const raw0: bigint = parseUnits(value, formattedPoolInfo.tokenInfo0.decimals);
				// ✅ 调用 SDK 计算函数
				const [fixed0, calc1, msg] = calculateAmountsFrom0(raw0, formattedPoolInfo, chainId);
				
				if (msg) {
						toast.error(msg);
				}
				
				// 如果输入被修正为 0 (单边区间情况)，强制重置输入框
				if (fixed0 === 0n) setAmount0("0");
				
				setAmount1(formatBigIntAmount(calc1, formattedPoolInfo.tokenInfo1.decimals));
		} catch (err) {
				console.error(err);
		}
	};

	const handleAmount1Change = (value: string) => {
		if (!formattedPoolInfo || value === ".") return;
		try {
				const raw1: bigint = parseUnits(value, formattedPoolInfo.tokenInfo1.decimals);
				// ✅ 调用 SDK 计算函数
				const [calc0, fixed1, msg] = calculateAmountsFrom1(raw1, formattedPoolInfo, chainId);
				
				if (msg) {
						toast.error(msg);
				}
				
				// 如果输入被修正为 0 (单边区间情况)，强制重置输入框
				if (fixed1 === 0n) setAmount1("0");
				
				setAmount0(formatBigIntAmount(calc0, formattedPoolInfo.tokenInfo0.decimals));
		} catch (err) {
				console.error(err);
		}
	}

	useEffect(() => {
		return () => {
			if (timer0.current) {
				clearTimeout(timer0.current);
			}
			if (timer1.current) {
				clearTimeout(timer1.current);
			}
		}
	}, []);

	const renderActionButton = () => {
		if (!amount0 || !amount1 || Number(amount0) <= 0 || Number(amount1) <= 0) {
			return (
				<Button disabled className="w-full mt-4">
					请输入存入金额
				</Button>
			)
		}
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

			<div className="flex w-full gap-4 mt-2">

				<div className={rectClass}>
					<h1 className="mt-2 mb-2">{formattedPoolInfo?.tokenInfo0.symbol}</h1>
					<Input value={amount0} type="number" placeholder="0.0" className="border-0 outline-0 focus:ring-0 w-52 mb-4" onChange={onChangeAmount0}/>
					<h1 className="mb-4">
						余额：{formatBigIntAmount(balance0?.value || BigInt(0), formattedPoolInfo?.tokenInfo0.decimals || 18)}
					</h1>
				</div>

				<div className={rectClass}>
					<h1 className="mt-2 mb-2">{formattedPoolInfo?.tokenInfo1.symbol}</h1>
					<Input value={amount1} type="number" placeholder="0.0" className="border-0 outline-0 focus:ring-0 w-52 mb-4" onChange={onChangeAmount1}/>
					<h1 className="mb-4">
						余额：{formatBigIntAmount(balance1?.value || BigInt(0), formattedPoolInfo?.tokenInfo1.decimals || 18)}
					</h1>
				</div>

			</div>


		</div>
	)
}