'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { poolManagerConfig } from "@/config/contracts";
import { useReadContract } from "wagmi";
import { formatPoolInfos, FormattedPoolInfo, RawPoolInfo } from "./tools/poolMath";
import { JSX, useEffect, useState } from "react";

export default function PoolsPage() {
	const [formattedPoolInfos, setFormattedPoolInfos] = useState<FormattedPoolInfo[]>([]);

	const {data: poolData} = useReadContract({
		...poolManagerConfig,
		functionName: "getAllPools",
	});

	useEffect(() => {
		const fetchAndFormatPools = async () => {
			const formattedPoolInfos = await formatPoolInfos(poolData as RawPoolInfo[]);
			setFormattedPoolInfos(formattedPoolInfos);
		}

		if (poolData){
			fetchAndFormatPools();
		};
		
	}, [poolData]);
	
	console.log("Formatted Pool Infos:", formattedPoolInfos);



	const tableCells: JSX.Element[] = formattedPoolInfos.map((poolInfo) => {
		const tableCell: JSX.Element = (
			<TableRow key={poolInfo.pool}>
				<TableCell className="text-lg text-[#99A1AF]">{poolInfo.token0}/{poolInfo.token1}</TableCell>
				<TableCell className="text-lg text-[#99A1AF]">1%</TableCell>
				<TableCell className="text-lg text-[#99A1AF]">100-200</TableCell>
				<TableCell className="text-lg text-[#99A1AF]">$250.00</TableCell>
				<TableCell className="text-lg text-[#99A1AF]">100</TableCell>
			</TableRow>)
			return tableCell;
	});

	return (
		<div className="w-[1200px] max-h-[1000px] overflow-y-auto m-auto">
			<Table className="w-[1150px] m-auto mt-10">
				<TableHeader>
					<TableRow>
						<TableHead className="text-[#99A1AF] text-2xl font-bold">交易对</TableHead>
						<TableHead className="text-[#99A1AF] text-2xl font-bold">费率</TableHead>
						<TableHead className="text-[#99A1AF] text-2xl font-bold">价格范围</TableHead>
						<TableHead className="text-[#99A1AF] text-2xl font-bold">价格</TableHead>
						<TableHead className="text-[#99A1AF] text-2xl font-bold">流动性</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{tableCells}
				</TableBody>
			</Table>
		</div>
		
	);
}