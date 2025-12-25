'use client'
import { useState } from "react";
import { FormattedPoolInfo } from "../tools/types";
import { Button } from "@/components/ui/button";
import { FormattedPoolsTable } from "@/components/pools/FormattedPoolsTable";
import { CreatePoolDialog } from "@/components/pools/create/CreatePoolDialog";
import { DepositDialog } from "@/components/pools/deposit/DepositDialog";
import { usePools } from "@/hooks/usePools";

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
			<div className="w-[1200px] flex items-end">
				<Button className="mt-4 mb-4 ml-auto mr-0 shadow-glow" onClick={onClickAddLiquidity}>创建/添加流动性</Button>
			</div>

			<FormattedPoolsTable pools={pools} onClickDeposit={onClickDeposit} />
			<CreatePoolDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
			<DepositDialog open={isDepositDialogOpen} onClose={() => setIsDepositDialogOpen(false)} formattedPoolInfo={targetPool!} refetchPools={refetchPools} />
		</div>
	);
}