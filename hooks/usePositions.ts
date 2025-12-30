import { FormattedPoolInfo, RawPositionInfo } from "@/app/tools/types";
import { positionConfig } from "@/config/contracts";
import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { usePools } from "./usePools";

export type PositionWithPoolInfo = RawPositionInfo & {
	poolInfo: FormattedPoolInfo;
}

export const usePositions = () => {
	const {address} = useAccount();

	const {data: allPositions, isLoading: positionsLoading, refetch: refetchPositions} = useReadContract({
		...positionConfig,
		functionName: 'getAllPositions',
	});

	const {pools, isLoading: poolsLoading, refetchPools} = usePools();

	const myPositions: PositionWithPoolInfo[] = useMemo(() => {
		const results: PositionWithPoolInfo[] = [];

		if (!allPositions || allPositions.length === 0) {
			return [];
		}

		if (!pools || pools.length === 0) {
			return [];
		}

		allPositions.forEach((pos: RawPositionInfo) => {
			if (pos.owner.toLowerCase() === address?.toLowerCase()) {
				const pool = pools.find((pool: FormattedPoolInfo) => {
					if ((pos.token0.toLowerCase() === pool.tokenInfo0.address.toLowerCase() && 
							pos.token1.toLowerCase() === pool.tokenInfo1.address.toLowerCase() ||
							pos.token0.toLowerCase() === pool.tokenInfo1.address.toLowerCase() &&
							pos.token1.toLowerCase() === pool.tokenInfo0.address.toLowerCase()) &&
							pos.index === pool.rawPoolInfo.index) {
						return true;
					}
					return false;
				});

				if (pool !== undefined) {
					results.push({...pos, poolInfo: pool});
				}
			}
		});

		return results;
	}, [address, allPositions, pools]);

	const refetchPositionPools = async () => {
		await refetchPositions();
		await refetchPools();
	};

	return {
		myPositions,
		isLoading: positionsLoading || poolsLoading,
		refetchPositionPools,
	};
}