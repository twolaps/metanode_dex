import { PositionWithPoolInfo } from "@/hooks/usePositions";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { getPositionAmounts } from "@/app/pools/tools/poolMath";
import { useAccount, useChainId } from "wagmi";
import { JSX, useEffect } from "react";
import { Button } from "../ui/button";
import { useCollect } from "@/hooks/useCollect";
import { formatUnits, isAddress } from "viem";
import { useBurn } from "@/hooks/useBurn";

interface PositionsCardProps {
	position: PositionWithPoolInfo;
	refetch: () => void;
}
export const PositionsCard = ({ position, refetch }: PositionsCardProps) => {

	const {address} = useAccount();
	const chainId = useChainId();
	const {amount0Str, amount1Str} = getPositionAmounts(position, position.poolInfo, chainId);
	const {collect, isPending: isCollectingPending, isCollecting, isSuccess: isCollectSuccess} = useCollect();
	const {burn, isPending: isBurnPending, isBurning, isSuccess: isBurnSuccess} = useBurn();

	const onClickCollect = () => {
		console.log("Reward button clicked for position ID:", position.id);
		if (address && isAddress(address)) {
			collect(position.id, address!);
		}
	}

	const onClickBurn = () => {
		try {
			burn(position.id);
		}
		catch (error) {
			console.error("Error initiating burn:", error);
		}
	}

	useEffect(() => {
		if (isCollectSuccess) {
			refetch();
		}

		if (isBurnSuccess) {
			refetch();
		}
	}, [isCollectSuccess, isBurnSuccess, refetch]);



	const oweJSX: JSX.Element[] = [];
	if (position.token0.toLowerCase() === position.poolInfo.tokenInfo0.address.toLowerCase()) {
		oweJSX.push(<div key="owed0">{formatUnits(position.tokensOwed0, position.poolInfo.tokenInfo0.decimals)} {position.poolInfo.tokenInfo0.symbol}</div>);
		oweJSX.push(<div key="owed1">{formatUnits(position.tokensOwed1, position.poolInfo.tokenInfo1.decimals)} {position.poolInfo.tokenInfo1.symbol}</div>);
	} else {
		oweJSX.push(<div key="owed1">{formatUnits(position.tokensOwed1, position.poolInfo.tokenInfo0.decimals)} {position.poolInfo.tokenInfo0.symbol}</div>);
		oweJSX.push(<div key="owed0">{formatUnits(position.tokensOwed0, position.poolInfo.tokenInfo1.decimals)} {position.poolInfo.tokenInfo1.symbol}</div>);
	}

	return (
		<div className="flex flex-col h-auto ml-5 mr-5 my-5 border-b border-input bg-input rounded-lg">
			<Badge variant="default" className="text-lg ml-5 mt-3 mb-3">{position.poolInfo.tokenInfo0.symbol} - {position.poolInfo.tokenInfo1.symbol}</Badge>
			<div className="flex items-center">
				<Badge variant="outline" className="ml-5">头寸ID: {position.id}</Badge>
				<div className="text-md ml-10 text-gray-500">费率: {position.poolInfo.fee}</div>
			</div>
			<Separator className="my-3" />

			<div className="ml-5 flex items-start gap-32 mb-5">
				<div className="flex flex-col justify-center items-center">
					<div>价格区间</div>
					<div>{position.poolInfo.range}</div>
					<div className="invisible">站位用</div>
					<div>当前价格</div>
					<div>每{position.poolInfo.tokenInfo0.symbol} = {position.poolInfo.price} {position.poolInfo.tokenInfo1.symbol}</div>
				</div>

				<div className="flex flex-col justify-start items-center">
					<div>当前资产构成</div>
					<div>{amount0Str} {position.poolInfo.tokenInfo0.symbol}</div>
					<div>{amount1Str} {position.poolInfo.tokenInfo1.symbol}</div>
				</div>

				<div className="flex flex-col justify-start items-center">
					<div>待领取收益</div>
					{oweJSX}
				</div>

				<div className="flex flex-col justify-start">
					<Button 
						className="mb-5" 
						disabled={(position.tokensOwed0 === BigInt(0) && position.tokensOwed1 === BigInt(0)) || isCollecting || isCollectingPending} 
						onClick={onClickCollect}>
							{isCollecting || isCollectingPending ? '领取中...' : '领取收益'}
					</Button>
					<Button variant="destructive" disabled={(position.liquidity === BigInt(0)) || isBurnPending || isBurning} className="mb-5" onClick={onClickBurn}>
						{isBurning || isBurnPending ? '移除中...' : '移除流动性'}
					</Button>
				</div>
			</div>
		</div>
	)
}