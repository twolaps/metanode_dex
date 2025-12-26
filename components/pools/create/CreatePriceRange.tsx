import { TokenInfo } from "@/app/tools/types"
import { JSX, use, useEffect, useMemo, useState } from "react";
import { NoTokensPlaceholder } from "./NoTokensPlaceholder";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface CreatePriceRangeProps {
	token0: TokenInfo | null;
	token1: TokenInfo | null;
	rangeMode: string; 
	setRangeMode: (mode: string) => void;
	lower: string;
	upper: string;
	onSetLower: (lower: string) => void;
	onSetUpper: (upper: string) => void;
}

export const CreatePriceRange = ({ 
	token0,
	token1,
	rangeMode, 
	setRangeMode,
	lower,
	upper,
	onSetLower,
	onSetUpper }: CreatePriceRangeProps) => {

	const sortTokens = (a: TokenInfo, b: TokenInfo): TokenInfo[] => {
		return a.address.toLowerCase() < b.address.toLowerCase() ? [a, b] : [b, a];
	};

	const pair: TokenInfo[] = useMemo(() => {
		if (token0 && token1) {
			return sortTokens(token0, token1);
		}
		return [];
	}, [token0, token1]);

	const concContent: JSX.Element = (
		<div className="flex items-center gap-4">
			<div className="flex flex-col justify-center items-center w-1/2">
				<label className="mb-2">最低价格</label>
				<Input className="ml-2 w-50 text-center mb-2" type="number" value={lower} onChange={(e) => onSetLower(e.target.value)}></Input>
				<label className="text-sm text-gray-500">{`每${pair[0]?.symbol}兑换${pair[1]?.symbol}`}</label>
			</div>
			<div className="flex flex-col justify-center items-center w-1/2">
				<label className="mb-2">最高价格</label>
				<Input className="ml-2 w-50 text-center mb-2" type="number" value={upper} onChange={(e) => onSetUpper(e.target.value)}></Input>
				<label className="text-sm text-gray-500">{`每${pair[0]?.symbol}兑换${pair[1]?.symbol}`}</label>
			</div>
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

				{rangeMode === "concentrated" ? concContent : null}
			</div>
		);
	}

	return (
		<div>
			<h1 className="mb-2">设置价格范围</h1>
			{priceRangeJE}
			<Separator className="mt-4" />
		</div>
	)
}