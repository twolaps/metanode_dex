'use client'
import { useState } from "react";
import { FormattedPoolInfo } from "../tools/types";
import { Button } from "@/components/ui/button";
import { FormattedPoolsTable } from "@/components/pools/FormattedPoolsTable";
import { CreatePoolDialog } from "@/components/pools/create/CreatePoolDialog";
import { DepositDialog } from "@/components/pools/deposit/DepositDialog";
import { usePools } from "@/hooks/usePools";
import { titleClass } from "@/config/styles";
import { cn } from "@/lib/utils";

export default function PoolsPage() {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
	const [isDepositDialogOpen, setIsDepositDialogOpen] = useState<boolean>(false);
	const [targetPool, setTargetPool] = useState<FormattedPoolInfo | null>(null);
	const { pools, refetchPools } = usePools();

	const onClickAddLiquidity = () => {
		console.log("Add Liquidity button clicked");
		setIsCreateDialogOpen(true);
	}

	const onClickDeposit = (targetPool: FormattedPoolInfo) => {
		setTargetPool(targetPool);
		setIsDepositDialogOpen(true);
	}

	return (
		<div className="flex flex-col items-center">
			<div className="w-[1200px] mt-10 mb-4 flex justify-between">
				<div className="invisible">啊啊啊啊啊</div>
				<h1 className={titleClass}>
					Pools
				</h1>
				<div>
					<Button className="mt-4 mb-4 ml-auto mr-0 shadow-glow" onClick={onClickAddLiquidity}>创建池子</Button>
				</div>
			</div>

			<FormattedPoolsTable pools={pools} onClickDeposit={onClickDeposit} />
			<CreatePoolDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} refetchPools={refetchPools}/>
			<DepositDialog open={isDepositDialogOpen} onClose={() => setIsDepositDialogOpen(false)} formattedPoolInfo={targetPool!} refetchPools={refetchPools} />
		</div>
	);
}