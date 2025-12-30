import { ScrollArea } from "../ui/scroll-area";
import { PositionsCard } from "./PositionsCard";
import { PositionWithPoolInfo } from "@/hooks/usePositions";

interface PositionsListProps {
	myPositions: PositionWithPoolInfo[];
	refetch: () => void;
}

export const PositionsList = ({ myPositions, refetch }: PositionsListProps) => {
	console.log("PositionsList - myPositions:", myPositions);
	return (
		<ScrollArea className="w-[1200px] h-[880px] mt-5 border border-input rounded-lg">
			{myPositions.map((position: PositionWithPoolInfo) => (
				<PositionsCard key={position.id} position={position} refetch={refetch} />
			))}
		</ScrollArea>
	);
}