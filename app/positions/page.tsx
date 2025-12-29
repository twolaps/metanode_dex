import { PositionOverview } from "@/components/positions/PositionOverview";
import { titleClass } from "@/config/styles";

export default function PositionsPage() {
	return (
		<div className="flex flex-col items-center w-full mt-5">
			<h1 className={titleClass}>Positions</h1>
			<PositionOverview />
		</div>
	);
}