'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { poolManagerConfig } from "@/config/contracts";
import { useReadContract } from "wagmi";
import { formatPoolInfos, FormattedPoolInfo, RawPoolInfo } from "./tools/poolMath";
import { JSX, useEffect, useState } from "react";
import { stringify } from "viem";

export default function PoolsPage() {
	const [formattedPoolInfos, setFormattedPoolInfos] = useState<FormattedPoolInfo[]>([]);

	const {data: poolData} = useReadContract({
		...poolManagerConfig,
		functionName: "getAllPools",
	});

	console.log();
	console.log("poolData:", stringify(poolData));

	useEffect(() => {
		const fetchAndFormatPools = async () => {
			const formattedPoolInfos = await formatPoolInfos(poolData as RawPoolInfo[]);
			setFormattedPoolInfos(formattedPoolInfos);
		}

		if (poolData){
			fetchAndFormatPools();
		};
		
	}, [poolData]);
	
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

	return (
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
		
	);
}