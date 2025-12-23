'use client'
import { formatPoolInfos } from "./tools/poolMath";
import { useEffect, useState } from "react";
import { FormattedPoolInfo } from "../tools/types";
import { Button } from "@/components/ui/button";
import { AddLiquidityDialog } from "@/components/pools/AddLiquidityDialog";
import { FormattedPoolsTable } from "@/components/pools/FormattedPoolsTable";

export default function PoolsPage() {
	const [formattedPoolInfos, setFormattedPoolInfos] = useState<FormattedPoolInfo[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

	const onClickAddLiquidity = () => {
		console.log("Add Liquidity button clicked");
		setIsDialogOpen(true);
	}

	useEffect(() => {
		const fetchAndFormatPools = async () => {
			const formattedPoolInfos = await formatPoolInfos();
			setFormattedPoolInfos(formattedPoolInfos);
		}

		fetchAndFormatPools();
	}, []);
	

	return (
		<div className="flex flex-col items-center">
			<div className="w-[1200px] flex items-end">
				<Button className="mt-4 mb-4 ml-auto mr-0" onClick={onClickAddLiquidity}>创建/添加流动性</Button>
			</div>
			
			<FormattedPoolsTable formattedPoolInfos={formattedPoolInfos} />
			<AddLiquidityDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
		</div>
	);
}