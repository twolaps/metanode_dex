'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPoolInfos } from "./tools/poolMath";
import { JSX, useEffect, useState } from "react";
import { FormattedPoolInfo } from "../tools/types";
import { Button } from "@/components/ui/button";
import { AddLiquidityDialog } from "@/components/pools/AddLiquidityDialog";

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
	
	const tableCells: JSX.Element[] = formattedPoolInfos.map((poolInfo) => {
		const tableCell: JSX.Element = (
			<TableRow key={poolInfo.pool}>
				<TableCell className="text-lg text-[#99A1AF] text-center w-[0px]">{poolInfo.token0}/{poolInfo.token1}</TableCell>
				<TableCell className="text-lg text-[#99A1AF] text-right w-[150px]">{poolInfo.fee}</TableCell>
				<TableCell className="text-lg text-[#99A1AF] text-right w-[150px]">{poolInfo.range}</TableCell>
				<TableCell className="text-lg text-[#99A1AF] text-right w-[150px]">{poolInfo.price} {poolInfo.token1}</TableCell>
				<TableCell className="text-lg text-[#99A1AF] text-right w-[150px]">{poolInfo.liquidity}</TableCell>
			</TableRow>)
			return tableCell;
	});

	console.log(tableCells.length)

	return (
		<div className="flex flex-col items-center">
			<div className="w-[1200px] flex items-end">
				<Button className="mt-4 mb-4 ml-auto mr-0" onClick={onClickAddLiquidity}>添加流动性</Button>
			</div>
			
			<div className="w-[1200px] max-h-[1000px] overflow-y-auto m-auto">
				<Table className="w-[1150px] m-auto mt-10">
					<TableHeader>
						<TableRow>
							<TableHead className="text-[#99A1AF] text-2xl font-bold text-center w-[0px]">交易对</TableHead>
							<TableHead className="text-[#99A1AF] text-2xl font-bold text-right w-[150px]">费率</TableHead>
							<TableHead className="text-[#99A1AF] text-2xl font-bold text-right w-[150px]">价格范围</TableHead>
							<TableHead className="text-[#99A1AF] text-2xl font-bold text-right w-[150px]">价格</TableHead>
							<TableHead className="text-[#99A1AF] text-2xl font-bold text-right w-[150px]">流动性</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{tableCells}
					</TableBody>
				</Table>
			</div>

			<AddLiquidityDialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
		</div>
	);
}