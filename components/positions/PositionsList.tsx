import { RawPositionInfo } from "@/app/tools/types";
import { ScrollArea } from "../ui/scroll-area";
import { PositionsCard } from "./PositionsCard";

interface PositionsListProps {
	myPositions: RawPositionInfo[];
}

export const PositionsList = ({ myPositions }: PositionsListProps) => {

	return (
		<ScrollArea className="w-[1200px] h-220 mt-5 border border-input rounded-lg">
			{myPositions.map((position: RawPositionInfo) => (
				<PositionsCard key={position.id} position={position} />
			))}
		</ScrollArea>
	);
}