import { TokenInfo } from "@/app/tools/types"
import { JSX } from "react";
import { NoTokensPlaceholder } from "./NoTokensPlaceholder";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CreatePriceRangeProps {
	token0: TokenInfo | null;
	token1: TokenInfo | null;
	rangeMode: string; 
	setRangeMode: (mode: string) => void;
}

export const CreatePriceRange = ({ token0, token1, rangeMode, setRangeMode }: CreatePriceRangeProps) => {


	const concentratedContent: JSX.Element = (
		<div>
			集中区间价格范围设置的内容将在此处显示。
		</div>);

	let priceRangeJE: JSX.Element;
	if(!token0 || !token1) {
		priceRangeJE = (
			<NoTokensPlaceholder />
		);
	}
	else {
		priceRangeJE = (
			<div>
				<Tabs value={rangeMode} onValueChange={setRangeMode} className="w-full mb-3">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger className="data-[state=active]:!bg-primary data-[state=active]:!shadow-glow" value="full">全区间 (Full Range)</TabsTrigger>
						<TabsTrigger className="data-[state=active]:!bg-primary data-[state=active]:!shadow-glow" value="concentrated">集中区间 (Concentrated)</TabsTrigger>
					</TabsList>
				</Tabs>

				{rangeMode === "concentrated" ? concentratedContent : null}
			</div>
		);
	}

	return (
		<div>
			<h1 className="mb-2">设置价格范围</h1>
			{priceRangeJE}
		</div>
	)
}