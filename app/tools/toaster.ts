import { toast } from "sonner";
import { InQuoteInfo, OutQuoteInfo, SwapError } from "./types";

export function showQuoteToaster(error: OutQuoteInfo | InQuoteInfo) {
	if (error.error === SwapError.INSUFFICIENT_LIQUIDITY) {
		toast.error("金额过大或池子深度不足")
	}
	else if (error.error === SwapError.NO_POOL) {
		toast.error("该交易对尚未开启交易")
	}
}