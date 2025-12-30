'use client';
import { PositionOverview } from "@/components/positions/PositionOverview";
import { PositionsList } from "@/components/positions/PositionsList";
import { titleClass } from "@/config/styles";
import { usePositions } from "@/hooks/usePositions";

export default function PositionsPage() {

	const {allPositions, myPositions, isLoading, refetchPositions} = usePositions();

	return (
		<div className="flex flex-col items-center w-full mt-5">
			<h1 className={titleClass}>Positions</h1>
			<PositionOverview />
			<PositionsList myPositions={myPositions} />
		</div>
	);
}