import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Separator } from "../../ui/separator";
import { FormattedPoolInfo } from "@/app/tools/types";
import { DepositFeeGroup } from "./DepositFeeGroup";
import { DepositPriceRange } from "./DepositPriceRange";
import { DepositTokenView } from "./DepositTokenView";
import { DepositAmountView } from "./DepositAmountView";
import { DialogDescription } from "@radix-ui/react-dialog";

interface DepositDialogProps {
	open: boolean;
	onClose: () => void;
	formattedPoolInfo: FormattedPoolInfo
}

export const DepositDialog = ({ open, onClose, formattedPoolInfo }: DepositDialogProps) => {

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
				<DepositAmountView formattedPoolInfo={formattedPoolInfo}/>
			</DialogContent>
		</Dialog>
	);
}