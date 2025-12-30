import { RawPositionInfo } from "@/app/tools/types";

interface PositionsCardProps {
	position: RawPositionInfo;
}
export const PositionsCard = ({ position }: PositionsCardProps) => {
	return (
		<div className="h-20 ml-5 mr-5 my-5 border-b border-input bg-input rounded-lg">
		</div>
	)
}