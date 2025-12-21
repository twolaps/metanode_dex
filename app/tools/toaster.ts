import { toast } from "sonner";
import { SwapStatus } from "./types";

export function showQuoteToaster(error: SwapStatus) {
	if (error === SwapStatus.INSUFFICIENT_LIQUIDITY) {
		toast.error("金额过大或池子深度不足")
	}
	else if (error === SwapStatus.NO_POOL) {
		toast.error("该交易对尚未开启交易")
	}
	else if (error === SwapStatus.INSUFFICIENT_BALANCE) {
		toast.error("余额不足")
	}
}