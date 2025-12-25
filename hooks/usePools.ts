import { formatPoolInfos } from "@/app/pools/tools/poolMath";
import { FormattedPoolInfo } from "@/app/tools/types";
import { useCallback, useEffect, useState } from "react";

export const usePools = () => {

	const [pools, setPools] = useState<FormattedPoolInfo[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const refetchPools = useCallback(async () => {
		console.log("Refetching pools...");
		setIsLoading(true);
		try {
			const formattedPoolInfos = await formatPoolInfos();
			setPools(formattedPoolInfos);
		} catch (error) {
			console.error("Error fetching pools:", error);
		}
		finally {
			setIsLoading(false);
			console.log("Finished refetching pools.");
		}
	}, []);

	useEffect(() => {
			refetchPools();
	}, [refetchPools]);

	return { pools, isLoading, refetchPools };
};