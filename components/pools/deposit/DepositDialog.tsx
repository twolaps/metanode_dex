import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Separator } from "../../ui/separator";
import { FormattedPoolInfo } from "@/app/tools/types";
import { DepositFeeGroup } from "./DepositFeeGroup";
import { DepositPriceRange } from "./DepositPriceRange";
import { DepositTokenView } from "./DepositTokenView";
import { DepositAmountView } from "./DepositAmountView";
import { DialogDescription } from "@radix-ui/react-dialog";
import { JSX, useEffect, useState } from "react";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { positionConfig } from "@/config/contracts";
import { useApprove } from "@/hooks/useApprove";
import { Button } from "@/components/ui/button";

interface DepositDialogProps {
	open: boolean;
	onClose: () => void;
	formattedPoolInfo: FormattedPoolInfo
}

export const DepositDialog = ({ open, onClose, formattedPoolInfo }: DepositDialogProps) => {

	const [amount0, setAmount0] = useState<string>('');
	const [amount1, setAmount1] = useState<string>('');

	const [direction, setDirection] = useState<'0to1' | '1to0'>('0to1');

	const {needsApprove: needsApprove0, refetch: refetchAllowance0} = useTokenAllowance(
		formattedPoolInfo?.tokenInfo0,
		amount0,
		positionConfig.address);

	const {needsApprove: needsApprove1, refetch: refetchAllowance1} = useTokenAllowance(
		formattedPoolInfo?.tokenInfo1,
		amount1,
		positionConfig.address);

	const {approve: approve0, isLoading: isApproving0, isSuccess: isApproveSuccess0} = useApprove(
		formattedPoolInfo?.tokenInfo0.address,
		positionConfig.address);

	const {approve: approve1, isLoading: isApproving1, isSuccess: isApproveSuccess1} = useApprove(
		formattedPoolInfo?.tokenInfo1.address,
		positionConfig.address);

	const onClickApprove = async () => {
		if (needsApprove0) {
			await approve0();
			refetchAllowance0();
		}

		if (needsApprove1) {
			await approve1();
			refetchAllowance1();
		}
	}

	const onClickDeposit = () => {
		//to deposit logic
		onClose();
	}

	const renderActionButton = (): JSX.Element => {
		let button: JSX.Element;

		if (!amount0 || !amount1 || Number(amount0) <= 0 || Number(amount1) <= 0) {
			button = (
				<Button disabled className="w-full h-12 mt-3 mb-3 bg-gray-200 text-gray-500 rounded-lg">
					请输入存入金额
				</Button>
			);
		}
		else if (needsApprove0 || needsApprove1) {
			button = (
				<Button 
					disabled={isApproving0 || isApproving1} 
					onClick={onClickApprove} 
					className="w-full h-12 mt-3 mb-3 text-lg rounded-lg shadow-glow">
					{isApproving0 ? '批准中...' : '批 准 '}
				</Button>
			)
		}
		else {
			button = (
				<Button 
					onClick={onClickDeposit} 
					className="w-full h-12 mt-3 mb-3 text-lg rounded-lg shadow-glow">
					确 认 存 入
				</Button>
			)	
		}
		
		return button;
	}

	useEffect(() => {
		if (isApproveSuccess0) {
			refetchAllowance0();
		}

		if (isApproveSuccess1) {
			refetchAllowance1();
		}
		//eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isApproveSuccess0, isApproveSuccess1]);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="bg-card p-4 rounded-lg">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">
						{`存入 ${formattedPoolInfo?.tokenInfo0.symbol}/${formattedPoolInfo?.tokenInfo1.symbol}(${formattedPoolInfo?.fee})`}
					</DialogTitle>
					<DialogDescription className="sr-only">
					</DialogDescription>
					<Separator />
				</DialogHeader>

				<DepositTokenView formattedPoolInfo={formattedPoolInfo} />
				<DepositFeeGroup feeTier={formattedPoolInfo?.rawPoolInfo.fee} />
				<DepositPriceRange formattedPoolInfo={formattedPoolInfo} />
				<DepositAmountView 
					formattedPoolInfo={formattedPoolInfo} 
					amount0={amount0}
					setAmount0={setAmount0}
					amount1={amount1}
					setAmount1={setAmount1} />
				{renderActionButton()}
			</DialogContent>
		</Dialog>
	);
}