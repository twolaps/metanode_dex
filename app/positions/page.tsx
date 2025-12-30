'use client';
import { PositionsList } from "@/components/positions/PositionsList";
import { titleClass } from "@/config/styles";
import { usePositions } from "@/hooks/usePositions";

export default function PositionsPage() {

	const {myPositions, isLoading, refetchPositionPools} = usePositions();

	return (
		<div className="flex flex-col items-center w-full mt-5">
			<h1 className={titleClass}>Positions</h1>
			{/* <PositionOverview /> */}
			{isLoading ? (
				<p className="mt-10 text-lg">数据加载中...</p>
			) : (
				<PositionsList myPositions={myPositions} refetch={refetchPositionPools} />
			)}
		</div>
	);
}