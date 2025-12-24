import { FormattedPoolInfo } from "@/app/tools/types";
import { Separator } from "@/components/ui/separator";

interface DepositTokenViewProps {
	formattedPoolInfo: FormattedPoolInfo;
}
export const DepositTokenView = ({ formattedPoolInfo }: DepositTokenViewProps) => {
		return (
				<div>
					<h1>代币信息（已锁定）</h1>
					<div className="w-full flex justify-between gap-4 mb-4">

						<div className="w-full flex flex-col gap-1">
							<h1>代币A</h1>
							<div className="border rounded-border rounded-[10px] w-full h-10 flex justify-center items-center ">
								<h1>{formattedPoolInfo?.tokenInfo0.symbol}</h1>
							</div>
						</div>

						<div className="w-full flex flex-col gap-1">
							<h1>代币B</h1>
							<div className="border rounded-border rounded-[10px] w-full h-10 flex justify-center items-center ">
								<h1>{formattedPoolInfo?.tokenInfo1.symbol}</h1>
							</div>
						</div>
					</div>
					<Separator />
				</div>
		)
}