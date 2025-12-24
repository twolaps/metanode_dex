import { JSX } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { FormattedPoolInfo } from "@/app/tools/types";
import { Button } from "../ui/button";

interface FormattedPoolsTableProps {
	formattedPoolInfos: FormattedPoolInfo[];
	onClickDeposit: (targetPool: FormattedPoolInfo) => void;
}

export const FormattedPoolsTable = ({ formattedPoolInfos, onClickDeposit }: FormattedPoolsTableProps) => {

		const tableCells: JSX.Element[] = formattedPoolInfos.map((poolInfo) => {
		const tableCell: JSX.Element = (
			<TableRow key={poolInfo.pool}>
				<TableCell className="text-lg text-[#99A1AF] text-center w-[0px]">
					{poolInfo.tokenInfo0.symbol}/{poolInfo.tokenInfo1.symbol}
					<h1>{poolInfo.tokenInfo0.address}</h1>
					<h1>{poolInfo.tokenInfo1.address}</h1>
				</TableCell>
				<TableCell className="text-lg text-[#99A1AF] text-right w-[150px]">{poolInfo.fee}</TableCell>
				<TableCell className="text-lg text-[#99A1AF] text-right w-[150px]">{poolInfo.range}</TableCell>
				<TableCell className="text-lg text-[#99A1AF] text-right w-[150px]">{poolInfo.price} {poolInfo.tokenInfo1.symbol}</TableCell>
				<TableCell className="text-lg text-[#99A1AF] text-right w-[150px]">{poolInfo.liquidity}</TableCell>
				<TableCell className="text-center">
					<Button onClick={()=>{onClickDeposit(poolInfo)}}>存入</Button>
				</TableCell>
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
	)
}