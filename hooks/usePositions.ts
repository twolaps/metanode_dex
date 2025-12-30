import { formatPoolInfos } from "@/app/pools/tools/poolMath";
import { RawPositionInfo } from "@/app/tools/types";
import { poolManagerConfig, positionConfig } from "@/config/contracts";
import { useCallback, useEffect, useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";

export const usePositions = () => {
	const {address} = useAccount();

	const {data: allPositions, isLoading: positionsLoading, refetch: refetchPositions} = useReadContract({
		...positionConfig,
		functionName: 'getAllPositions',
	});


	const getFormattedPools = async () => {
		const formattedPools = await formatPoolInfos();
		return formattedPools;
	};

	useEffect(() => {
		const getMyPositions = async () => {
			if (!allPositions || allPositions.length === 0) {
				return [];
			}

			const allPools = await getFormattedPools();
			
			if (!allPools || allPools.length === 0) {
				return [];
			}

			return allPositions.filter((pos: RawPositionInfo) => pos.owner.toLocaleLowerCase() === address?.toLocaleLowerCase());
		};

		getMyPositions();
	}, [address, allPositions]);


	return {
		allPositions,
		myPositions,
		allPools,
		isLoading: positionsLoading || poolsLoading,
		refetchPools,
		refetchPositions,
	};
}