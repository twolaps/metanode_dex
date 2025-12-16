'use client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { poolManagerConfig } from "@/config/contracts";
import { useReadContract } from "wagmi";

export default function PoolsPage() {
	const {data: poolData} = useReadContract({
		...poolManagerConfig,
		functionName: "getAllPools",
	});
	
	return (
		<div>

			<Table className="w-[1120px] m-auto mt-10">

				<TableHeader>
					<TableRow>
						<TableHead className="text-[#99A1AF] text-2xl">交易对</TableHead>
						<TableHead className="text-[#99A1AF] text-2xl">费率</TableHead>
						<TableHead className="text-[#99A1AF] text-2xl">价格范围</TableHead>
						<TableHead className="text-[#99A1AF] text-2xl">价格</TableHead>
						<TableHead className="text-[#99A1AF] text-2xl">流动性</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					<TableRow>
						<TableCell className="text-lg text-[#99A1AF]">INV001</TableCell>
						<TableCell className="text-lg text-[#99A1AF']">1%</TableCell>
						<TableCell className="text-lg text-[#99A1AF]">100-200</TableCell>
						<TableCell className="text-lg text-[#99A1AF]">$250.00</TableCell>
						<TableCell className="text-lg text-[#99A1AF]">100</TableCell>
					</TableRow>
				</TableBody>


			</Table>

		</div>
		
	);
}