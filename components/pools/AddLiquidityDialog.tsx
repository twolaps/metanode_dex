import { TokenInfo } from "@/app/tools/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { AddLiquidityToken } from "./AddLiquidityToken";

interface AddLiquidityDialogProps {
	open: boolean;
	onClose: () => void;
}

export const AddLiquidityDialog = ({ open, onClose }: AddLiquidityDialogProps) => {

	const onSelectToken0 = (token: TokenInfo) => {
		console.log("Selected token 0:", token);
	}

	const onSelectToken1 = (token: TokenInfo) => {
		console.log("Selected token 1:", token);
	}
	
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold">创建新的流动性池</DialogTitle>
					<Separator />
				</DialogHeader>

				<AddLiquidityToken index={0} onSelectToken={onSelectToken0} />
				<AddLiquidityToken index={1} onSelectToken={onSelectToken1} />
			</DialogContent>
			
		</Dialog>
	);
}